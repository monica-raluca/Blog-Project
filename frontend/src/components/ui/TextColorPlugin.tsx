import React, { useEffect, useCallback, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
  $isRangeSelection,
  $getNodeByKey
} from 'lexical';
import { $patchStyleText, $getSelectionStyleValueForProperty } from '@lexical/selection';
import ColorPicker from './ColorPicker';

export const FORMAT_TEXT_COLOR_COMMAND: LexicalCommand<string> = createCommand(
  'FORMAT_TEXT_COLOR_COMMAND',
);

export const CLEAR_TEXT_COLOR_COMMAND: LexicalCommand<void> = createCommand(
  'CLEAR_TEXT_COLOR_COMMAND',
);

interface TextColorPluginProps {
  showToolbar?: boolean;
}

export default function TextColorPlugin({ showToolbar = false }: TextColorPluginProps): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [currentTextColor, setCurrentTextColor] = useState<string>('');

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

  const clearTextColor = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, {
          'color': '',
        });
      }
    });
  }, [editor]);

  const updateTextColorFromSelection = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const color = $getSelectionStyleValueForProperty(selection, 'color', '');
        setCurrentTextColor(color);
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

    const unregisterClearTextColorCommand = editor.registerCommand<void>(
      CLEAR_TEXT_COLOR_COMMAND,
      () => {
        clearTextColor();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    // Update color when selection changes
    const unregisterUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateTextColorFromSelection();
      });
    });

    return () => {
      unregisterTextColorCommand();
      unregisterClearTextColorCommand();
      unregisterUpdateListener();
    };
  }, [editor, applyTextColor, clearTextColor, updateTextColorFromSelection]);

  const handleColorChange = (color: string) => {
    applyTextColor(color);
  };

  const handleColorClear = () => {
    clearTextColor();
  };

  if (!showToolbar) {
    return null;
  }

  return (
    <ColorPicker
      value={currentTextColor}
      onChange={handleColorChange}
      onClear={handleColorClear}
      placeholder="Text color"
      showClearButton={true}
    />
  );
}