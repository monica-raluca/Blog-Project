import React, { useCallback, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { $getRoot, $getSelection, EditorState } from 'lexical';
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
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { TableNode, TableCellNode, TableRowNode, INSERT_TABLE_COMMAND } from '@lexical/table';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import CodeHighlightPlugin from './CodeHighlightPlugin';
import TextColorPlugin, { FORMAT_TEXT_COLOR_COMMAND, CLEAR_TEXT_COLOR_COMMAND } from './TextColorPlugin';
import BackgroundColorPlugin, { FORMAT_BACKGROUND_COLOR_COMMAND, CLEAR_BACKGROUND_COLOR_COMMAND } from './BackgroundColorPlugin';
import ImageUploadPlugin from './ImageUploadPlugin';
import ImagePlugin from './ImagePlugin';
import { ImageNode } from './ImageNode';
import { IMAGE_TRANSFORMER } from './ImageTransformer';
import { $patchStyleText } from '@lexical/selection';
import './ContentWrapperStyles.css';



// Toolbar components
import {
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  TextFormatType,
  FORMAT_ELEMENT_COMMAND,
  $createParagraphNode,
} from 'lexical';
import {
  $isHeadingNode,
  $createHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  $createListNode,
  $createListItemNode,
} from '@lexical/list';
import {
  $createCodeNode,
} from '@lexical/code';
import CodeBlockPlugin from './CodeBlockPlugin';
import YouTubePlugin, { INSERT_YOUTUBE_COMMAND } from './YouTubePlugin';
import { YouTubeNode } from './YouTubeNode';
import FontFamilyPlugin, { FORMAT_FONT_FAMILY_COMMAND } from './FontFamilyPlugin';
import FontSelector from './FontSelector';
import FontSizePlugin, { FORMAT_FONT_SIZE_COMMAND } from './FontSizePlugin';
import FontSizeSelector from './FontSizeSelector';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Link as LinkIcon,
  Code,
  Youtube,
  Table,
  Eraser,
  Image,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface LexicalEditorProps {
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onHtmlChange?: (html: string) => void;
  autoFocus?: boolean;
  readOnly?: boolean;
  className?: string;
  showToolbar?: boolean;
  minHeight?: string;
  articleId?: string; // For image uploads
  onArticleCreate?: () => Promise<string | undefined>; // Callback to create article
}

export interface LexicalEditorRef {
  getMarkdown: () => string;
  getHtml: () => string;
  getEditorStateJson: () => string;
  setEditorStateFromJson: (json: string) => void;
  setMarkdown: (markdown: string) => void;
  setHtml: (html: string) => void;
  clear: () => void;
  focus: () => void;
}

// Toolbar plugin
function ToolbarPlugin({ articleId, onArticleCreate }: { articleId?: string; onArticleCreate?: () => Promise<string | undefined> }) {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);
  const [isStrikethrough, setIsStrikethrough] = React.useState(false);
  const [currentFontFamily, setCurrentFontFamily] = React.useState('system');
  const [currentFontSize, setCurrentFontSize] = React.useState('base');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
    }
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      1
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      1
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      1
    );
  }, [editor]);

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const clearFormatting = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Clear text formatting (bold, italic, underline, strikethrough)
        // Remove each format type individually
        const formatTypes: TextFormatType[] = ['bold', 'italic', 'underline', 'strikethrough'];
        formatTypes.forEach(format => {
          if (selection.hasFormat(format)) {
            selection.formatText(format);
          }
        });
        
        // Clear colors using style patching
        $patchStyleText(selection, {
          'color': '',
          'background-color': '',
          'font-family': '',
          'font-size': '',
        });
        
        // Convert to normal paragraph if it's a heading or list
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getKey() === 'root' 
          ? anchorNode 
          : anchorNode.getTopLevelElementOrThrow();
        
        if ($isHeadingNode(element)) {
          element.replace($createParagraphNode().append(...element.getChildren()));
        }
      }
    });
    
    // Also dispatch the clear color commands to ensure complete cleanup
    editor.dispatchCommand(CLEAR_TEXT_COLOR_COMMAND, undefined);
    editor.dispatchCommand(CLEAR_BACKGROUND_COLOR_COMMAND, undefined);
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getKey() === 'root' 
          ? anchorNode 
          : anchorNode.getTopLevelElementOrThrow();
        
        if ($isHeadingNode(element)) {
          element.replace($createHeadingNode(headingSize));
        } else {
          const heading = $createHeadingNode(headingSize);
          element.replace(heading);
        }
      }
    });
  };

  const formatBulletList = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getKey() === 'root' 
          ? anchorNode 
          : anchorNode.getTopLevelElementOrThrow();
        
        const listNode = $createListNode('bullet');
        const listItemNode = $createListItemNode();
        listNode.append(listItemNode);
        element.replace(listNode);
      }
    });
  };

  const formatNumberedList = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getKey() === 'root' 
          ? anchorNode 
          : anchorNode.getTopLevelElementOrThrow();
        
        const listNode = $createListNode('number');
        const listItemNode = $createListItemNode();
        listNode.append(listItemNode);
        element.replace(listNode);
      }
    });
  };

  const formatCodeBlock = () => {
    // Simple dialog to select language
    const languages = [
      'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c',
      'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
      'scss', 'sql', 'json', 'yaml', 'xml', 'bash', 'plain'
    ];
    
    const language = window.prompt(
      `Enter programming language (${languages.slice(0, 8).join(', ')}, etc.):`,
      'javascript'
    );
    
    if (language !== null) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element = anchorNode.getKey() === 'root' 
            ? anchorNode 
            : anchorNode.getTopLevelElementOrThrow();
          
          const codeNode = $createCodeNode(language.toLowerCase() || 'javascript');
          element.replace(codeNode);
        }
      });
    }
  };

  const insertYouTube = () => {
    const url = window.prompt(
      'Enter YouTube URL or Video ID:\n\nSupported formats:\n• https://www.youtube.com/watch?v=VIDEO_ID\n• https://youtu.be/VIDEO_ID\n• https://www.youtube.com/shorts/VIDEO_ID\n• Just the video ID (11 characters)'
    );
    
    if (url) {
      editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, url);
    }
  };

  const insertTable = () => {
    const rows = window.prompt('Number of rows:', '3');
    const columns = window.prompt('Number of columns:', '3');
    
    if (rows && columns) {
      const rowCount = parseInt(rows, 10);
      const columnCount = parseInt(columns, 10);
      
      if (rowCount > 0 && columnCount > 0 && rowCount <= 20 && columnCount <= 10) {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
          columns: columnCount.toString(),
          rows: rowCount.toString(),
        });
      } else {
        alert('Please enter valid numbers (rows: 1-20, columns: 1-10)');
      }
    }
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    editor.dispatchCommand(FORMAT_FONT_FAMILY_COMMAND, fontFamily);
  };

  const handleFontSizeChange = (fontSize: string) => {
    editor.dispatchCommand(FORMAT_FONT_SIZE_COMMAND, fontSize);
  };



  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
      <FontSelector
        selectedFont={currentFontFamily}
        onFontChange={handleFontFamilyChange}
      />
      
      <FontSizeSelector
        selectedSize={currentFontSize}
        onSizeChange={handleFontSizeChange}
      />
      
      <TextColorPlugin showToolbar={true} />
      
      <BackgroundColorPlugin showToolbar={true} />
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={!canUndo}
        className="p-1 h-8 w-8"
      >
        <Undo size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={!canRedo}
        className="p-1 h-8 w-8"
      >
        <Redo size={16} />
      </Button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <Button
        type="button"
        variant={isBold ? "default" : "ghost"}
        size="sm"
        onClick={() => formatText('bold')}
        className="p-1 h-8 w-8"
      >
        <Bold size={16} />
      </Button>
      <Button
        type="button"
        variant={isItalic ? "default" : "ghost"}
        size="sm"
        onClick={() => formatText('italic')}
        className="p-1 h-8 w-8"
      >
        <Italic size={16} />
      </Button>
      <Button
        type="button"
        variant={isUnderline ? "default" : "ghost"}
        size="sm"
        onClick={() => formatText('underline')}
        className="p-1 h-8 w-8"
      >
        <Underline size={16} />
      </Button>
      <Button
        type="button"
        variant={isStrikethrough ? "default" : "ghost"}
        size="sm"
        onClick={() => formatText('strikethrough')}
        className="p-1 h-8 w-8"
      >
        <Strikethrough size={16} />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={clearFormatting}
        className="p-1 h-8 w-8"
        title="Clear Formatting"
      >
        <Eraser size={16} />
      </Button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatHeading('h1')}
        className="p-1 h-8 w-8"
      >
        <Heading1 size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatHeading('h2')}
        className="p-1 h-8 w-8"
      >
        <Heading2 size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatHeading('h3')}
        className="p-1 h-8 w-8"
      >
        <Heading3 size={16} />
      </Button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatBulletList}
        className="p-1 h-8 w-8"
      >
        <List size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatNumberedList}
        className="p-1 h-8 w-8"
      >
        <ListOrdered size={16} />
      </Button>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatCodeBlock}
        className="p-1 h-8 w-8"
        title="Code Block"
      >
        <Code size={16} />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertYouTube}
        className="p-1 h-8 w-8"
        title="YouTube Video"
      >
        <Youtube size={16} />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) {
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.insertText(`[${selection.getTextContent() || 'Link'}](${url})`);
              }
            });
          }
        }}
        className="p-1 h-8 w-8"
      >
        <LinkIcon size={16} />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertTable}
        className="p-1 h-8 w-8"
        title="Insert Table"
      >
        <Table size={16} />
      </Button>
      
      <ImageUploadPlugin articleId={articleId} onArticleCreate={onArticleCreate} showToolbar={true} />
    </div>
  );
}

// Content change handler plugin
function OnChangePlugin({ 
  onChange, 
  onHtmlChange 
}: { 
  onChange?: (value: string) => void;
  onHtmlChange?: (html: string) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        if (onChange) {
          const markdown = $convertToMarkdownString(ALL_TRANSFORMERS);
          onChange(markdown);
        }
        
        if (onHtmlChange) {
          const htmlString = $generateHtmlFromNodes(editor, null);
          onHtmlChange(htmlString);
        }
      });
    });
  }, [editor, onChange, onHtmlChange]);

  return null;
}

// Initial Value Plugin - handles updating content when initialValue prop changes
function InitialValuePlugin({ initialValue }: { initialValue: string }) {
  const [editor] = useLexicalComposerContext();
  const [hasInitialized, setHasInitialized] = React.useState(false);

  useEffect(() => {
    if (initialValue && !hasInitialized) {
      // Set initial content only once when component first mounts with content
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        $convertFromMarkdownString(initialValue, ALL_TRANSFORMERS);
      });
      setHasInitialized(true);
    } else if (initialValue && hasInitialized) {
      // Update content when initialValue changes (e.g., after loading article data)
      const currentContent = editor.getEditorState().read(() => {
        return $convertToMarkdownString(ALL_TRANSFORMERS);
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
function EditorRefPlugin({ editorRef }: { editorRef: React.MutableRefObject<LexicalEditorRef | null> }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editorRef.current = {
      getMarkdown: () => {
        let markdown = '';
        editor.getEditorState().read(() => {
          markdown = $convertToMarkdownString(TRANSFORMERS);
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
      getEditorStateJson: () => {
        return JSON.stringify(editor.getEditorState().toJSON());
      },
      setEditorStateFromJson: (json: string) => {
        try {
          const editorState = editor.parseEditorState(JSON.parse(json));
          editor.setEditorState(editorState);
        } catch (error) {
          console.error('Failed to parse editor state from JSON:', error);
        }
      },
      setMarkdown: (markdown: string) => {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          if (markdown) {
            $convertFromMarkdownString(markdown, ALL_TRANSFORMERS);
          }
        });
      },
      setHtml: (html: string) => {
        editor.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(html, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          $getRoot().clear();
          $getRoot().append(...nodes);
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

// Combined transformers including YouTube and Image
const ALL_TRANSFORMERS = [...TRANSFORMERS, YOUTUBE_TRANSFORMER, IMAGE_TRANSFORMER];

// Main editor component
const LexicalEditor = forwardRef<LexicalEditorRef, LexicalEditorProps>(({
  initialValue = '',
  placeholder = 'Start typing...',
  onChange,
  onHtmlChange,
  autoFocus = false,
  readOnly = false,
  className = '',
  showToolbar = true,
  minHeight = '200px',
  articleId,
  onArticleCreate,
}, ref) => {
  const editorRef = React.useRef<LexicalEditorRef | null>(null);

  const initialConfig = useMemo(() => ({
    namespace: 'LexicalEditor',
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
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
  }), []);

  useImperativeHandle(ref, () => ({
    getMarkdown: () => editorRef.current?.getMarkdown() || '',
    getHtml: () => editorRef.current?.getHtml() || '',
    getEditorStateJson: () => editorRef.current?.getEditorStateJson() || '',
    setEditorStateFromJson: (json: string) => editorRef.current?.setEditorStateFromJson(json),
    setMarkdown: (markdown: string) => editorRef.current?.setMarkdown(markdown),
    setHtml: (html: string) => editorRef.current?.setHtml(html),
    clear: () => editorRef.current?.clear(),
    focus: () => editorRef.current?.focus(),
  }), []);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={`border border-gray-300 rounded-lg overflow-hidden content-wrapper ${className}`}>
        {showToolbar && <ToolbarPlugin articleId={articleId} onArticleCreate={onArticleCreate} />}
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
          <OnChangePlugin onChange={onChange} onHtmlChange={onHtmlChange} />
          <InitialValuePlugin initialValue={initialValue} />
          <EditorRefPlugin editorRef={editorRef} />
          <HistoryPlugin />
          {autoFocus && <AutoFocusPlugin />}
          <LinkPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={ALL_TRANSFORMERS} />
          <TabIndentationPlugin />
          <CodeHighlightPlugin />
          <CodeBlockPlugin />
          <YouTubePlugin />
          <FontFamilyPlugin />
          <FontSizePlugin />
          <TextColorPlugin showToolbar={false} />
          <BackgroundColorPlugin showToolbar={false} />
          <ImagePlugin />
          <ImageUploadPlugin articleId={articleId} onArticleCreate={onArticleCreate} showToolbar={false} />
          <TablePlugin hasCellMerge={true} hasCellBackgroundColor={true} />
        </div>
      </div>
    </LexicalComposer>
  );
});

LexicalEditor.displayName = 'LexicalEditor';

export default LexicalEditor;