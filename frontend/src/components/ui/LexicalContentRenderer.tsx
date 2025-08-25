import React, { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { YouTubeNode } from './YouTubeNode';
import { ImageNode } from './ImageNode';
import CodeHighlightPlugin from './CodeHighlightPlugin';
import './ContentWrapperStyles.css';

interface LexicalContentRendererProps {
  content: string;
  className?: string;
}

// Plugin to set content from JSON
function ContentInitializerPlugin({ jsonContent }: { jsonContent: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (jsonContent) {
      try {
        // Use setTimeout to avoid flushSync issues
        setTimeout(() => {
          try {
            const editorState = editor.parseEditorState(jsonContent);
            editor.setEditorState(editorState);
          } catch (parseError) {
            console.error('Error parsing editor state from JSON:', parseError);
            
            // Try to extract text content from the JSON if it's not valid Lexical state
            try {
              const parsed = JSON.parse(jsonContent);
              let textContent = '';
              
              // Handle various JSON structures
              if (typeof parsed === 'string') {
                textContent = parsed;
              } else if (parsed.text) {
                textContent = parsed.text;
              } else if (parsed.content) {
                textContent = parsed.content;
              } else if (parsed.root && parsed.root.children) {
                // Try to extract text from Lexical-like structure
                textContent = extractTextFromNodes(parsed.root.children);
              } else {
                textContent = jsonContent; // Show the raw content as last resort
              }
              
              // Set the extracted text as plain text
              editor.update(() => {
                const root = $getRoot();
                root.clear();
                const paragraph = $createParagraphNode();
                const textNode = $createTextNode(textContent);
                paragraph.append(textNode);
                root.append(paragraph);
              });
            } catch (extractError) {
              console.error('Error extracting text from JSON:', extractError);
              // Ultimate fallback: treat as plain text
              editor.update(() => {
                const root = $getRoot();
                root.clear();
                const paragraph = $createParagraphNode();
                const textNode = $createTextNode(jsonContent);
                paragraph.append(textNode);
                root.append(paragraph);
              });
            }
          }
        }, 0);
      } catch (error) {
        console.error('Error in ContentInitializerPlugin:', error);
      }
    }
  }, [editor, jsonContent]);

  // Helper function to extract text from node structures
  const extractTextFromNodes = (nodes: any[]): string => {
    let text = '';
    for (const node of nodes) {
      if (node.text) {
        text += node.text;
      } else if (node.children && Array.isArray(node.children)) {
        text += extractTextFromNodes(node.children);
      }
      if (node.type === 'paragraph' || node.type === 'heading') {
        text += '\n';
      }
    }
    return text;
  };

  return null;
}

