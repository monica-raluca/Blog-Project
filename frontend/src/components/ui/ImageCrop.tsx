import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check, RotateCcw } from 'lucide-react';

interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageCropProps {
    imageSrc: string;
    onCropComplete: (croppedBlob: Blob) => void;
    onCancel: () => void;
    aspectRatio?: number; // Optional aspect ratio (width/height)
}

const ImageCrop: React.FC<ImageCropProps> = ({
    imageSrc,
    onCropComplete,
    onCancel,
    aspectRatio = 16 / 9 // Default to 16:9 aspect ratio for article covers
}) => {
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string>('');
    const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 / aspectRatio });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Initialize crop area when image loads
    useEffect(() => {
        if (imageLoaded && imageRef.current) {
            const img = imageRef.current;
            const containerWidth = img.clientWidth;
            const containerHeight = img.clientHeight;
            
            // Set initial crop area to center with desired aspect ratio
            const initialWidth = Math.min(containerWidth * 0.8, 400);
            const initialHeight = initialWidth / aspectRatio;
            
            setCropArea({
                x: (containerWidth - initialWidth) / 2,
                y: (containerHeight - initialHeight) / 2,
                width: initialWidth,
                height: initialHeight
            });
        }
    }, [imageLoaded, aspectRatio]);

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleMouseDown = useCallback((e: React.MouseEvent, action: 'drag' | 'resize', handle?: string) => {
        e.preventDefault();
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setDragStart({ x, y });

        if (action === 'drag') {
            setIsDragging(true);
        } else if (action === 'resize') {
            setIsResizing(true);
            setResizeHandle(handle || '');
        }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging && !isResizing) return;
        if (!containerRef.current || !imageRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const deltaX = x - dragStart.x;
        const deltaY = y - dragStart.y;

        if (isDragging) {
            setCropArea(prev => {
                const newX = Math.max(0, Math.min(imageRef.current!.clientWidth - prev.width, prev.x + deltaX));
                const newY = Math.max(0, Math.min(imageRef.current!.clientHeight - prev.height, prev.y + deltaY));
                return { ...prev, x: newX, y: newY };
            });
            setDragStart({ x, y });
        } else if (isResizing) {
            setCropArea(prev => {
                let newCrop = { ...prev };
                const maxWidth = imageRef.current!.clientWidth;
                const maxHeight = imageRef.current!.clientHeight;

                if (resizeHandle.includes('right')) {
                    newCrop.width = Math.min(maxWidth - prev.x, Math.max(50, prev.width + deltaX));
                }
                if (resizeHandle.includes('left')) {
                    const newWidth = Math.max(50, prev.width - deltaX);
                    const newX = Math.max(0, prev.x + deltaX);
                    if (newX + newWidth <= maxWidth) {
                        newCrop.width = newWidth;
                        newCrop.x = newX;
                    }
                }
                if (resizeHandle.includes('bottom')) {
                    newCrop.height = Math.min(maxHeight - prev.y, Math.max(50, prev.height + deltaY));
                }
                if (resizeHandle.includes('top')) {
                    const newHeight = Math.max(50, prev.height - deltaY);
                    const newY = Math.max(0, prev.y + deltaY);
                    if (newY + newHeight <= maxHeight) {
                        newCrop.height = newHeight;
                        newCrop.y = newY;
                    }
                }

                // Maintain aspect ratio if specified
                if (aspectRatio) {
                    if (resizeHandle.includes('right') || resizeHandle.includes('left')) {
                        newCrop.height = newCrop.width / aspectRatio;
                        if (newCrop.y + newCrop.height > maxHeight) {
                            newCrop.height = maxHeight - newCrop.y;
                            newCrop.width = newCrop.height * aspectRatio;
                        }
                    } else if (resizeHandle.includes('top') || resizeHandle.includes('bottom')) {
                        newCrop.width = newCrop.height * aspectRatio;
                        if (newCrop.x + newCrop.width > maxWidth) {
                            newCrop.width = maxWidth - newCrop.x;
                            newCrop.height = newCrop.width / aspectRatio;
                        }
                    }
                }

                return newCrop;
            });
            setDragStart({ x, y });
        }
    }, [isDragging, isResizing, dragStart, resizeHandle, aspectRatio]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle('');
    }, []);

    useEffect(() => {
        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

    const getCroppedImage = useCallback(() => {
        if (!imageRef.current || !canvasRef.current) return;

        const image = imageRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate scale factors
        const scaleX = image.naturalWidth / image.clientWidth;
        const scaleY = image.naturalHeight / image.clientHeight;

        // Set canvas size to crop area
        canvas.width = cropArea.width * scaleX;
        canvas.height = cropArea.height * scaleY;

        // Draw cropped portion
        ctx.drawImage(
            image,
            cropArea.x * scaleX,
            cropArea.y * scaleY,
            cropArea.width * scaleX,
            cropArea.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        // Convert to blob
        canvas.toBlob((blob) => {
            if (blob) {
                onCropComplete(blob);
            }
        }, 'image/jpeg', 0.9);
    }, [cropArea, onCropComplete]);

    const resetCrop = () => {
        if (imageRef.current) {
            const img = imageRef.current;
            const containerWidth = img.clientWidth;
            const containerHeight = img.clientHeight;
            
            const initialWidth = Math.min(containerWidth * 0.8, 400);
            const initialHeight = initialWidth / aspectRatio;
            
            setCropArea({
                x: (containerWidth - initialWidth) / 2,
                y: (containerHeight - initialHeight) / 2,
                width: initialWidth,
                height: initialHeight
            });
        }
    };

    return (
        <div className="!fixed !inset-0 !bg-black/80 !flex !items-center !justify-center !z-50 !p-4">
            <div className="!bg-white !rounded-2xl !shadow-2xl !max-w-4xl !w-full !max-h-[90vh] !overflow-hidden">
                {/* Header */}
                <div className="!p-6 !border-b !border-gray-200">
                    <div className="!flex !items-center !justify-between">
                        <div>
                            <h2 className="!text-2xl !font-bold !text-gray-900">Crop Image</h2>
                            <p className="!text-sm !text-gray-600 !mt-1">
                                Drag to reposition or resize the crop area
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onCancel}
                            className="!p-2"
                        >
                            <X className="!w-4 !h-4" />
                        </Button>
                    </div>
                </div>

                {/* Crop Area */}
                <div className="!p-6">
                    <div 
                        ref={containerRef}
                        className="!relative !mx-auto !max-w-full !max-h-[60vh] !overflow-hidden !rounded-lg !bg-gray-100"
                        style={{ maxWidth: '800px' }}
                    >
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Crop preview"
                            className="!w-full !h-auto !block"
                            onLoad={handleImageLoad}
                            draggable={false}
                        />
                        
                        {imageLoaded && (
                            <>
                                {/* Overlay */}
                                <div className="!absolute !inset-0 !bg-black/50 !pointer-events-none" />
                                
                                {/* Crop Area */}
                                <div
                                    className="!absolute !border-2 !border-blue-500 !cursor-move !bg-transparent !shadow-lg"
                                    style={{
                                        left: cropArea.x,
                                        top: cropArea.y,
                                        width: cropArea.width,
                                        height: cropArea.height,
                                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.3)'
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, 'drag')}
                                >
                                    {/* Resize Handles */}
                                    <div 
                                        className="!absolute !w-4 !h-4 !bg-white !border-2 !border-blue-500 !cursor-nw-resize !rounded-full !shadow-md hover:!bg-blue-50 !transition-colors"
                                        style={{ left: -8, top: -8 }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            handleMouseDown(e, 'resize', 'top-left');
                                        }}
                                    />
                                    <div 
                                        className="!absolute !w-4 !h-4 !bg-white !border-2 !border-blue-500 !cursor-ne-resize !rounded-full !shadow-md hover:!bg-blue-50 !transition-colors"
                                        style={{ right: -8, top: -8 }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            handleMouseDown(e, 'resize', 'top-right');
                                        }}
                                    />
                                    <div 
                                        className="!absolute !w-4 !h-4 !bg-white !border-2 !border-blue-500 !cursor-sw-resize !rounded-full !shadow-md hover:!bg-blue-50 !transition-colors"
                                        style={{ left: -8, bottom: -8 }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            handleMouseDown(e, 'resize', 'bottom-left');
                                        }}
                                    />
                                    <div 
                                        className="!absolute !w-4 !h-4 !bg-white !border-2 !border-blue-500 !cursor-se-resize !rounded-full !shadow-md hover:!bg-blue-50 !transition-colors"
                                        style={{ right: -8, bottom: -8 }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            handleMouseDown(e, 'resize', 'bottom-right');
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="!p-6 !border-t !border-gray-200 !flex !items-center !justify-between">
                    <Button 
                        variant="outline" 
                        onClick={resetCrop}
                        className="!flex !items-center !gap-2"
                    >
                        <RotateCcw className="!w-4 !h-4" />
                        Reset Crop
                    </Button>
                    
                    <div className="!flex !gap-3">
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={getCroppedImage}
                            className="!flex !items-center !gap-2 !bg-blue-600 hover:!bg-blue-700"
                        >
                            <Check className="!w-4 !h-4" />
                            Apply Crop
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hidden canvas for cropping */}
            <canvas ref={canvasRef} className="!hidden" />
        </div>
    );
};

export default ImageCrop;