import React, { useEffect, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand
} from 'lexical';
import { $patchStyleText } from '@lexical/selection';

export const FORMAT_BACKGROUND_COLOR_COMMAND: LexicalCommand<string> = createCommand(
  'FORMAT_BACKGROUND_COLOR_COMMAND',
);

export default function BackgroundColorPlugin(): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const applyBackgroundColor = useCallback((color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, {
          'background-color': color,
        });
      }
    });
  }, [editor]);

  useEffect(() => {
    const unregisterBackgroundColorCommand = editor.registerCommand<string>(
      FORMAT_BACKGROUND_COLOR_COMMAND,
      (color) => {
        applyBackgroundColor(color);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    return () => {
      unregisterBackgroundColorCommand();
    };
  }, [editor, applyBackgroundColor]);

  return null;
}