export default function LexicalContentRenderer({ content, className = '' }: LexicalContentRendererProps) {
  // Check if content is Lexical editor state JSON
  const isLexicalJsonContent = (content: string): boolean => {
    try {
      const parsed = JSON.parse(content);
      // Check if it has the structure of a Lexical editor state
      const isLexical = parsed && 
             typeof parsed === 'object' && 
             (parsed.root || parsed.editorState || (parsed.children && Array.isArray(parsed.children)));
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('LexicalContentRenderer - Content type check:', {
          isLexical,
          hasRoot: !!parsed?.root,
          hasEditorState: !!parsed?.editorState,
          hasChildren: !!parsed?.children,
          contentLength: content.length,
          contentPreview: content.substring(0, 100) + '...'
        });
      }
      
      return isLexical;
    } catch {
      return false;
    }
  };

  // Check if it's basic JSON that we should try to render
  const isBasicJson = (content: string): boolean => {
    try {
      const parsed = JSON.parse(content);
      return parsed && typeof parsed === 'object';
    } catch {
      return false;
    }
  };

  // If it's basic JSON but not Lexical, convert to plain text
  if (isBasicJson(content) && !isLexicalJsonContent(content)) {
    try {
      const parsed = JSON.parse(content);
      // Extract text content from various JSON structures
      let textContent = '';
      if (typeof parsed === 'string') {
        textContent = parsed;
      } else if (parsed.text) {
        textContent = parsed.text;
      } else if (parsed.content) {
        textContent = parsed.content;
      } else {
        textContent = JSON.stringify(parsed, null, 2);
      }
      return (
        <div className={`prose prose-slate max-w-none ${className}`}>
          <div>{textContent}</div>
        </div>
      );
    } catch {
      return (
        <div className={`prose prose-slate max-w-none ${className}`}>
          <div>{content}</div>
        </div>
      );
    }
  }
  
  // If not JSON at all, render as HTML/plain text
  if (!isLexicalJsonContent(content)) {
    return (
      <div className={`prose prose-slate max-w-none ${className}`}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  // If it's Lexical JSON, render with Lexical editor
  const initialConfig = {
    namespace: 'ContentRenderer',
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
        underlineStrikethrough: 'underline line-through',
        code: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
      },
      link: 'text-blue-600 underline hover:text-blue-800',
      quote: 'border-l-4 border-gray-300 pl-4 italic text-gray-600',
      code: 'bg-gray-900 text-gray-100 font-mono text-sm p-4 rounded-lg block my-2 overflow-x-auto relative border border-gray-700',
      codeHighlight: {
        atrule: 'code-highlight-atrule',
        attr: 'code-highlight-attr',
        boolean: 'code-highlight-boolean',
        builtin: 'code-highlight-builtin',
        cdata: 'code-highlight-cdata',
        char: 'code-highlight-char',
        class: 'code-highlight-function',
        'class-name': 'code-highlight-class-name',
        comment: 'code-highlight-comment',
        constant: 'code-highlight-constant',
        deleted: 'code-highlight-deleted',
        doctype: 'code-highlight-doctype',
        entity: 'code-highlight-entity',
        function: 'code-highlight-function',
        important: 'code-highlight-important',
        inserted: 'code-highlight-inserted',
        keyword: 'code-highlight-keyword',
        namespace: 'code-highlight-namespace',
        number: 'code-highlight-number',
        operator: 'code-highlight-operator',
        prolog: 'code-highlight-prolog',
        property: 'code-highlight-property',
        punctuation: 'code-highlight-punctuation',
        regex: 'code-highlight-regex',
        selector: 'code-highlight-selector',
        string: 'code-highlight-string',
        symbol: 'code-highlight-symbol',
        tag: 'code-highlight-tag',
        unchanged: 'code-highlight-unchanged',
        url: 'code-highlight-url',
        variable: 'code-highlight-variable',
        // Additional token types
        annotation: 'code-highlight-annotation',
        decorator: 'code-highlight-decorator',
        interpolation: 'code-highlight-interpolation',
        module: 'code-highlight-module',
        macro: 'code-highlight-macro',
        generic: 'code-highlight-generic',
        'template-string': 'code-highlight-template-string',
        parameter: 'code-highlight-parameter',
        plain: 'code-highlight-plain',
        prefix: 'code-highlight-prefix',
      },
      embedBlock: {
        base: 'relative w-full max-w-full my-4 rounded-lg overflow-hidden shadow-lg border border-gray-200',
        focus: 'ring-2 ring-blue-500 ring-opacity-50 border-blue-400',
      },
      table: 'border-collapse border border-gray-300 my-4 w-full',
      tableCell: 'border border-gray-300 px-3 py-2 text-left bg-white',
      tableCellHeader: 'border border-gray-300 px-3 py-2 text-left bg-white font-semibold',
      tableRow: 'border-b border-gray-300',
      tableRowStriped: 'border-b border-gray-300 bg-white',
      tableSelection: 'bg-blue-100',
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      AutoLinkNode,
      YouTubeNode,
      ImageNode,
      TableNode,
      TableCellNode,
      TableRowNode,
    ],
    editable: false, // Make it read-only
    onError: (error: Error) => {
      console.error('Lexical content renderer error:', error);
    },
  };

  return (
    <div className={`prose prose-slate max-w-none content-wrapper ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable 
              className="border-none bg-transparent outline-none focus:outline-none"
              style={{ padding: 0, margin: 0 }}
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <CodeHighlightPlugin />
        <TablePlugin hasCellMerge={true} hasCellBackgroundColor={true} />
        <ContentInitializerPlugin jsonContent={content} />
      </LexicalComposer>
    </div>
  );
}