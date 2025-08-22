import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, X } from 'lucide-react';
import './ColorPickerSlider.css';

export interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  showClearButton?: boolean;
}

// Base hue palette - pure colors at full saturation
const BASE_HUE_PALETTE = [
  { hue: 0, color: '#ff0000', name: 'Red' },
  { hue: 15, color: '#ff4000', name: 'Red-Orange' },
  { hue: 30, color: '#ff8000', name: 'Orange' },
  { hue: 45, color: '#ffbf00', name: 'Yellow-Orange' },
  { hue: 60, color: '#ffff00', name: 'Yellow' },
  { hue: 75, color: '#bfff00', name: 'Yellow-Green' },
  { hue: 90, color: '#80ff00', name: 'Green-Yellow' },
  { hue: 105, color: '#40ff00', name: 'Light Green' },
  { hue: 120, color: '#00ff00', name: 'Green' },
  { hue: 135, color: '#00ff40', name: 'Green-Cyan' },
  { hue: 150, color: '#00ff80', name: 'Cyan-Green' },
  { hue: 165, color: '#00ffbf', name: 'Light Cyan' },
  { hue: 180, color: '#00ffff', name: 'Cyan' },
  { hue: 195, color: '#00bfff', name: 'Sky Blue' },
  { hue: 210, color: '#0080ff', name: 'Light Blue' },
  { hue: 225, color: '#0040ff', name: 'Blue-Cyan' },
  { hue: 240, color: '#0000ff', name: 'Blue' },
  { hue: 255, color: '#4000ff', name: 'Blue-Violet' },
  { hue: 270, color: '#8000ff', name: 'Violet' },
  { hue: 285, color: '#bf00ff', name: 'Purple-Violet' },
  { hue: 300, color: '#ff00ff', name: 'Magenta' },
  { hue: 315, color: '#ff00bf', name: 'Pink-Magenta' },
  { hue: 330, color: '#ff0080', name: 'Pink' },
  { hue: 345, color: '#ff0040', name: 'Red-Pink' },
];

// Grayscale colors
const GRAYSCALE_PALETTE = [
  '#000000', '#1a1a1a', '#333333', '#4d4d4d', 
  '#666666', '#808080', '#999999', '#b3b3b3', 
  '#cccccc', '#e6e6e6', '#f3f3f3', '#ffffff'
];

// Helper function to validate hex color (requires complete 6-digit hex)
const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

// Helper function to check if hex is partially valid (for UI feedback)
const isPartialHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{0,6}$/i.test(color);
};

