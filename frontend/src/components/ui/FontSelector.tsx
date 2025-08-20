import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Type } from 'lucide-react';

interface FontOption {
  id: string;
  name: string;
  family: string;
  category: string;
}

const FONT_OPTIONS: FontOption[] = [
  // Sans-serif fonts
  { id: 'system', name: 'System Default', family: 'system-ui, -apple-system, sans-serif', category: 'Sans-serif' },
  { id: 'arial', name: 'Arial', family: 'Arial, sans-serif', category: 'Sans-serif' },
  { id: 'helvetica', name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', category: 'Sans-serif' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif', category: 'Sans-serif' },
  { id: 'opensans', name: 'Open Sans', family: '"Open Sans", sans-serif', category: 'Sans-serif' },
  { id: 'lato', name: 'Lato', family: 'Lato, sans-serif', category: 'Sans-serif' },
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif', category: 'Sans-serif' },
  
  // Serif fonts
  { id: 'times', name: 'Times New Roman', family: '"Times New Roman", Times, serif', category: 'Serif' },
  { id: 'georgia', name: 'Georgia', family: 'Georgia, serif', category: 'Serif' },
  { id: 'garamond', name: 'Garamond', family: 'Garamond, serif', category: 'Serif' },
  { id: 'merriweather', name: 'Merriweather', family: 'Merriweather, serif', category: 'Serif' },
  { id: 'playfair', name: 'Playfair Display', family: '"Playfair Display", serif', category: 'Serif' },
  
  // Monospace fonts
  { id: 'mono', name: 'Monospace', family: 'monospace', category: 'Monospace' },
  { id: 'courier', name: 'Courier New', family: '"Courier New", Courier, monospace', category: 'Monospace' },
  { id: 'menlo', name: 'Menlo', family: 'Menlo, Monaco, "Courier New", monospace', category: 'Monospace' },
  { id: 'consolas', name: 'Consolas', family: 'Consolas, "Courier New", monospace', category: 'Monospace' },
  { id: 'firacode', name: 'Fira Code', family: '"Fira Code", "Courier New", monospace', category: 'Monospace' },
  
  // Display fonts
  { id: 'impact', name: 'Impact', family: 'Impact, "Arial Black", sans-serif', category: 'Display' },
  { id: 'comicsans', name: 'Comic Sans MS', family: '"Comic Sans MS", cursive', category: 'Display' },
  { id: 'brush', name: 'Brush Script', family: '"Brush Script MT", cursive', category: 'Display' },
  { id: 'papyrus', name: 'Papyrus', family: 'Papyrus, fantasy', category: 'Display' },
];

interface FontSelectorProps {
  selectedFont?: string;
  onFontChange: (fontFamily: string) => void;
  disabled?: boolean;
}

export default function FontSelector({ 
  selectedFont = 'system', 
  onFontChange,
  disabled = false 
}: FontSelectorProps) {
  const selectedFontOption = FONT_OPTIONS.find(font => font.id === selectedFont) || FONT_OPTIONS[0];

  const handleFontChange = (fontId: string) => {
    console.log('FontSelector: Font ID selected:', fontId); // Debug log
    const selectedOption = FONT_OPTIONS.find(font => font.id === fontId);
    console.log('FontSelector: Font option found:', selectedOption); // Debug log
    if (selectedOption) {
      console.log('FontSelector: Calling onFontChange with:', selectedOption.family); // Debug log
      onFontChange(selectedOption.family);
    }
  };

  const groupedFonts = FONT_OPTIONS.reduce((groups, font) => {
    const category = font.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(font);
    return groups;
  }, {} as Record<string, FontOption[]>);

  return (
    <Select 
      value={selectedFont} 
      onValueChange={handleFontChange}
      disabled={disabled}
    >
      <SelectTrigger className="h-8 px-2 text-xs border-gray-300 hover:bg-gray-50 w-auto min-w-32">
        <div className="flex items-center gap-1">
          <Type size={12} />
          <SelectValue placeholder={selectedFontOption.name} />
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-80 overflow-y-auto">
        {Object.entries(groupedFonts).map(([category, fonts]) => (
          <SelectGroup key={category}>
            <SelectLabel className="text-xs font-medium text-gray-500">
              {category}
            </SelectLabel>
            {fonts.map((font) => (
              <SelectItem
                key={font.id}
                value={font.id}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: font.family }}>{font.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">Aa</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

// Export font families for use in other components
export { FONT_OPTIONS };