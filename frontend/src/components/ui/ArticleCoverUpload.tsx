import React, { useState, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Upload, X, Check, Loader2 } from 'lucide-react';

interface ArticleCoverUploadProps {
    articleId: string;
    currentImageUrl?: string | null;
    token: string;
    onUploadSuccess?: (article: any) => void;
}

const ArticleCoverUpload: React.FC<ArticleCoverUploadProps> = ({
    articleId,
    currentImageUrl,
    token,
    onUploadSuccess
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setSelectedFile(file);
        setError(null);

        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            console.log("Uploading article cover for:", articleId);
            console.log(formData);

            const response = await fetch(`/api/articles/${articleId}/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            console.log("Upload response:", response);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${errorText}`);
            }

            const updatedArticle = await response.json();
            
            if (onUploadSuccess) {
                onUploadSuccess(updatedArticle);
                console.log("Article cover upload success:", updatedArticle);
            }

            // Reset form
            setSelectedFile(null);
            setPreviewUrl(null);
            
            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (err) {
            setError((err as Error).message || 'Upload failed');
            console.error("Article cover upload error:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        
        // Clear file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const displayImageUrl = previewUrl || (currentImageUrl ? `/article-images/${currentImageUrl}` : null);

    return (
        <div className="space-y-4">
            {/* Current/Preview Image */}
            <div className="flex justify-center">
                <div className="relative w-full max-w-md h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    {displayImageUrl ? (
                        <img
                            src={displayImageUrl}
                            alt="Article cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">No cover image</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Controls */}
            <div className="space-y-3">
                {!selectedFile ? (
                    // File Selection
                    <div className="flex flex-col items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full max-w-xs"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Cover Image
                        </Button>
                        <p className="text-xs text-gray-500">
                            JPG, PNG, GIF up to 5MB
                        </p>
                    </div>
                ) : (
                    // Upload/Cancel Actions
                    <div className="flex gap-2 justify-center">
                        <Button
                            type="button"
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex items-center gap-2"
                        >
                            {uploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            {uploading ? 'Uploading...' : 'Upload Cover'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={uploading}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}
        </div>
    );
};

export default ArticleCoverUpload;