// Helper function to get contrasting text color
const getContrastColor = (hexColor: string): string => {
  if (!isValidHexColor(hexColor)) return '#000000';
  
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Helper function to convert HSL to RGB
const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  if (s === 0) {
    return [l, l, l]; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
};

// Helper function to convert RGB to hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Helper function to convert HSL to hex
const hslToHex = (h: number, s: number, l: number): string => {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
};

// Helper function to convert hex to HSL
const hexToHsl = (hex: string): [number, number, number] => {
  if (!isValidHexColor(hex)) return [0, 0, 0];
  
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

export default function ColorPicker({
  value = '',
  onChange,
  onClear,
  placeholder = 'Select color',
  disabled = false,
  showClearButton = true,
}: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHue, setSelectedHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [isInteracting, setIsInteracting] = useState(false);
  const [previewColor, setPreviewColor] = useState<string>('');

  useEffect(() => {
    setHexInput(value);
    setPreviewColor(''); // Clear preview when value changes from outside
    if (value && isValidHexColor(value)) {
      const [h, s, l] = hexToHsl(value);
      setSelectedHue(h);
      setSaturation(s);
      setLightness(l);
    }
  }, [value]);

  // Global mouse up listener to handle slider interaction outside the slider area
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isInteracting) {
        setIsInteracting(false);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isInteracting) {
        setIsInteracting(false);
      }
    };

    if (isInteracting) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isInteracting]);

  const currentHslColor = previewColor || hslToHex(selectedHue, saturation, lightness);

  const handleColorSelect = (color: string) => {
    setHexInput(color);
    
    // If we're in preview mode, update preview; otherwise apply immediately
    if (previewColor) {
      setPreviewColor(color);
    } else {
      onChange(color);
    }
    
    if (isValidHexColor(color)) {
      const [h, s, l] = hexToHsl(color);
      setSelectedHue(h);
      setSaturation(s);
      setLightness(l);
    }
    // Don't close popup when selecting colors
  };

  const handleHueSelect = (hue: number) => {
    setSelectedHue(hue);
    const newColor = hslToHex(hue, saturation, lightness);
    setHexInput(newColor);
    
    // If we have a preview color, update it; otherwise update the main color
    if (previewColor) {
      setPreviewColor(newColor);
    } else {
      onChange(newColor);
    }
    // Don't close popup when selecting hue
  };

  const handleSaturationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSaturation = parseInt(e.target.value);
    setSaturation(newSaturation);
    const newColor = hslToHex(selectedHue, newSaturation, lightness);
    setHexInput(newColor);
    
    // If we have a preview color, update it; otherwise update the main color
    if (previewColor) {
      setPreviewColor(newColor);
    } else {
      onChange(newColor);
    }
  };

  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLightness = parseInt(e.target.value);
    setLightness(newLightness);
    const newColor = hslToHex(selectedHue, saturation, newLightness);
    setHexInput(newColor);
    
    // If we have a preview color, update it; otherwise update the main color
    if (previewColor) {
      setPreviewColor(newColor);
    } else {
      onChange(newColor);
    }
  };

  const handleSliderInteractionStart = () => {
    setIsInteracting(true);
  };

  const handleSliderInteractionEnd = () => {
    setIsInteracting(false);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setHexInput(inputValue);
    
    // Update preview color and sliders in real-time if valid hex
    if (isValidHexColor(inputValue)) {
      setPreviewColor(inputValue);
      // Update sliders to match the preview color
      const [h, s, l] = hexToHsl(inputValue);
      setSelectedHue(h);
      setSaturation(s);
      setLightness(l);
    } else {
      setPreviewColor('');
    }
    // Don't auto-apply on change, wait for Apply button or Enter
  };

  const handleHexInputBlur = () => {
    if (!isValidHexColor(hexInput) && hexInput !== '') {
      // Reset to last valid value if invalid
      setHexInput(value);
    }
  };

  const handleApplyHex = () => {
    if (isValidHexColor(hexInput)) {
      onChange(hexInput);
      const [h, s, l] = hexToHsl(hexInput);
      setSelectedHue(h);
      setSaturation(s);
      setLightness(l);
      setPreviewColor(''); // Clear preview after applying
    }
  };

  const handleHexKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyHex();
    }
  };

  const handleClear = () => {
    setHexInput('');
    onChange('');
    setSelectedHue(0);
    setSaturation(100);
    setLightness(50);
    setPreviewColor('');
    if (onClear) {
      onClear();
    }
    setIsOpen(false);
  };

  const currentColor = isValidHexColor(value) ? value : currentHslColor;
  const hasColor = value && isValidHexColor(value);

  const handleOpenChange = (open: boolean) => {
    // Don't close if user is actively interacting with sliders
    if (!open && isInteracting) {
      return;
    }
    setIsOpen(open);
    
    // Reset hex input and preview when closing without applying
    if (!open && hexInput !== value) {
      setHexInput(value);
      setPreviewColor('');
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-8 px-2 gap-1 min-w-[120px] justify-start"
        >
          <div className="flex items-center gap-2">
            {hasColor ? (
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: currentColor }}
              />
            ) : (
              <Palette className="w-4 h-4" />
            )}
            <span className="text-xs">
              {hasColor ? value.toUpperCase() : placeholder}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-4" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Color Picker</Label>
            <div className="flex items-center gap-1">
              {showClearButton && hasColor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-6 w-6 p-0"
                  title="Clear color"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
                title="Close color picker"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Current color preview */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div
                className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center text-sm font-mono shadow-sm"
                style={{ 
                  backgroundColor: isValidHexColor(value) ? value : hslToHex(0, 0, 50),
                  color: getContrastColor(isValidHexColor(value) ? value : hslToHex(0, 0, 50))
                }}
              >
                Aa
              </div>
              {previewColor && (
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-blue-400 flex items-center justify-center text-sm font-mono shadow-md"
                    style={{ 
                      backgroundColor: currentHslColor,
                      color: getContrastColor(currentHslColor)
                    }}
                  >
                    Aa
                  </div>
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded">
                    Preview
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">
                {previewColor ? (
                  <>
                    <div>Current: {(isValidHexColor(value) ? value : hslToHex(0, 0, 50)).toUpperCase()}</div>
                    <div className="text-blue-600">Preview: {currentHslColor.toUpperCase()}</div>
                  </>
                ) : (
                  currentHslColor.toUpperCase()
                )}
              </div>
              <div className="text-xs text-gray-500">
                HSL({selectedHue}, {saturation}%, {lightness}%)
              </div>
            </div>
          </div>

          {/* Base Hue Palette */}
          <div className="space-y-2">
            <Label className="text-xs">Base Colors</Label>
            <div className="grid grid-cols-12 gap-1">
              {BASE_HUE_PALETTE.map((hue, index) => (
                <button
                  key={index}
                  type="button"
                  className={`
                    w-6 h-6 rounded border-2 transition-all hover:scale-105 focus:scale-105 focus:outline-none shadow-sm
                    ${Math.abs(selectedHue - hue.hue) < 15 || Math.abs(selectedHue - hue.hue) > 345 ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
                  `}
                  style={{ backgroundColor: hue.color }}
                  onClick={() => handleHueSelect(hue.hue)}
                  title={`${hue.name} (${hue.hue}°)`}
                  aria-label={`Select ${hue.name}`}
                />
              ))}
            </div>
          </div>

          {/* Grayscale */}
          <div className="space-y-2">
            <Label className="text-xs">Grayscale</Label>
            <div className="grid grid-cols-12 gap-1">
              {GRAYSCALE_PALETTE.map((gray, index) => (
                <button
                  key={index}
                  type="button"
                  className={`
                    w-6 h-6 rounded border-2 transition-all hover:scale-105 focus:scale-105 focus:outline-none shadow-sm
                    ${value === gray ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
                  `}
                  style={{ backgroundColor: gray }}
                  onClick={() => handleColorSelect(gray)}
                  title={gray.toUpperCase()}
                  aria-label={`Select gray ${gray}`}
                />
              ))}
            </div>
          </div>

          {/* Saturation Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">
                Saturation {previewColor && <span className="text-blue-600">(Preview)</span>}
              </Label>
              <span className="text-xs text-gray-500">{saturation}%</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={saturation}
                onChange={handleSaturationChange}
                onMouseDown={handleSliderInteractionStart}
                onMouseUp={handleSliderInteractionEnd}
                onTouchStart={handleSliderInteractionStart}
                onTouchEnd={handleSliderInteractionEnd}
                className="color-picker-slider"
                style={{
                  background: `linear-gradient(to right, 
                    ${hslToHex(selectedHue, 0, lightness)}, 
                    ${hslToHex(selectedHue, 100, lightness)})`
                }}
              />
            </div>
          </div>

          {/* Lightness Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">
                Lightness {previewColor && <span className="text-blue-600">(Preview)</span>}
              </Label>
              <span className="text-xs text-gray-500">{lightness}%</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={lightness}
                onChange={handleLightnessChange}
                onMouseDown={handleSliderInteractionStart}
                onMouseUp={handleSliderInteractionEnd}
                onTouchStart={handleSliderInteractionStart}
                onTouchEnd={handleSliderInteractionEnd}
                className="color-picker-slider"
                style={{
                  background: `linear-gradient(to right, 
                    ${hslToHex(selectedHue, saturation, 0)}, 
                    ${hslToHex(selectedHue, saturation, 50)}, 
                    ${hslToHex(selectedHue, saturation, 100)})`
                }}
              />
            </div>
          </div>

          {/* Hex input */}
          <div className="space-y-2">
            <Label htmlFor="hex-input" className="text-xs">Hex Code</Label>
            <div className="flex gap-2">
              <Input
                id="hex-input"
                type="text"
                placeholder="#000000"
                value={hexInput}
                onChange={handleHexInputChange}
                onBlur={handleHexInputBlur}
                onKeyPress={handleHexKeyPress}
                className="font-mono text-sm flex-1"
                maxLength={7}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleApplyHex}
                disabled={!isValidHexColor(hexInput)}
                className="px-3"
              >
                Apply
              </Button>
            </div>
            {hexInput && !isPartialHexColor(hexInput) && (
              <p className="text-xs text-red-500">Invalid hex format (use #RRGGBB)</p>
            )}
            {hexInput && isPartialHexColor(hexInput) && !isValidHexColor(hexInput) && hexInput.length > 1 && (
              <p className="text-xs text-amber-600">Enter complete 6-digit hex code</p>
            )}
            {previewColor && (
              <div className="text-xs space-y-1">
                <p className="text-blue-600">Preview mode active - adjust sliders to modify this color</p>
                <p className="text-gray-600">Click Apply or press Enter to use this color</p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}