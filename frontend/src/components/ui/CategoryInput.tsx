import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
}

export const CategoryInput: React.FC<CategoryInputProps> = ({
  value,
  onChange,
  suggestions = [],
  placeholder = "Enter or select a category...",
  className = "",
  disabled = false,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input value
  useEffect(() => {
    if (value.trim()) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(suggestions);
    }
  }, [value, suggestions]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (newValue.trim()) {
      setIsOpen(true);
    }
    setHighlightedIndex(-1);
  };

  // Handle input blur - set to default if empty
  const handleInputBlur = () => {
    setTimeout(() => {
      // Use timeout to allow for dropdown clicks
      if (!value.trim()) {
        onChange('General');
      }
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        } else {
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show suggestions when input gets focus if there are suggestions
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  // Focus input when opening dropdown
  const handleToggleDropdown = () => {
    if (!disabled) {
      if (!isOpen && suggestions.length > 0) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative z-10">
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            className
          )}
        />
        
        {/* Dropdown Toggle Button */}
        <button
          type="button"
          onClick={handleToggleDropdown}
          disabled={disabled}
          className={cn(
            "absolute right-2 top-1/2 transform -translate-y-1/2",
            "p-1 hover:bg-gray-100 rounded",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform duration-200",
              isOpen && "transform rotate-180"
            )}
          />
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto overflow-x-hidden"
        >
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur from firing
                  handleSuggestionClick(suggestion);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-gray-100",
                  "flex items-center gap-2 cursor-pointer",
                  index === highlightedIndex && "bg-blue-50 text-blue-900",
                  value === suggestion && "bg-blue-100 text-blue-900"
                )}
              >
                <Tag className="w-3 h-3 text-gray-400" />
                <span className="flex-1">{suggestion}</span>
                {value === suggestion && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))
          ) : (
            value.trim() && value.trim() !== 'General' && (
              <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                <Tag className="w-3 h-3" />
                <span>Press Enter to use "{value}"</span>
              </div>
            )
          )}
        </div>
      )}



      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default CategoryInput;