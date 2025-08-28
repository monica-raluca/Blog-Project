// Category management utilities

export const DEFAULT_CATEGORY = 'General';

// Get saved custom categories from localStorage
export const getSavedCategories = (): string[] => {
	try {
		const saved = localStorage.getItem('article_categories');
		const categories = saved ? JSON.parse(saved) : [DEFAULT_CATEGORY];
		// Ensure General is always first
		if (!categories.includes(DEFAULT_CATEGORY)) {
			return [DEFAULT_CATEGORY, ...categories];
		}
		return categories;
	} catch {
		return [DEFAULT_CATEGORY];
	}
};

// Save category to localStorage
export const saveCategory = (category: string): void => {
	try {
		const current = getSavedCategories();
		const trimmedCategory = category.trim();
		if (!current.includes(trimmedCategory) && trimmedCategory && trimmedCategory !== DEFAULT_CATEGORY) {
			// Add new category, but keep General first
			const otherCategories = current.filter(cat => cat !== DEFAULT_CATEGORY);
			const updated = [DEFAULT_CATEGORY, ...otherCategories, trimmedCategory];
			localStorage.setItem('article_categories', JSON.stringify(updated));
		}
	} catch {
		// Silently fail if localStorage is not available
	}
};

// Remove category from localStorage if no articles use it
export const cleanupCategory = (categoryToRemove: string, allArticles: Array<{ category?: string }>): void => {
	try {
		// Don't remove the default category
		if (categoryToRemove === DEFAULT_CATEGORY || !categoryToRemove) {
			return;
		}

		// Check if any other articles use this category
		const categoryInUse = allArticles.some(article => 
			(article.category || DEFAULT_CATEGORY) === categoryToRemove
		);

		// If no articles use this category, remove it from localStorage
		if (!categoryInUse) {
			const current = getSavedCategories();
			const updated = current.filter(cat => cat !== categoryToRemove);
			localStorage.setItem('article_categories', JSON.stringify(updated));
		}
	} catch {
		// Silently fail if localStorage is not available
	}
};

// Remove unused categories by checking all provided articles
export const cleanupUnusedCategories = (allArticles: Array<{ category?: string }>): void => {
	try {
		const current = getSavedCategories();
		const usedCategories = new Set([DEFAULT_CATEGORY]); // Always keep General
		
		// Collect all categories currently in use
		allArticles.forEach(article => {
			const category = article.category || DEFAULT_CATEGORY;
			usedCategories.add(category);
		});

		// Filter out unused categories
		const updated = current.filter(cat => usedCategories.has(cat));
		
		// Update localStorage if anything changed
		if (updated.length !== current.length) {
			localStorage.setItem('article_categories', JSON.stringify(updated));
		}
	} catch {
		// Silently fail if localStorage is not available
	}
};