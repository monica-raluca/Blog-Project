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
// Styles converted to soft Tailwind CSS
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
      className={`!w-auto !min-w-[320px] !max-w-[700px] !mx-auto !mt-[18px] !mb-0 !z-[5] !text-[0.98em] !relative !top-[10px] !transition-all !duration-[550ms] !ease-[cubic-bezier(0.4,1.6,0.4,1)] !overflow-hidden !cursor-pointer ${
        expanded 
          ? '!min-h-0 !h-auto !p-[12px_24px_8px_24px] !rounded-[32px] !bg-white/90 !backdrop-blur-xl !shadow-[0_8px_32px_0_rgba(34,34,64,0.13),0_1.5px_8px_0_rgba(234,181,209,0.10)] !flex !flex-wrap !items-center !justify-between !gap-[10px]'
          : '!min-h-[28px] !h-[28px] !max-w-[220px] !p-[0_18px] !rounded-[32px] !bg-white/85 !backdrop-blur-md !shadow-[0_8px_32px_0_rgba(34,34,64,0.13),0_1.5px_8px_0_rgba(234,181,209,0.10)] !flex !items-center !justify-center'
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
      tabIndex={0}
    >
      {!expanded && (
        <div className="!flex !items-center !gap-[10px] !w-full !justify-center">
          <span className="!w-[10px] !h-[10px] !bg-gradient-to-[135deg] !from-[#eab5d1] !to-[#b2e0f7] !rounded-full !mr-[6px] !shadow-[0_0_12px_#eab5d1,0_0_8px_#b2e0f7]"></span>
          <span className="!text-[#270023] !text-[1em] !font-medium !opacity-80 !tracking-[0.01em]">Show controls</span>
        </div>
      )}
      {expanded && (
        <>
          <div className="!flex !items-center !gap-[10px] !flex-wrap">
            <span className="!font-semibold !text-[#162938] !text-[1em] !mr-[4px]">Sort by:</span>
            {SORT_FIELDS.map(sf => {
              const active = localSort.find(sc => sc.field === sf.value);
              return (
                <Label key={sf.value} className={`!text-[0.98em] !rounded-[14px] !px-[10px] !py-[4px] !transition-all !duration-200 !border-[1.5px] !cursor-pointer ${
                  active 
                    ? '!bg-gradient-to-[135deg] !from-[#eab5d1] !to-[#b2e0f7] !text-white !border-[#270023]' 
                    : '!bg-white/70 !border-[#eab5d1] !shadow-[0_1px_4px_rgba(234,181,209,0.10)]'
                }`}>
                  <input
                    type="checkbox"
                    checked={!!active}
                    onChange={() => handleSortToggle(sf.value)}
                    className="!sr-only"
                  />
                  {sf.label}
                  {active && (
                    <Button
                      type="button"
                      onClick={() => handleSortDirection(sf.value)}
                      title="Toggle direction"
                      className="!ml-[4px] !text-[1em] !px-[2px] !py-0 !rounded-[8px] !bg-white/70 !text-[#270023] !border-none !cursor-pointer !transition-all !duration-200 !shadow-[0_1px_4px_rgba(234,181,209,0.10)] hover:!bg-white"
                    >
                      {active.direction === 'ASC' ? '↑ Asc' : '↓ Desc'}
                    </Button>
                  )}
                </Label>
              );
            })}
          </div>
          <div className="!flex !items-center !gap-[10px] !flex-wrap">
            <span className="!font-semibold !text-[#162938] !text-[1em] !mr-[4px]">Filter:</span>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={filtersInput.title || ''}
              onChange={handleFilterChange}
              className="!text-[0.98em] !rounded-[14px] !px-[10px] !py-[4px] !bg-white/70 !border-[1.5px] !border-[#eab5d1] !shadow-[0_1px_4px_rgba(234,181,209,0.10)] !transition-all !duration-200 focus:!border-[#270023] focus:!outline-none focus:!bg-white"
            />
            <input
              type="text"
              name="author"
              placeholder="Author"
              value={filtersInput.author || ''}
              onChange={handleFilterChange}
              className="!text-[0.98em] !rounded-[14px] !px-[10px] !py-[4px] !bg-white/70 !border-[1.5px] !border-[#eab5d1] !shadow-[0_1px_4px_rgba(234,181,209,0.10)] !transition-all !duration-200 focus:!border-[#270023] focus:!outline-none focus:!bg-white"
            />
            <Button variant="topbar" size="cozy" onClick={applyFilters}>Apply</Button>
            <Button variant="cloud" size="cozy" onClick={clearFilters}>Clear</Button>
          </div>
          <div className="!flex !items-center !gap-[6px] !flex-wrap">
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
                  <span className="!text-[0.98em] !mx-[4px]">
                    Page <input
                      type="number"
                      min="1"
                      value={currentPage}
                      onChange={handlePageInput}
                      className="!w-[36px] !px-[6px] !py-[2px] !rounded-[10px] !text-[0.98em] !border-[1.2px] !border-[#eab5d1] !bg-white/70 !text-[#270023] !transition-all !duration-200 !shadow-[0_1px_4px_rgba(234,181,209,0.10)] focus:!border-[#270023] focus:!outline-none focus:!bg-white"
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
              className="!min-w-[120px] !px-[10px] !py-[4px] !rounded-[14px] !text-[0.98em] !ml-[4px] !bg-white/70 !border-[1.5px] !border-[#eab5d1]"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TopBar; 