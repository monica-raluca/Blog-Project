import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ColorOption {
  value: string;
  label: string;
  preview: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  { value: '#000000', label: 'Black', preview: '#000000' },
  { value: '#333333', label: 'Dark Gray', preview: '#333333' },
  { value: '#666666', label: 'Gray', preview: '#666666' },
  { value: '#999999', label: 'Light Gray', preview: '#999999' },
  { value: '#ffffff', label: 'White', preview: '#ffffff' },
  { value: '#ff0000', label: 'Red', preview: '#ff0000' },
  { value: '#00ff00', label: 'Green', preview: '#00ff00' },
  { value: '#0000ff', label: 'Blue', preview: '#0000ff' },
  { value: '#ffff00', label: 'Yellow', preview: '#ffff00' },
  { value: '#ff00ff', label: 'Magenta', preview: '#ff00ff' },
  { value: '#00ffff', label: 'Cyan', preview: '#00ffff' },
  { value: '#ffa500', label: 'Orange', preview: '#ffa500' },
  { value: '#800080', label: 'Purple', preview: '#800080' },
  { value: '#008000', label: 'Dark Green', preview: '#008000' },
  { value: '#000080', label: 'Navy', preview: '#000080' },
  { value: '#800000', label: 'Maroon', preview: '#800000' },
];

interface ColorSelectorProps {
  value?: string;
  onValueChange: (color: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ColorSelector({
  value,
  onValueChange,
  placeholder = "Select color",
  disabled = false
}: ColorSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-28">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {COLOR_OPTIONS.map((color) => (
          <SelectItem key={color.value} value={color.value}>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: color.preview }}
              />
              <span>{color.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}