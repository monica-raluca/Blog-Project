import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Eye } from 'lucide-react';
import LexicalContentRenderer from '../../ui/LexicalContentRenderer';

interface ArticlePreviewProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  title,
  content,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Article Preview</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Preview Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-8">
            {/* Article Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {title ? title : (
                <span className="text-gray-400 italic">Untitled Article</span>
              )}
            </h1>

            {/* Article Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
              <span>📅 {new Date().toLocaleDateString()}</span>
              <span>👤 Author</span>
              <span>📖 {Math.ceil(content.length / 1000)} min read</span>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {content ? (
                <LexicalContentRenderer 
                  content={content}
                  className="text-gray-800 leading-relaxed space-y-4"
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-500 italic text-lg">Start writing your article content...</p>
                  <p className="text-gray-400 text-sm mt-2">Your content will appear here as you type</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="px-6"
          >
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArticlePreview;