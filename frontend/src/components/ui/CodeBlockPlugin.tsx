import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  $isRangeSelection, 
  $getNodeByKey,
  NodeKey,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND
} from 'lexical';
import { $isCodeNode, CodeNode } from '@lexical/code';
import { mergeRegister } from '@lexical/utils';
import CodeLanguageSelector from './CodeLanguageSelector';

interface CodeBlockState {
  language: string;
  nodeKey: NodeKey;
}

export default function CodeBlockPlugin(): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [activeCodeBlock, setActiveCodeBlock] = useState<CodeBlockState | null>(null);

  const updateCodeBlockLanguage = useCallback((language: string) => {
    if (activeCodeBlock) {
      editor.update(() => {
        const node = $getNodeByKey(activeCodeBlock.nodeKey);
        if ($isCodeNode(node)) {
          node.setLanguage(language);
        }
      });
      setActiveCodeBlock(prev => prev ? { ...prev, language } : null);
    }
  }, [editor, activeCodeBlock]);

  const checkForCodeBlock = useCallback(() => {
    const selection = $getSelection();
    
    if (!$isRangeSelection(selection)) {
      setActiveCodeBlock(null);
      return;
    }

    const anchorNode = selection.anchor.getNode();
    let codeNode: CodeNode | null = null;
    
    // Check if we're inside a code block
    if ($isCodeNode(anchorNode)) {
      codeNode = anchorNode;
    } else {
      // Check if the parent is a code node
      const parent = anchorNode.getParent();
      if ($isCodeNode(parent)) {
        codeNode = parent;
      }
    }

    if (codeNode) {
      const language = codeNode.getLanguage() || 'javascript';
      setActiveCodeBlock({
        language,
        nodeKey: codeNode.getKey(),
      });
    } else {
      setActiveCodeBlock(null);
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          editor.getEditorState().read(() => {
            checkForCodeBlock();
          });
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, checkForCodeBlock]);

  if (!activeCodeBlock) {
    return null;
  }

  return (
    <div className="fixed top-2 right-2 z-50 bg-white rounded-lg shadow-lg border p-2">
      <div className="text-xs text-gray-600 mb-1">Code Language:</div>
      <CodeLanguageSelector
        selectedLanguage={activeCodeBlock.language}
        onLanguageChange={updateCodeBlockLanguage}
      />
    </div>
  );
}