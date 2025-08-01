import React, { useContext, useState } from 'react';
import { ArticleControlsContext } from './Layout';
import { SortCriteria } from '../api/types';
import '../format/TopBar.css';

interface SortField {
  label: string;
  value: string;
}

const SORT_FIELDS: SortField[] = [
  { label: 'Date', value: 'createdDate' },
  { label: 'Title', value: 'title' },
  { label: 'Author', value: 'author' },
];

const PAGE_SIZES: number[] = [5, 10, 20, 50];

const TopBar: React.FC = () => {
  const context = useContext(ArticleControlsContext);
  
  if (!context) {
    throw new Error('TopBar must be used within ArticleControlsContext');
  }

  const {
    filtersInput, setFiltersInput, filters, setFilters,
    sortCriteria, setSortCriteria, pageSize, setPageSize, pageIndex, setPageIndex, sizeInput, setSizeInput
  } = context;

  const [localSort, setLocalSort] = useState<SortCriteria[]>(sortCriteria);
  const [expanded, setExpanded] = useState<boolean>(false);

  // Handle sort field toggle
  const handleSortToggle = (field: string): void => {
    const exists = localSort.find(sc => sc.field === field);
    let updated: SortCriteria[];
    if (exists) {
      updated = localSort.filter(sc => sc.field !== field);
    } else {
      updated = [...localSort, { field, direction: 'ASC' }];
    }
    setLocalSort(updated);
    setSortCriteria(updated);
  };

  // Handle sort direction toggle
  const handleSortDirection = (field: string): void => {
    const updated = localSort.map(sc =>
      sc.field === field ? { ...sc, direction: (sc.direction === 'ASC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC' } : sc
    );
    setLocalSort(updated);
    setSortCriteria(updated);
  };

  // Filter pills
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFiltersInput({ ...filtersInput, [e.target.name]: e.target.value });
  };
  
  const applyFilters = (): void => setFilters(filtersInput);
  
  const clearFilters = (): void => {
    setFiltersInput({ title: '', author: '' });
    setFilters({ title: '', author: '' });
  };

  // Pagination
  const currentPage = pageIndex + 1;
  const totalPages = 50;
  const goToPrev = (): void => setPageIndex(Math.max(0, pageIndex - 1));
  const goToNext = (): void => setPageIndex(pageIndex + 1);
  
  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) setPageIndex(val - 1);
  };
  
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setPageSize(Number(e.target.value));
    setPageIndex(0);
  };

  return (
    <div
      className={`topbar-root dynamic-island${expanded ? ' expanded' : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
      tabIndex={0}
    >
      {!expanded && (
        <div className="island-collapsed">
          <span className="island-dot" />
          <span className="island-label">Show controls</span>
        </div>
      )}
      {expanded && (
        <>
          <div className="topbar-section">
            <span className="topbar-label">Sort by:</span>
            {SORT_FIELDS.map(sf => {
              const active = localSort.find(sc => sc.field === sf.value);
              return (
                <label key={sf.value} className={`topbar-sort-pill${active ? ' active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!active}
                    onChange={() => handleSortToggle(sf.value)}
                  />
                  {sf.label}
                  {active && (
                    <button
                      className="topbar-sort-dir"
                      type="button"
                      onClick={() => handleSortDirection(sf.value)}
                      title="Toggle direction"
                    >
                      {active.direction === 'ASC' ? '↑ Asc' : '↓ Desc'}
                    </button>
                  )}
                </label>
              );
            })}
          </div>
          <div className="topbar-section">
            <span className="topbar-label">Filter:</span>
            <input
              className="topbar-filter-pill"
              type="text"
              name="title"
              placeholder="Title"
              value={filtersInput.title || ''}
              onChange={handleFilterChange}
            />
            <input
              className="topbar-filter-pill"
              type="text"
              name="author"
              placeholder="Author"
              value={filtersInput.author || ''}
              onChange={handleFilterChange}
            />
            <button className="topbar-btn" onClick={applyFilters}>Apply</button>
            <button className="topbar-btn clear" onClick={clearFilters}>Clear</button>
          </div>
          <div className="topbar-section topbar-pagination">
            <button className="topbar-btn" onClick={goToPrev} disabled={pageIndex === 0}>&lt;</button>
            <span className="topbar-page-label">
              Page <input
                type="number"
                min="1"
                value={currentPage}
                onChange={handlePageInput}
                className="topbar-page-input"
              />
            </span>
            <button className="topbar-btn" onClick={goToNext}>&gt;</button>
            <select className="topbar-page-size" value={pageSize} onChange={handlePageSizeChange}>
              {PAGE_SIZES.map(size => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default TopBar; 