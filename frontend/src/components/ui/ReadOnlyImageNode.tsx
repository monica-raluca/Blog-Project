import {
  $applyNodeReplacement,
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

export interface ReadOnlyImagePayload {
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
    const node = $createReadOnlyImageNode({ altText, height, src, width });
    return { node };
  }
  return null;
}

export type SerializedReadOnlyImageNode = Spread<
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

export class ReadOnlyImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: number | undefined;
  __height: number | undefined;
  __maxWidth: number | undefined;
  __alignment: 'left' | 'center' | 'right';

  static getType(): string {
    return 'readonly-image';
  }

  static clone(node: ReadOnlyImageNode): ReadOnlyImageNode {
    return new ReadOnlyImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__alignment,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedReadOnlyImageNode): ReadOnlyImageNode {
    const { altText, height, width, maxWidth, src, alignment } = serializedNode;
    const node = $createReadOnlyImageNode({
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

  exportJSON(): SerializedReadOnlyImageNode {
    return {
      altText: this.getAltText(),
      height: this.__height,
      maxWidth: this.__maxWidth,
      src: this.getSrc(),
      type: 'readonly-image',
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

  getAlignment(): 'left' | 'center' | 'right' {
    return this.__alignment;
  }

  decorate(): JSX.Element {
    // Use dynamic import to avoid circular dependency
    const React = require('react');
    const ReadOnlyImageComponent = require('./ReadOnlyImageComponent').default;
    
    return React.createElement(ReadOnlyImageComponent, {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      maxWidth: this.__maxWidth || 500,
      alignment: this.__alignment,
    });
  }
}

export function $createReadOnlyImageNode({
  altText,
  height,
  maxWidth = 500,
  src,
  width,
  alignment = 'center',
  key,
}: ReadOnlyImagePayload): ReadOnlyImageNode {
  return $applyNodeReplacement(
    new ReadOnlyImageNode(src, altText, maxWidth, width, height, alignment, key),
  );
}

export function $isReadOnlyImageNode(
  node: LexicalNode | null | undefined,
): node is ReadOnlyImageNode {
  return node instanceof ReadOnlyImageNode;
}