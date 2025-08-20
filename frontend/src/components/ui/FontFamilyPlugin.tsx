import React, { useEffect, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand
} from 'lexical';
import { $patchStyleText } from '@lexical/selection';

export const FORMAT_FONT_FAMILY_COMMAND: LexicalCommand<string> = createCommand(
  'FORMAT_FONT_FAMILY_COMMAND',
);

export default function FontFamilyPlugin(): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const applyFontFamily = useCallback((fontFamily: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, {
          'font-family': fontFamily,
        });
      }
    });
  }, [editor]);

  useEffect(() => {
    const unregisterFontCommand = editor.registerCommand<string>(
      FORMAT_FONT_FAMILY_COMMAND,
      (fontFamily) => {
        applyFontFamily(fontFamily);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    return () => {
      unregisterFontCommand();
    };
  }, [editor, applyFontFamily]);

  return null;
}