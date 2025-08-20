import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { $getRoot } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
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
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { YouTubeNode } from './YouTubeNode';
import YouTubePlugin from './YouTubePlugin';
import FontFamilyPlugin from './FontFamilyPlugin';
import FontSizePlugin from './FontSizePlugin';
import TextColorPlugin from './TextColorPlugin';
import BackgroundColorPlugin from './BackgroundColorPlugin';

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
          // Export as HTML to preserve all formatting including underline
          const html = $generateHtmlFromNodes(editor, null);
          onChange(html);
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

  // Helper function to detect if content is HTML or markdown
  const isHtmlContent = (content: string): boolean => {
    return content.includes('<') && content.includes('>');
  };

  const loadContent = (content: string) => {
    const root = $getRoot();
    root.clear();
    
    if (isHtmlContent(content)) {
      // Content is HTML - parse it
      console.log('SimpleLexicalEditor: Converting HTML to nodes');
      const parser = new DOMParser();
      const dom = parser.parseFromString(content, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      root.append(...nodes);
    } else {
      // Content is markdown - convert it
      console.log('SimpleLexicalEditor: Converting string to markdown');
      $convertFromMarkdownString(content, ALL_TRANSFORMERS);
    }
  };

  React.useEffect(() => {
    if (initialValue && !hasInitialized) {
      // Set initial content only once when component first mounts with content
      editor.update(() => {
        loadContent(initialValue);
      });
      setHasInitialized(true);
    } else if (initialValue && hasInitialized) {
      // Update content when initialValue changes (e.g., after loading article data)
      const currentContent = editor.getEditorState().read(() => {
        return $generateHtmlFromNodes(editor, null);
      });
      
      // Only update if the content is actually different
      if (currentContent !== initialValue) {
        editor.update(() => {
          loadContent(initialValue);
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
          // Clean up the HTML to be simpler for backend storage
          html = html
            // Remove all class attributes (keep structure, remove styling)
            .replace(/\s+class="[^"]*"/g, '')
            // Remove data attributes
            .replace(/\s+data-[^=]*="[^"]*"/g, '')
            // Remove spellcheck attribute  
            .replace(/\s+spellcheck="[^"]*"/g, '')
            // Keep only basic inline styles (color, font-family, font-size, background-color)
            .replace(/style="([^"]*)"/g, (match, styles: string) => {
              const basicStyles = styles
                .split(';')
                .filter((style: string) => {
                  const prop = style.trim().split(':')[0]?.trim();
                  return ['color', 'font-family', 'font-size', 'background-color', 'font-weight', 'font-style', 'text-decoration'].includes(prop);
                })
                .join(';');
              return basicStyles ? `style="${basicStyles}"` : '';
            })
            // Simplify code blocks  
            .replace(/<pre[^>]*>/g, '<pre>')
            // Clean up whitespace
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
        });
        return html;
      },
      setMarkdown: (content: string) => {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          
          // Detect if content is HTML or markdown and handle appropriately
          if (content.includes('<') && content.includes('>')) {
            // Content is HTML - parse it
            const parser = new DOMParser();
            const dom = parser.parseFromString(content, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);
            root.append(...nodes);
          } else {
            // Content is markdown - convert it
            $convertFromMarkdownString(content, ALL_TRANSFORMERS);
          }
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
      code: 'bg-gray-100 rounded px-2 py-1 font-mono text-sm',
      codeHighlight: {
        atrule: 'text-purple-600',
        attr: 'text-blue-600',
        boolean: 'text-red-600',
        builtin: 'text-purple-600',
        cdata: 'text-gray-600',
        char: 'text-green-600',
        class: 'text-blue-600',
        'class-name': 'text-blue-600',
        comment: 'text-gray-500',
        constant: 'text-red-600',
        deleted: 'text-red-600',
        doctype: 'text-gray-600',
        entity: 'text-orange-600',
        function: 'text-blue-600',
        important: 'text-red-600',
        inserted: 'text-green-600',
        keyword: 'text-purple-600',
        namespace: 'text-orange-600',
        number: 'text-red-600',
        operator: 'text-gray-700',
        prolog: 'text-gray-600',
        property: 'text-blue-600',
        punctuation: 'text-gray-600',
        regex: 'text-green-600',
        selector: 'text-green-600',
        string: 'text-green-600',
        symbol: 'text-red-600',
        tag: 'text-red-600',
        url: 'text-blue-600',
        variable: 'text-orange-600',
      },
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
      CodeNode,
      CodeHighlightNode,
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
          <MarkdownShortcutPlugin transformers={ALL_TRANSFORMERS} />
          <YouTubePlugin />
          <FontFamilyPlugin />
          <FontSizePlugin />
          <TextColorPlugin />
          <BackgroundColorPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
});

SimpleLexicalEditor.displayName = 'SimpleLexicalEditor';

export default SimpleLexicalEditor;