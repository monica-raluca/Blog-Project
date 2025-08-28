import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  createCommand,
  LexicalCommand,
} from 'lexical';
import { $createSeparatorNode } from './SeparatorNode';
import { useEffect } from 'react';
import { $createParagraphNode } from 'lexical';

export const INSERT_SEPARATOR_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_SEPARATOR_COMMAND',
);

export default function SeparatorPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_SEPARATOR_COMMAND,
      () => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          const separatorNode = $createSeparatorNode();
          const paragraphNode = $createParagraphNode();
          
          selection.insertNodes([separatorNode, paragraphNode]);
          paragraphNode.select();
        }

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
}