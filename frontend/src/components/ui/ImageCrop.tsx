import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check, RotateCcw } from 'lucide-react';

export interface CropData {
    cropX: number;      // X position (0-1) - center of crop area
    cropY: number;      // Y position (0-1) - center of crop area  
    cropWidth: number;  // Width (0-1) relative to image
    cropHeight: number; // Height (0-1) relative to image
    cropScale: number;  // Always 1 for this approach
}

interface ImageCropProps {
    imageSrc: string;
    onCropComplete: (cropData: CropData) => void;
    onCancel: () => void;
    aspectRatio?: number; // Optional aspect ratio (width/height)
}

interface CropRect {
    x: number;      // Left position relative to image container
    y: number;      // Top position relative to image container  
    width: number;  // Width in pixels
    height: number; // Height in pixels
}

const ImageCrop: React.FC<ImageCropProps> = ({
    imageSrc,
    onCropComplete,
    onCancel,
    aspectRatio = 1.6 // Default to match article cover aspect ratio (8:5 = 1.6:1)
}) => {
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const cropRef = useRef<HTMLDivElement>(null);
    
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string>('');
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [cropRect, setCropRect] = useState<CropRect>({ x: 50, y: 50, width: 300, height: 300 / aspectRatio });

    // Initialize crop rectangle when image loads
    useEffect(() => {
        if (imageLoaded && imageRef.current && containerRef.current) {
            const container = containerRef.current;
            const img = imageRef.current;
            
            // Get image position and size
            const imgRect = img.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const imgLeft = imgRect.left - containerRect.left;
            const imgTop = imgRect.top - containerRect.top;
            const imgWidth = imgRect.width;
            const imgHeight = imgRect.height;
            
            // Set initial crop size to 60% of image, maintaining aspect ratio
            const cropWidth = Math.min(300, imgWidth * 0.6);
            const cropHeight = cropWidth / aspectRatio;
            
            // Center the crop rectangle
            const x = imgLeft + (imgWidth - cropWidth) / 2;
            const y = imgTop + (imgHeight - cropHeight) / 2;
            
            setCropRect({ x, y, width: cropWidth, height: cropHeight });
        }
    }, [imageLoaded, aspectRatio]);

    // Mouse event handlers for document (to handle dragging outside container)
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!containerRef.current || !imageRef.current) return;
            if (!isDragging && !isResizing) return;

            const rect = containerRef.current.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;

            // Get image bounds
            const imgRect = imageRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const imgLeft = imgRect.left - containerRect.left;
            const imgTop = imgRect.top - containerRect.top;
            const imgRight = imgLeft + imgRect.width;
            const imgBottom = imgTop + imgRect.height;

            if (isDragging) {
                // Move crop rectangle
                let newX = currentX - dragStart.x;
                let newY = currentY - dragStart.y;

                // Constrain to image bounds
                newX = Math.max(imgLeft, Math.min(newX, imgRight - cropRect.width));
                newY = Math.max(imgTop, Math.min(newY, imgBottom - cropRect.height));

                setCropRect(prev => ({ ...prev, x: newX, y: newY }));
            } else if (isResizing) {
                // Resize crop rectangle
                const deltaX = currentX - dragStart.x;
                const deltaY = currentY - dragStart.y;

                setCropRect(prev => {
                    let newRect = { ...prev };

                    if (resizeHandle.includes('right')) {
                        newRect.width = Math.max(50, prev.width + deltaX);
                    }
                    if (resizeHandle.includes('left')) {
                        const newWidth = Math.max(50, prev.width - deltaX);
                        newRect.x = prev.x + (prev.width - newWidth);
                        newRect.width = newWidth;
                    }
                    if (resizeHandle.includes('bottom')) {
                        newRect.height = Math.max(50, prev.height + deltaY);
                    }
                    if (resizeHandle.includes('top')) {
                        const newHeight = Math.max(50, prev.height - deltaY);
                        newRect.y = prev.y + (prev.height - newHeight);
                        newRect.height = newHeight;
                    }

                    // Maintain aspect ratio
                    if (aspectRatio) {
                        if (resizeHandle.includes('right') || resizeHandle.includes('left')) {
                            newRect.height = newRect.width / aspectRatio;
                        } else {
                            newRect.width = newRect.height * aspectRatio;
                        }
                    }

                    // Constrain to image bounds
                    newRect.x = Math.max(imgLeft, Math.min(newRect.x, imgRight - newRect.width));
                    newRect.y = Math.max(imgTop, Math.min(newRect.y, imgBottom - newRect.y));
                    newRect.width = Math.min(newRect.width, imgRight - newRect.x);
                    newRect.height = Math.min(newRect.height, imgBottom - newRect.y);

                    return newRect;
                });

                setDragStart({ x: currentX, y: currentY });
            }
        };

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setResizeHandle('');
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, isResizing, dragStart, cropRect, resizeHandle, aspectRatio]);

    // Mouse handlers for crop rectangle dragging
    const handleCropMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIsDragging(true);
        const rect = containerRef.current!.getBoundingClientRect();
        setDragStart({
            x: e.clientX - rect.left - cropRect.x,
            y: e.clientY - rect.top - cropRect.y
        });
    }, [cropRect]);

    // Mouse handlers for resize handles
    const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIsResizing(true);
        setResizeHandle(handle);
        const rect = containerRef.current!.getBoundingClientRect();
        setDragStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }, []);

    const handleReset = useCallback(() => {
        if (imageRef.current && containerRef.current) {
            const container = containerRef.current;
            const img = imageRef.current;
            
            const imgRect = img.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const imgLeft = imgRect.left - containerRect.left;
            const imgTop = imgRect.top - containerRect.top;
            const imgWidth = imgRect.width;
            const imgHeight = imgRect.height;
            
            const cropWidth = Math.min(300, imgWidth * 0.6);
            const cropHeight = cropWidth / aspectRatio;
            
            const x = imgLeft + (imgWidth - cropWidth) / 2;
            const y = imgTop + (imgHeight - cropHeight) / 2;
            
            setCropRect({ x, y, width: cropWidth, height: cropHeight });
        }
    }, [aspectRatio]);

    const handleApplyCrop = useCallback(() => {
        if (!imageRef.current || !containerRef.current) return;

        const img = imageRef.current;
        const imgRect = img.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate image position relative to container
        const imgLeft = imgRect.left - containerRect.left;
        const imgTop = imgRect.top - containerRect.top;
        const imgWidth = imgRect.width;
        const imgHeight = imgRect.height;

        // Calculate crop rectangle position relative to image
        const cropRelativeX = cropRect.x - imgLeft;
        const cropRelativeY = cropRect.y - imgTop;

        // Convert to normalized coordinates (0-1)
        const normalizedX = cropRelativeX / imgWidth;
        const normalizedY = cropRelativeY / imgHeight;
        const normalizedWidth = cropRect.width / imgWidth;
        const normalizedHeight = cropRect.height / imgHeight;

        // Calculate center position (as expected by the crop data format)
        const centerX = normalizedX + normalizedWidth / 2;
        const centerY = normalizedY + normalizedHeight / 2;

        const cropData: CropData = {
            cropX: centerX,
            cropY: centerY,
            cropWidth: normalizedWidth,
            cropHeight: normalizedHeight,
            cropScale: 1 // Always 1 for this static image approach
        };

        console.log('Crop data:', cropData);
        onCropComplete(cropData);
    }, [cropRect, onCropComplete]);

    return (
        <div className="!fixed !inset-0 !bg-black/80 !flex !items-center !justify-center !z-50 !p-4">
            <div className="!bg-white !rounded-2xl !shadow-2xl !max-w-6xl !w-full !max-h-[90vh] !overflow-hidden">
                {/* Header */}
                <div className="!p-6 !border-b !border-gray-200">
                    <div className="!flex !items-center !justify-between">
                        <h2 className="!text-2xl !font-bold !text-gray-800">Crop Image</h2>
                        <button
                            onClick={onCancel}
                            className="!p-2 !hover:bg-gray-100 !rounded-lg !transition-colors"
                        >
                            <X className="!w-6 !h-6" />
                        </button>
                    </div>
                    <p className="!text-sm !text-gray-600 !mt-2">
                        Move and resize the rectangle to select the area you want to crop
                    </p>
                </div>

                {/* Image and Crop Area */}
                <div className="!p-6">
                    <div 
                        ref={containerRef}
                        className="!relative !bg-gray-100 !rounded-lg !overflow-hidden !flex !items-center !justify-center"
                        style={{ height: '60vh' }}
                    >
                        {/* Static Image */}
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Crop preview"
                            className="!max-w-full !max-h-full !object-contain"
                            onLoad={() => setImageLoaded(true)}
                            draggable={false}
                        />

                        {/* Crop Rectangle */}
                        {imageLoaded && (
                            <div
                                ref={cropRef}
                                className="!absolute !border-2 !border-blue-500 !cursor-move"
                                style={{
                                    left: cropRect.x,
                                    top: cropRect.y,
                                    width: cropRect.width,
                                    height: cropRect.height,
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)'
                                }}
                                onMouseDown={handleCropMouseDown}
                            >
                                {/* Resize Handles */}
                                <div
                                    className="!absolute !w-3 !h-3 !bg-blue-500 !cursor-nw-resize"
                                    style={{ top: -6, left: -6 }}
                                    onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
                                />
                                <div
                                    className="!absolute !w-3 !h-3 !bg-blue-500 !cursor-ne-resize"
                                    style={{ top: -6, right: -6 }}
                                    onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
                                />
                                <div
                                    className="!absolute !w-3 !h-3 !bg-blue-500 !cursor-sw-resize"
                                    style={{ bottom: -6, left: -6 }}
                                    onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
                                />
                                <div
                                    className="!absolute !w-3 !h-3 !bg-blue-500 !cursor-se-resize"
                                    style={{ bottom: -6, right: -6 }}
                                    onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
                                />

                                {/* Edge handles for better usability */}
                                <div
                                    className="!absolute !w-full !h-2 !cursor-n-resize"
                                    style={{ top: -4 }}
                                    onMouseDown={(e) => handleResizeMouseDown(e, 'top')}
                                />
                                <div
                                    className="!absolute !w-full !h-2 !cursor-s-resize"
                                    style={{ bottom: -4 }}
                                    onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
                                />
                                <div
                                    className="!absolute !h-full !w-2 !cursor-w-resize"
                                    style={{ left: -4 }}
                                    onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
                                />
                                <div
                                    className="!absolute !h-full !w-2 !cursor-e-resize"
                                    style={{ right: -4 }}
                                    onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
                                />
                            </div>
                        )}

                        {/* Dark overlay to highlight crop area */}
                        {imageLoaded && (
                            <>
                                {/* Top overlay */}
                                <div
                                    className="!absolute !bg-black/50 !pointer-events-none"
                                    style={{
                                        left: 0,
                                        top: 0,
                                        width: '100%',
                                        height: cropRect.y
                                    }}
                                />
                                {/* Bottom overlay */}
                                <div
                                    className="!absolute !bg-black/50 !pointer-events-none"
                                    style={{
                                        left: 0,
                                        top: cropRect.y + cropRect.height,
                                        width: '100%',
                                        bottom: 0
                                    }}
                                />
                                {/* Left overlay */}
                                <div
                                    className="!absolute !bg-black/50 !pointer-events-none"
                                    style={{
                                        left: 0,
                                        top: cropRect.y,
                                        width: cropRect.x,
                                        height: cropRect.height
                                    }}
                                />
                                {/* Right overlay */}
                                <div
                                    className="!absolute !bg-black/50 !pointer-events-none"
                                    style={{
                                        left: cropRect.x + cropRect.width,
                                        top: cropRect.y,
                                        right: 0,
                                        height: cropRect.height
                                    }}
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="!flex !items-center !justify-between !p-6 !border-t !border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="!flex !items-center !gap-2"
                    >
                        <RotateCcw className="!w-4 !h-4" />
                        Reset
                    </Button>

                    <div className="!flex !items-center !gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApplyCrop}
                            className="!flex !items-center !gap-2"
                        >
                            <Check className="!w-4 !h-4" />
                            Apply Crop
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCrop;