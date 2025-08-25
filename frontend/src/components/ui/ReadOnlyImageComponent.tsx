import React from 'react';

interface ReadOnlyImageComponentProps {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  maxWidth?: number;
  alignment: 'left' | 'center' | 'right';
}

export default function ReadOnlyImageComponent({
  src,
  altText,
  width,
  height,
  maxWidth = 500,
  alignment,
}: ReadOnlyImageComponentProps): JSX.Element {
  const getContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'relative',
      maxWidth: '100%',
    };

    switch (alignment) {
      case 'left':
        return {
          ...baseStyle,
          float: 'left',
          marginRight: '20px',
          marginLeft: '0',
          marginTop: '5px',
          marginBottom: '10px',
          clear: 'none',
        };
      case 'right':
        return {
          ...baseStyle,
          float: 'right',
          marginLeft: '20px',
          marginRight: '0',
          marginTop: '5px',
          marginBottom: '10px',
          clear: 'none',
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
    width: width || maxWidth,
    height: height || 'auto',
    maxWidth: '100%',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  });

  return (
    <div style={getContainerStyle()} className={`image-container alignment-${alignment}`}>
      <img
        src={src}
        alt={altText}
        style={getImageStyle()}
        draggable={false}
      />
    </div>
  );
}