import {
  $applyNodeReplacement,
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

export interface ImagePayload {
  altText: string;
  height?: number;
  key?: NodeKey;
  maxWidth?: number;
  src: string;
  width?: number;
  alignment?: 'left' | 'center' | 'right';
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode;
    const node = $createImageNode({ altText, height, src, width });
    return { node };
  }
  return null;
}

export type SerializedImageNode = Spread<
  {
    altText: string;
    height?: number;
    maxWidth?: number;
    src: string;
    width?: number;
    alignment?: 'left' | 'center' | 'right';
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: number | undefined;
  __height: number | undefined;
  __maxWidth: number | undefined;
  __alignment: 'left' | 'center' | 'right';

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__alignment,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, width, maxWidth, src, alignment } = serializedNode;
    const node = $createImageNode({
      altText,
      height,
      maxWidth,
      src,
      width,
      alignment,
    });
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    if (this.__width !== undefined) {
      element.setAttribute('width', this.__width.toString());
    }
    if (this.__height !== undefined) {
      element.setAttribute('height', this.__height.toString());
    }
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText: string,
    maxWidth?: number,
    width?: number,
    height?: number,
    alignment: 'left' | 'center' | 'right' = 'center',
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width;
    this.__height = height;
    this.__alignment = alignment;
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      height: this.__height,
      maxWidth: this.__maxWidth,
      src: this.getSrc(),
      type: 'image',
      version: 1,
      width: this.__width,
      alignment: this.__alignment,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  setAltText(altText: string): void {
    const writable = this.getWritable();
    writable.__altText = altText;
  }

  setWidthAndHeight(width: number, height: number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setAlignment(alignment: 'left' | 'center' | 'right'): void {
    const writable = this.getWritable();
    writable.__alignment = alignment;
  }

  getAlignment(): 'left' | 'center' | 'right' {
    return this.__alignment;
  }

  decorate(): JSX.Element {
    // Use dynamic import to avoid circular dependency
    const React = require('react');
    const ResizableImageComponent = require('./ResizableImageComponent').default;
    
    return React.createElement(ResizableImageComponent, {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      maxWidth: this.__maxWidth || 500,
      alignment: this.__alignment,
      nodeKey: this.getKey(),
      resizable: true,
    });
  }
}

export function $createImageNode({
  altText,
  height,
  maxWidth = 500,
  src,
  width,
  alignment = 'center',
  key,
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(src, altText, maxWidth, width, height, alignment, key),
  );
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}