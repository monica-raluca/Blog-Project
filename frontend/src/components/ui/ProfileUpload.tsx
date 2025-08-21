import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface ProfileUploadProps {
    userId: string;
    currentImageUrl?: string | null;
    token: string;
    onUploadSuccess?: (user: any) => void;
}

const ProfileUpload: React.FC<ProfileUploadProps> = ({
    userId,
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

            console.log("Before fetch");
            console.log(formData);
            console.log(userId);

            const response = await fetch(`/api/users/${userId}/upload-profile-picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });
            console.log("After fetch");
            console.log(response);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${errorText}`);
                console.log(errorText);
            }

            const updatedUser = await response.json();
            
            if (onUploadSuccess) {
                onUploadSuccess(updatedUser);
                currentImageUrl = updatedUser.profilePicture;
                console.log("On upload success");
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
            console.log("On upload error");
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

     const displayImageUrl = previewUrl || (currentImageUrl ? `http://localhost:8080/profile-pictures/${currentImageUrl}` : null);

    // console.log("currentImageUrl");
    // console.log(currentImageUrl);
    // console.log("displayImageUrl");
    // console.log(displayImageUrl);

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Profile Picture Display */}
            <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 p-1 shadow-lg">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {displayImageUrl ? (
                            <img 
                                src={displayImageUrl} 
                                // src = {updatedUser.profilePicture}
                                alt="Profile preview" 
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                📷
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* File Input */}
            <div className="flex flex-col items-center space-y-2">
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
                    size="sm"
                    className="cursor-pointer"
                    disabled={uploading}
                    onClick={() => {
                        console.log('Select Image button clicked');
                        if (fileInputRef.current) {
                            console.log('Triggering file input click');
                            fileInputRef.current.click();
                        } else {
                            console.log('File input ref is null');
                        }
                    }}
                >
                    Select Image
                </Button>
                
                {selectedFile && (
                    <div className="text-xs text-gray-600 text-center">
                        Selected: {selectedFile.name}
                        <br />
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {selectedFile && (
                <div className="flex gap-2">
                    <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                    <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="text-red-500 text-sm text-center">
                    {error}
                </div>
            )}

            {/* Success Message */}
            {!selectedFile && !error && previewUrl && (
                <div className="text-green-500 text-sm text-center">
                    Profile picture updated successfully!
                </div>
            )}
        </div>
    );
};

export default ProfileUpload;