import React, { useEffect, useCallback, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
  $isRangeSelection
} from 'lexical';
import { $patchStyleText, $getSelectionStyleValueForProperty } from '@lexical/selection';
import ColorPicker from './ColorPicker';

export const FORMAT_BACKGROUND_COLOR_COMMAND: LexicalCommand<string> = createCommand(
  'FORMAT_BACKGROUND_COLOR_COMMAND',
);

export const CLEAR_BACKGROUND_COLOR_COMMAND: LexicalCommand<void> = createCommand(
  'CLEAR_BACKGROUND_COLOR_COMMAND',
);

interface BackgroundColorPluginProps {
  showToolbar?: boolean;
}

export default function BackgroundColorPlugin({ showToolbar = false }: BackgroundColorPluginProps): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState<string>('');

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

  const clearBackgroundColor = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        $patchStyleText(selection, {
          'background-color': '',
        });
      }
    });
  }, [editor]);

  const updateBackgroundColorFromSelection = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const color = $getSelectionStyleValueForProperty(selection, 'background-color', '');
        setCurrentBackgroundColor(color);
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

    const unregisterClearBackgroundColorCommand = editor.registerCommand<void>(
      CLEAR_BACKGROUND_COLOR_COMMAND,
      () => {
        clearBackgroundColor();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );

    // Update color when selection changes
    const unregisterUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateBackgroundColorFromSelection();
      });
    });

    return () => {
      unregisterBackgroundColorCommand();
      unregisterClearBackgroundColorCommand();
      unregisterUpdateListener();
    };
  }, [editor, applyBackgroundColor, clearBackgroundColor, updateBackgroundColorFromSelection]);

  const handleColorChange = (color: string) => {
    applyBackgroundColor(color);
  };

  const handleColorClear = () => {
    clearBackgroundColor();
  };

  if (!showToolbar) {
    return null;
  }

  return (
    <ColorPicker
      value={currentBackgroundColor}
      onChange={handleColorChange}
      onClear={handleColorClear}
      placeholder="Background"
      showClearButton={true}
    />
  );
}