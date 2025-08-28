import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { DecoratorNode } from 'lexical';

export interface SeparatorPayload {
  key?: NodeKey;
}

export type SerializedSeparatorNode = Spread<
  {
    type: 'separator';
    version: 1;
  },
  SerializedLexicalNode
>;

function convertSeparatorElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLElement) {
    if (domNode.tagName === 'HR') {
      const node = $createSeparatorNode();
      return { node };
    }
  }
  return null;
}

export class SeparatorNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return 'separator';
  }

  static clone(node: SeparatorNode): SeparatorNode {
    return new SeparatorNode(node.__key);
  }

  static importJSON(serializedNode: SerializedSeparatorNode): SeparatorNode {
    const node = $createSeparatorNode();
    return node;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: (node: Node) => ({
        conversion: convertSeparatorElement,
        priority: 1,
      }),
    };
  }

  exportJSON(): SerializedSeparatorNode {
    return {
      type: 'separator',
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('hr');
    element.style.border = 'none';
    element.style.borderTop = '2px solid #e5e7eb';
    element.style.margin = '20px 0';
    element.style.height = '1px';
    return { element };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const hr = document.createElement('hr');
    hr.style.border = 'none';
    hr.style.borderTop = '2px solid #e5e7eb';
    hr.style.margin = '20px 0';
    hr.style.height = '1px';
    hr.style.cursor = 'pointer';
    return hr;
  }

  updateDOM(): boolean {
    return false;
  }

  getTextContent(): string {
    return '\n';
  }

  isInline(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <hr 
        style={{
          border: 'none',
          borderTop: '2px solid #e5e7eb',
          margin: '20px 0',
          height: '1px',
          cursor: 'pointer'
        }}
      />
    );
  }
}

export function $createSeparatorNode(): SeparatorNode {
  return new SeparatorNode();
}

export function $isSeparatorNode(
  node: LexicalNode | null | undefined,
): node is SeparatorNode {
  return node instanceof SeparatorNode;
}