import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select';

interface FontSizeOption {
  id: string;
  name: string;
  size: string;
  category: string;
}

const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  // Small sizes
  { id: 'xs', name: 'Extra Small', size: '12px', category: 'Small' },
  { id: 'sm', name: 'Small', size: '14px', category: 'Small' },
  
  // Regular sizes
  { id: 'base', name: 'Regular', size: '16px', category: 'Regular' },
  { id: 'md', name: 'Medium', size: '18px', category: 'Regular' },
  { id: 'lg', name: 'Large', size: '20px', category: 'Regular' },
  
  // Large sizes
  { id: 'xl', name: 'Extra Large', size: '24px', category: 'Large' },
  { id: '2xl', name: '2X Large', size: '28px', category: 'Large' },
  { id: '3xl', name: '3X Large', size: '32px', category: 'Large' },
  { id: '4xl', name: '4X Large', size: '36px', category: 'Large' },
  
  // Display sizes
  { id: '5xl', name: '5X Large', size: '48px', category: 'Display' },
  { id: '6xl', name: '6X Large', size: '60px', category: 'Display' },
  { id: '7xl', name: '7X Large', size: '72px', category: 'Display' },
  { id: '8xl', name: '8X Large', size: '96px', category: 'Display' },
  { id: '9xl', name: '9X Large', size: '128px', category: 'Display' }
];

interface FontSizeSelectorProps {
  selectedSize?: string;
  onSizeChange: (fontSize: string) => void;
  disabled?: boolean;
}

export default function FontSizeSelector({
  selectedSize = 'base',
  onSizeChange,
  disabled = false 
}: FontSizeSelectorProps) {
  const selectedSizeOption = FONT_SIZE_OPTIONS.find(size => size.id === selectedSize) || FONT_SIZE_OPTIONS[2]; // Default to 'base'

  const handleSizeChange = (sizeId: string) => {
    const selectedOption = FONT_SIZE_OPTIONS.find(size => size.id === sizeId);
    if (selectedOption) {
      onSizeChange(selectedOption.size);
    }
  };

  const groupedSizes = FONT_SIZE_OPTIONS.reduce((groups, size) => {
    const category = size.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(size);
    return groups;
  }, {} as Record<string, FontSizeOption[]>);

  return (
    <Select
      value={selectedSizeOption.id}
      onValueChange={handleSizeChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-32 h-8 text-xs">
        <SelectValue placeholder="Font Size">
          <span className="flex items-center gap-2">
            <span style={{ fontSize: '12px' }}>A</span>
            <span className="text-xs">{selectedSizeOption.name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-80 overflow-y-auto">
        {Object.entries(groupedSizes).map(([category, sizes]) => (
          <SelectGroup key={category}>
            <SelectLabel className="text-xs font-semibold text-gray-600 px-2 py-1">
              {category}
            </SelectLabel>
            {sizes.map((sizeOption) => (
              <SelectItem 
                key={sizeOption.id} 
                value={sizeOption.id}
                className="cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">{sizeOption.name}</span>
                  <span 
                    className="text-gray-500 ml-2 text-xs"
                    style={{ fontSize: Math.min(parseInt(sizeOption.size), 14) + 'px' }}
                  >
                    {sizeOption.size}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

export { FONT_SIZE_OPTIONS };
export type { FontSizeOption };