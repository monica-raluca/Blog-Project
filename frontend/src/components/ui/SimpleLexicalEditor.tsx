import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { $getRoot } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { 
  $convertFromMarkdownString, 
  $convertToMarkdownString,
  TRANSFORMERS 
} from '@lexical/markdown';
import { YOUTUBE_TRANSFORMER } from './YouTubeTransformer';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { YouTubeNode } from './YouTubeNode';
import YouTubePlugin from './YouTubePlugin';

interface SimpleLexicalEditorProps {
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  minHeight?: string;
}

export interface SimpleLexicalEditorRef {
  getMarkdown: () => string;
  getHtml: () => string;
  setMarkdown: (markdown: string) => void;
  clear: () => void;
  focus: () => void;
}

// Combined transformers including YouTube
const ALL_TRANSFORMERS = [...TRANSFORMERS, YOUTUBE_TRANSFORMER];

// Content change handler plugin
function OnChangePlugin({ onChange }: { onChange?: (value: string) => void }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        if (onChange) {
          const markdown = $convertToMarkdownString(ALL_TRANSFORMERS);
          onChange(markdown);
        }
      });
    });
  }, [editor, onChange]);

  return null;
}

// Initial Value Plugin - handles updating content when initialValue prop changes
function InitialValuePlugin({ initialValue }: { initialValue: string }) {
  const [editor] = useLexicalComposerContext();
  const [hasInitialized, setHasInitialized] = React.useState(false);

  React.useEffect(() => {
    if (initialValue && !hasInitialized) {
      // Set initial content only once when component first mounts with content
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        $convertFromMarkdownString(initialValue, TRANSFORMERS);
      });
      setHasInitialized(true);
    } else if (initialValue && hasInitialized) {
      // Update content when initialValue changes (e.g., after loading article data)
      const currentContent = editor.getEditorState().read(() => {
        return $convertToMarkdownString(TRANSFORMERS);
      });
      
      // Only update if the content is actually different
      if (currentContent !== initialValue) {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          $convertFromMarkdownString(initialValue, ALL_TRANSFORMERS);
        });
      }
    }
  }, [editor, initialValue, hasInitialized]);

  return null;
}

// Editor Ref Plugin
function EditorRefPlugin({ editorRef }: { editorRef: React.MutableRefObject<SimpleLexicalEditorRef | null> }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    editorRef.current = {
      getMarkdown: () => {
        let markdown = '';
        editor.getEditorState().read(() => {
          markdown = $convertToMarkdownString(ALL_TRANSFORMERS);
        });
        return markdown;
      },
      getHtml: () => {
        let html = '';
        editor.getEditorState().read(() => {
          html = $generateHtmlFromNodes(editor, null);
        });
        return html;
      },
      setMarkdown: (markdown: string) => {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          $convertFromMarkdownString(markdown, ALL_TRANSFORMERS);
        });
      },
      clear: () => {
        editor.update(() => {
          $getRoot().clear();
        });
      },
      focus: () => {
        editor.focus();
      },
    };
  }, [editor, editorRef]);

  return null;
}

// Main editor component
const SimpleLexicalEditor = forwardRef<SimpleLexicalEditorRef, SimpleLexicalEditorProps>(({
  initialValue = '',
  placeholder = 'Start typing...',
  onChange,
  readOnly = false,
  className = '',
  minHeight = '200px',
}, ref) => {
  const editorRef = useRef<SimpleLexicalEditorRef | null>(null);

  const initialConfig = React.useMemo(() => ({
    namespace: 'SimpleLexicalEditor',
    theme: {
      paragraph: 'mb-2',
      heading: {
        h1: 'text-2xl font-bold mb-4',
        h2: 'text-xl font-semibold mb-3',
        h3: 'text-lg font-medium mb-2',
      },
      list: {
        nested: {
          listitem: 'list-item',
        },
        ol: 'list-decimal ml-4',
        ul: 'list-disc ml-4',
        listitem: 'mb-1',
      },
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
      },
      link: 'text-blue-600 underline hover:text-blue-800',
      quote: 'border-l-4 border-gray-300 pl-4 italic text-gray-600',
      embedBlock: {
        base: 'relative w-full max-w-full my-4 rounded-lg overflow-hidden shadow-lg border border-gray-200',
        focus: 'ring-2 ring-blue-500 ring-opacity-50 border-blue-400',
      },
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      YouTubeNode,
    ],
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
  }), []);

  useImperativeHandle(ref, () => editorRef.current!, []);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`outline-none p-3 resize-none overflow-auto`}
                style={{ minHeight }}
                readOnly={readOnly}
              />
            }
            placeholder={
              <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={onChange} />
          <InitialValuePlugin initialValue={initialValue} />
          <EditorRefPlugin editorRef={editorRef} />
          <HistoryPlugin />
          <YouTubePlugin />
        </div>
      </div>
    </LexicalComposer>
  );
});

SimpleLexicalEditor.displayName = 'SimpleLexicalEditor';

export default SimpleLexicalEditor;