import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, NodeKey } from 'lexical';
import { ImageNode } from './ImageNode';

interface ResizableImageComponentProps {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  maxWidth?: number;
  alignment: 'left' | 'center' | 'right';
  nodeKey: NodeKey;
  resizable?: boolean;
}

export default function ResizableImageComponent({
  src,
  altText,
  width,
  height,
  maxWidth = 500,
  alignment,
  nodeKey,
  resizable = true,
}: ResizableImageComponentProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setIsSelected] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [currentWidth, setCurrentWidth] = useState(width || maxWidth);
  const [currentHeight, setCurrentHeight] = useState(height);
  const [currentAlignment, setCurrentAlignment] = useState(alignment);

  // Sync with prop changes
  useEffect(() => {
    setCurrentAlignment(alignment);
  }, [alignment]);

  const handleResize = useCallback((newWidth: number, newHeight: number) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && node instanceof ImageNode) {
        node.setWidthAndHeight(newWidth, newHeight);
      }
    });
    setCurrentWidth(newWidth);
    setCurrentHeight(newHeight);
  }, [editor, nodeKey]);

  const handleAlignmentChange = useCallback((newAlignment: 'left' | 'center' | 'right') => {
    console.log('Changing alignment to:', newAlignment);
    setCurrentAlignment(newAlignment);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && node instanceof ImageNode) {
        node.setAlignment(newAlignment);
        console.log('Node alignment updated to:', newAlignment);
      } else {
        console.error('Node not found or not ImageNode:', node);
      }
    });
  }, [editor, nodeKey]);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = currentWidth || maxWidth;
    const img = imageRef.current;
    if (!img) return;

    const aspectRatio = img.naturalHeight / img.naturalWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(100, Math.min(800, startWidth + deltaX));
      const newHeight = newWidth * aspectRatio;
      
      handleResize(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [currentWidth, maxWidth, handleResize]);

  const getContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'relative',
      maxWidth: '100%',
      cursor: resizable ? 'pointer' : 'default',
    };

    switch (currentAlignment) {
      case 'left':
        return {
          ...baseStyle,
          float: 'left',
          marginRight: '20px',
          marginLeft: '0',
          marginTop: '5px',
          marginBottom: '10px',
          clear: 'none', // Allow stacking of left-aligned images
        };
      case 'right':
        return {
          ...baseStyle,
          float: 'right',
          marginLeft: '20px',
          marginRight: '0',
          marginTop: '5px',
          marginBottom: '10px',
          clear: 'none', // Allow stacking of right-aligned images
        };
      case 'center':
      default:
        return {
          ...baseStyle,
          display: 'block',
          margin: '20px auto',
          textAlign: 'center',
          clear: 'both',
        };
    }
  };

  const getImageStyle = (): React.CSSProperties => ({
    width: currentWidth || maxWidth,
    height: currentHeight || 'auto',
    maxWidth: '100%',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: isSelected ? '2px solid #3b82f6' : 'none',
    transition: 'border 0.2s ease',
  });

  return (
    <div
      style={getContainerStyle()}
      onClick={(e) => {
        e.preventDefault();
        setIsSelected(!isSelected);
      }}
      onBlur={() => setIsSelected(false)}
      tabIndex={0}
      className={`image-container alignment-${currentAlignment}`}
    >
      <img
        ref={imageRef}
        src={src}
        alt={altText}
        style={getImageStyle()}
        draggable={false}
      />
      
      {/* Alignment Controls */}
      {isSelected && resizable && (
        <div
          style={{
            position: 'absolute',
            top: '-35px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
            backgroundColor: 'white',
            padding: '4px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 10,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleAlignmentChange('left');
            }}
            style={{
              padding: '4px 8px',
              border: currentAlignment === 'left' ? '2px solid #3b82f6' : '1px solid #ccc',
              backgroundColor: currentAlignment === 'left' ? '#eff6ff' : 'white',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ← Left
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleAlignmentChange('center');
            }}
            style={{
              padding: '4px 8px',
              border: currentAlignment === 'center' ? '2px solid #3b82f6' : '1px solid #ccc',
              backgroundColor: currentAlignment === 'center' ? '#eff6ff' : 'white',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Center
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleAlignmentChange('right');
            }}
            style={{
              padding: '4px 8px',
              border: currentAlignment === 'right' ? '2px solid #3b82f6' : '1px solid #ccc',
              backgroundColor: currentAlignment === 'right' ? '#eff6ff' : 'white',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Right →
          </button>
        </div>
      )}

      {/* Resize Handle */}
      {isSelected && resizable && (
        <div
          onMouseDown={onResizeStart}
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '12px',
            height: '12px',
            backgroundColor: '#3b82f6',
            cursor: 'se-resize',
            borderRadius: '0 0 8px 0',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}