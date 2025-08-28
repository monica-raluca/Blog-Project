import type { ElementTransformer } from '@lexical/markdown';
import { $createSeparatorNode, $isSeparatorNode, SeparatorNode } from './SeparatorNode';

export const SEPARATOR_TRANSFORMER: ElementTransformer = {
  dependencies: [SeparatorNode],
  export: (node) => {
    if (!$isSeparatorNode(node)) {
      return null;
    }
    return '---';
  },
  regExp: /^---\s*$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createSeparatorNode();
    if (isImport || parentNode.getNextSibling()) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }
    line.selectNext();
  },
  type: 'element',
};