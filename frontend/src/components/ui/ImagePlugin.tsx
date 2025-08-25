import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical';
import { mergeRegister } from '@lexical/utils';
import { useEffect } from 'react';
import { $createImageNode, ImageNode } from './ImageNode';

export interface InsertImagePayload {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  maxWidth?: number;
  alignment?: 'left' | 'center' | 'right';
}

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand('INSERT_IMAGE_COMMAND');



export default function ImagePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagePlugin: ImageNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_IMAGE_COMMAND,
        (payload: InsertImagePayload) => {
          const imageNode = $createImageNode({
            src: payload.src,
            altText: payload.altText,
            width: payload.width,
            height: payload.height,
            maxWidth: payload.maxWidth,
            alignment: payload.alignment,
          });
          $insertNodes([imageNode]);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  return null;
}