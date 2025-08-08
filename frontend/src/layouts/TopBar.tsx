import React, { useContext, useState } from 'react';
import { ArticleControlsContext } from './Layout';
import { SortCriteria } from '../api/types';
import { Button } from '@/components/ui/button';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import '../format/TopBar.css';
import { Label } from '@/components/ui/label';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';

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

const PAGE_SIZE_OPTIONS: ComboboxOption[] = PAGE_SIZES.map(size => ({
  value: size.toString(),
  label: `${size} per page`,
}));

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
  
  const handlePageSizeChange = (value: string): void => {
    setPageSize(Number(value));
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
                <Label key={sf.value} className={`topbar-sort-pill${active ? ' active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!active}
                    onChange={() => handleSortToggle(sf.value)}
                  />
                  {sf.label}
                  {active && (
                    <Button
                      className="topbar-sort-dir"
                      type="button"
                      onClick={() => handleSortDirection(sf.value)}
                      title="Toggle direction"
                    >
                      {active.direction === 'ASC' ? '↑ Asc' : '↓ Desc'}
                    </Button>
                  )}
                </Label>
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
            <Button variant="topbar" size="cozy" onClick={applyFilters}>Apply</Button>
            <Button variant="cloud" size="cozy" onClick={clearFilters}>Clear</Button>
          </div>
          <div className="topbar-section topbar-pagination">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPrev();
                    }}
                    style={{ 
                      pointerEvents: pageIndex === 0 ? 'none' : 'auto',
                      opacity: pageIndex === 0 ? 0.5 : 1 
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="topbar-page-label">
                    Page <input
                      type="number"
                      min="1"
                      value={currentPage}
                      onChange={handlePageInput}
                      className="topbar-page-input"
                    />
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToNext();
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <Combobox
              options={PAGE_SIZE_OPTIONS}
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
              placeholder="Page size"
              className="topbar-page-size min-w-[120px]"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TopBar; 