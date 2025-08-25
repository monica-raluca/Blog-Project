import { $createImageNode, $isImageNode, ImageNode } from './ImageNode';
import { ElementTransformer } from '@lexical/markdown';

export const IMAGE_TRANSFORMER: ElementTransformer = {
  dependencies: [ImageNode],
  export: (node) => {
    if (!$isImageNode(node)) {
      return null;
    }
    return `![${node.getAltText()}](${node.getSrc()})`;
  },
  regExp: /^!\[([^\]]*)\]\(([^)]+)\)$/,
  replace: (textNode, match) => {
    const [, altText, src] = match;
    const imageNode = $createImageNode({
      src,
      altText,
      maxWidth: 400,
      alignment: 'left', // Default to left for better text wrapping
    });
    textNode.replace(imageNode);
  },
  type: 'element',
};