import React, { useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from '@/components/ui/button';
import { Image, Loader2 } from 'lucide-react';
import { useAuth } from '../../api/AuthContext';
import { INSERT_IMAGE_COMMAND, InsertImagePayload } from './ImagePlugin';

interface ImageUploadPluginProps {
  articleId?: string;
  showToolbar?: boolean;
  onArticleCreate?: () => Promise<string | undefined>; // Callback to create article and return its ID
}

const ImageUploadPlugin: React.FC<ImageUploadPluginProps> = ({ 
  articleId, 
  showToolbar = false,
  onArticleCreate
}) => {
  const [editor] = useLexicalComposerContext();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleImageUpload = async (file: File) => {
    if (!token) {
      console.error('Token not available');
      return;
    }

    setUploading(true);
    
    try {
      let currentArticleId = articleId;
      
      // If no article ID, create the article first
      if (!currentArticleId && onArticleCreate) {
        try {
          currentArticleId = await onArticleCreate();
          if (!currentArticleId) {
            throw new Error('Failed to create article');
          }
        } catch (error) {
          console.error('Failed to auto-save article before image upload:', error);
          alert('Please save the article first before uploading images');
          return;
        }
      }
      
      if (!currentArticleId) {
        alert('Please save the article first before uploading images');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/articles/${currentArticleId}/upload-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const updatedArticle = await response.json();
      const uploadedMedia = updatedArticle.mediaUrls;
    //   const newMediaFileName = uploadedMedia[uploadedMedia.length - 1];
    console.log(uploadedMedia);
    const newMediaFileName = uploadedMedia[uploadedMedia.length - 1];
      
      // Insert image into editor using image node
      const imageUrl = `http://localhost:8080/article-media/${newMediaFileName}`;
      const altText = file.name.split('.')[0];
      
      const payload: InsertImagePayload = {
        src: imageUrl,
        altText: altText,
        maxWidth: 400,
        alignment: 'left', // Default to left alignment for better text wrapping
      };
      
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);

      console.log('Image uploaded successfully:', newMediaFileName);
      
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    handleImageUpload(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (!showToolbar) {
    return null;
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={triggerFileSelect}
        disabled={uploading}
        className="p-1 h-8 w-8"
        title="Upload Image"
      >
        {uploading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Image size={16} />
        )}
      </Button>
    </>
  );
};

export default ImageUploadPlugin;