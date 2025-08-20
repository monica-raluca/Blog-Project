import React, { useEffect, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand
} from 'lexical';
import { $patchStyleText } from '@lexical/selection';

export const FORMAT_TEXT_COLOR_COMMAND: LexicalCommand<string> = createCommand(
  'FORMAT_TEXT_COLOR_COMMAND',
);

export default function TextColorPlugin(): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const applyTextColor = useCallback((color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, {
          'color': color,
        });
      }
    });
  }, [editor]);

  useEffect(() => {
    const unregisterTextColorCommand = editor.registerCommand<string>(
      FORMAT_TEXT_COLOR_COMMAND,
      (color) => {
        applyTextColor(color);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    return () => {
      unregisterTextColorCommand();
    };
  }, [editor, applyTextColor]);

  return null;
}