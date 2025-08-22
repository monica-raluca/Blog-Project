import React, { useState } from 'react';
import ColorPicker from './ColorPicker';

/**
 * Example component demonstrating the enhanced HSL-based ColorPicker component
 * 
 * Features:
 * - Base hue palette with 24 pure colors
 * - Interactive saturation slider to adjust color intensity
 * - Interactive lightness slider to adjust brightness
 * - Grayscale palette for neutral colors
 * - Manual hex code input with Apply button
 * - Persistent popup that stays open during interactions
 * - Complete 6-digit hex validation
 * - Real-time preview with HSL values
 * - Explicit close controls
 * 
 * Improvements:
 * - Popup stays open when selecting colors or using sliders
 * - Manual hex input requires clicking Apply or pressing Enter
 * - Clear visual feedback for incomplete hex codes
 * - Professional workflow like design software
 * 
 * This can be used as a reference for integrating the color picker in other parts of the application
 */
export default function ColorPickerExample() {
  const [selectedColor, setSelectedColor] = useState<string>('#ff4500');

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    console.log('Color changed to:', color);
  };

  const handleColorClear = () => {
    setSelectedColor('');
    console.log('Color cleared');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Color Picker Example</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Choose a color:
          </label>
          <ColorPicker
            value={selectedColor}
            onChange={handleColorChange}
            onClear={handleColorClear}
            placeholder="Select color"
            showClearButton={true}
          />
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Preview & Instructions:</h3>
          <div className="space-y-3">
            <div 
              className="p-4 rounded border"
              style={{ backgroundColor: selectedColor || '#f3f4f6' }}
            >
              <p 
                className="font-medium"
                style={{ color: selectedColor ? getContrastingTextColor(selectedColor) : '#374151' }}
              >
                This is a preview of the selected color
              </p>
              <p 
                className="text-sm"
                style={{ color: selectedColor ? getContrastingTextColor(selectedColor) : '#6b7280' }}
              >
                Selected color: {selectedColor || 'None'}
              </p>
            </div>
            
            {selectedColor && (
              <div className="p-2 bg-gray-100 rounded text-sm font-mono">
                Hex: {selectedColor.toUpperCase()}
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded text-sm">
              <h4 className="font-medium text-blue-900 mb-1">How to use:</h4>
              <ul className="text-blue-800 space-y-1">
                <li>• Click base colors to select a hue family</li>
                <li>• Use sliders to adjust saturation and lightness</li>
                <li>• Type hex codes to enter preview mode</li>
                <li>• In preview mode: adjust sliders to modify the hex color</li>
                <li>• Click Apply or press Enter to commit the color</li>
                <li>• Popup stays open during all interactions</li>
                <li>• Use X button to close when done</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get contrasting text color
function getContrastingTextColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#000000';
  
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
}