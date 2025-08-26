import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check, RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react';

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

interface ImageTransform {
    x: number;
    y: number;
    scale: number;
}

const ImageCrop: React.FC<ImageCropProps> = ({
    imageSrc,
    onCropComplete,
    onCancel,
    aspectRatio = 5.2 // Default to match article cover display area (1000px / 192px)
}) => {
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageTransform, setImageTransform] = useState<ImageTransform>({ x: 0, y: 0, scale: 1 });
    const [fixedCropArea, setFixedCropArea] = useState<CropArea>({ x: 0, y: 0, width: 400, height: 400 / aspectRatio });

    // Initialize fixed crop area when container is ready
    useEffect(() => {
        if (imageLoaded && containerRef.current) {
            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            // Set fixed crop area in center of container
            const cropWidth = Math.min(400, containerWidth * 0.6);
            const cropHeight = cropWidth / aspectRatio;
            
            setFixedCropArea({
                x: (containerWidth - cropWidth) / 2,
                y: (containerHeight - cropHeight) / 2,
                width: cropWidth,
                height: cropHeight
            });
        }
    }, [imageLoaded, aspectRatio]);

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setDragStart({ x, y });
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const deltaX = x - dragStart.x;
        const deltaY = y - dragStart.y;

        setImageTransform(prev => ({
            ...prev,
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }));
        
        setDragStart({ x, y });
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleZoom = useCallback((delta: number) => {
        setImageTransform(prev => {
            const newScale = Math.max(0.5, Math.min(3, prev.scale + delta));
            return { ...prev, scale: newScale };
        });
    }, []);

    const handleReset = useCallback(() => {
        setImageTransform({ x: 0, y: 0, scale: 1 });
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        handleZoom(delta);
    }, [handleZoom]);

    const getCroppedImage = useCallback(() => {
        if (!imageRef.current || !canvasRef.current || !containerRef.current) return;

        const image = imageRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get the base image dimensions
        const imgRect = image.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate the transform needed to get from natural size to display size
        const displayScale = imgRect.width / image.naturalWidth;
        
        // Calculate crop area relative to the transformed image
        const cropX = (fixedCropArea.x - imageTransform.x - (containerRect.width - imgRect.width) / 2) / (displayScale * imageTransform.scale);
        const cropY = (fixedCropArea.y - imageTransform.y - (containerRect.height - imgRect.height) / 2) / (displayScale * imageTransform.scale);
        const cropWidth = fixedCropArea.width / (displayScale * imageTransform.scale);
        const cropHeight = fixedCropArea.height / (displayScale * imageTransform.scale);

        // Set canvas size to final crop dimensions
        canvas.width = fixedCropArea.width;
        canvas.height = fixedCropArea.height;

        // Draw the cropped portion
        ctx.drawImage(
            image,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            fixedCropArea.width,
            fixedCropArea.height
        );

        // Convert to blob
        canvas.toBlob((blob) => {
            if (blob) {
                onCropComplete(blob);
            }
        }, 'image/jpeg', 0.9);
    }, [fixedCropArea, imageTransform, onCropComplete]);

    const resetCrop = () => {
        setImageTransform({ x: 0, y: 0, scale: 1 });
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
                        className="!relative !mx-auto !flex !items-center !justify-center !overflow-hidden !rounded-lg !bg-gray-100"
                        style={{ 
                            maxWidth: '800px', 
                            maxHeight: '60vh', 
                            minHeight: '300px',
                            width: '100%'
                        }}
                        onWheel={handleWheel}
                    >
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Crop preview"
                            className="!max-w-none !max-h-none !w-auto !h-auto !block !object-contain !cursor-move"
                            style={{ 
                                transform: `translate(${imageTransform.x}px, ${imageTransform.y}px) scale(${imageTransform.scale})`,
                                transformOrigin: 'center center',
                                maxHeight: 'none',
                                width: 'auto',
                                height: 'auto'
                            }}
                            onLoad={handleImageLoad}
                            onMouseDown={handleImageMouseDown}
                            draggable={false}
                        />
                        
                        {imageLoaded && (
                            <>
                                {/* Dark overlay around crop area */}
                                <div className="!absolute !inset-0 !bg-black/60 !pointer-events-none" />
                                
                                {/* Fixed Crop Area */}
                                <div 
                                    className="!absolute !bg-transparent !border-2 !border-white !pointer-events-none !shadow-lg"
                                    style={{
                                        left: fixedCropArea.x,
                                        top: fixedCropArea.y,
                                        width: fixedCropArea.width,
                                        height: fixedCropArea.height,
                                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                                        borderRadius: '8px'
                                    }}
                                >
                                    {/* Corner indicators */}
                                    <div className="!absolute !w-3 !h-3 !bg-white !border-2 !border-blue-500 !rounded-full" style={{ left: -6, top: -6 }} />
                                    <div className="!absolute !w-3 !h-3 !bg-white !border-2 !border-blue-500 !rounded-full" style={{ right: -6, top: -6 }} />
                                    <div className="!absolute !w-3 !h-3 !bg-white !border-2 !border-blue-500 !rounded-full" style={{ left: -6, bottom: -6 }} />
                                    <div className="!absolute !w-3 !h-3 !bg-white !border-2 !border-blue-500 !rounded-full" style={{ right: -6, bottom: -6 }} />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="!p-4 !border-t !border-gray-200">
                    <div className="!flex !items-center !justify-center !gap-4 !mb-4">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleZoom(-0.1)}
                            className="!flex !items-center !gap-2"
                        >
                            <span className="!text-lg">-</span>
                            Zoom Out
                        </Button>
                        
                        <div className="!text-sm !text-gray-600 !min-w-[80px] !text-center">
                            {Math.round(imageTransform.scale * 100)}%
                        </div>
                        
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleZoom(0.1)}
                            className="!flex !items-center !gap-2"
                        >
                            <span className="!text-lg">+</span>
                            Zoom In
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleReset}
                            className="!flex !items-center !gap-2"
                        >
                            <RotateCcw className="!w-4 !h-4" />
                            Reset
                        </Button>
                    </div>
                    
                    <div className="!text-center !text-sm !text-gray-500 !mb-4">
                        Drag the image to position • Use zoom to resize
                    </div>
                    
                    <div className="!flex !gap-3 !justify-center">
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