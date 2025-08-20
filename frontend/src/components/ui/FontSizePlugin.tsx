import React, { useEffect, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand
} from 'lexical';
import { $patchStyleText } from '@lexical/selection';

export const FORMAT_FONT_SIZE_COMMAND: LexicalCommand<string> = createCommand(
  'FORMAT_FONT_SIZE_COMMAND',
);

export default function FontSizePlugin(): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const applyFontSize = useCallback((fontSize: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, {
          'font-size': fontSize,
        });
      }
    });
  }, [editor]);

  useEffect(() => {
    const unregisterFontSizeCommand = editor.registerCommand<string>(
      FORMAT_FONT_SIZE_COMMAND,
      (fontSize) => {
        applyFontSize(fontSize);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    return () => {
      unregisterFontSizeCommand();
    };
  }, [editor, applyFontSize]);

  return null;
}