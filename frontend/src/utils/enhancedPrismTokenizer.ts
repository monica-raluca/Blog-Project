/**
 * Enhanced Prism tokenizer for Lexical code highlighting
 * Based on @lexical/code implementation with improvements
 */

import type { CodeNode } from '@lexical/code';
import type { LexicalNode } from 'lexical';
import type { Token, TokenStream } from 'prismjs';

import { $createLineBreakNode, $createTabNode } from 'lexical';
import { $createCodeHighlightNode } from '@lexical/code';
import { normalizeCodeLang, DEFAULT_CODE_LANGUAGE } from './codeHighlight';

// Ensure Prism is available
declare global {
  interface Window {
    Prism: typeof import('prismjs');
  }
}

export interface EnhancedTokenizer {
  defaultLanguage: string;
  tokenize(code: string, language?: string): (string | Token)[];
  $tokenize(codeNode: CodeNode, language?: string): LexicalNode[];
}

/**
 * Check if a language is loaded in Prism
 */
function isCodeLanguageLoaded(language: string): boolean {
  if (typeof window === 'undefined' || !window.Prism) {
    return false;
  }
  
  const normalizedLang = normalizeCodeLang(language);
  try {
    return normalizedLang in window.Prism.languages;
  } catch {
    return false;
  }
}

/**
 * Get text content from a Prism token
 */
function getTextContent(token: TokenStream): string {
  if (typeof token === 'string') {
    return token;
  } else if (Array.isArray(token)) {
    return token.map(getTextContent).join('');
  } else {
    return getTextContent(token.content);
  }
}

/**
 * Handle diff language highlighting (diff-javascript, diff-python, etc.)
 */
function getDiffedLanguage(language: string): string | null {
  const DIFF_LANGUAGE_REGEX = /^diff-([\w-]+)/i;
  const diffLanguageMatch = DIFF_LANGUAGE_REGEX.exec(language);
  return diffLanguageMatch ? diffLanguageMatch[1] : null;
}

/**
 * Enhanced diff tokenization (extracted from Lexical)
 */
function tokenizeDiffHighlight(
  tokens: (string | Token)[],
  language: string,
): Array<string | Token> {
  if (typeof window === 'undefined' || !window.Prism) {
    return tokens;
  }

  const diffLanguage = language;
  const diffGrammar = window.Prism.languages[diffLanguage];
  if (!diffGrammar) {
    return tokens;
  }

  const env = { tokens };
  const PREFIXES: Record<string, string> = (
    window.Prism.languages.diff as Record<string, Record<string, string>>
  ).PREFIXES;

  for (const token of env.tokens) {
    if (
      typeof token === 'string' ||
      !(token.type in PREFIXES) ||
      !Array.isArray(token.content)
    ) {
      continue;
    }

    const type = token.type as keyof typeof PREFIXES;
    let insertedPrefixes = 0;
    const getPrefixToken = () => {
      insertedPrefixes++;
      return new window.Prism.Token(
        'prefix',
        PREFIXES[type],
        type.replace(/^(\w+).*/, '$1'),
      );
    };

    const withoutPrefixes = token.content.filter(
      (t) => typeof t === 'string' || t.type !== 'prefix',
    );
    const prefixCount = token.content.length - withoutPrefixes.length;
    const diffTokens = window.Prism.tokenize(
      getTextContent(withoutPrefixes),
      diffGrammar,
    );

    // re-insert prefixes
    diffTokens.unshift(getPrefixToken());

    const LINE_BREAK = /\r\n|\n/g;
    const insertAfterLineBreakString = (text: string) => {
      const result: TokenStream = [];
      LINE_BREAK.lastIndex = 0;
      let last = 0;
      let m;
      while (insertedPrefixes < prefixCount && (m = LINE_BREAK.exec(text))) {
        const end = m.index + m[0].length;
        result.push(text.slice(last, end));
        last = end;
        result.push(getPrefixToken());
      }

      if (result.length === 0) {
        return undefined;
      }

      if (last < text.length) {
        result.push(text.slice(last));
      }
      return result;
    };

    const insertAfterLineBreak = (toks: (string | Token)[]) => {
      for (let i = 0; i < toks.length && insertedPrefixes < prefixCount; i++) {
        const tok = toks[i];

        if (typeof tok === 'string') {
          const inserted = insertAfterLineBreakString(tok);
          if (inserted) {
            toks.splice(i, 1, ...inserted);
            i += inserted.length - 1;
          }
        } else if (typeof tok.content === 'string') {
          const inserted = insertAfterLineBreakString(tok.content);
          if (inserted) {
            tok.content = inserted;
          }
        } else if (Array.isArray(tok.content)) {
          insertAfterLineBreak(tok.content);
        } else {
          insertAfterLineBreak([tok.content]);
        }
      }
    };

    insertAfterLineBreak(diffTokens);

    if (insertedPrefixes < prefixCount) {
      diffTokens.push(getPrefixToken());
    }

    token.content = diffTokens;
  }

  return env.tokens;
}

/**
 * Convert Prism tokens to Lexical nodes
 */
function $mapTokensToLexicalStructure(
  tokens: Array<string | Token>,
  type?: string,
): LexicalNode[] {
  const nodes: LexicalNode[] = [];

  for (const token of tokens) {
    if (typeof token === 'string') {
      const partials = token.split(/(\n|\t)/);
      const partialsLength = partials.length;
      for (let i = 0; i < partialsLength; i++) {
        const part = partials[i];
        if (part === '\n' || part === '\r\n') {
          nodes.push($createLineBreakNode());
        } else if (part === '\t') {
          nodes.push($createTabNode());
        } else if (part.length > 0) {
          nodes.push($createCodeHighlightNode(part, type));
        }
      }
    } else {
      const { content, alias } = token;
      if (typeof content === 'string') {
        nodes.push(
          ...$mapTokensToLexicalStructure(
            [content],
            token.type === 'prefix' && typeof alias === 'string'
              ? alias
              : token.type,
          ),
        );
      } else if (Array.isArray(content)) {
        nodes.push(
          ...$mapTokensToLexicalStructure(
            content,
            token.type === 'unchanged' ? undefined : token.type,
          ),
        );
      }
    }
  }

  return nodes;
}

/**
 * Enhanced Prism tokenizer implementation
 */
export const EnhancedPrismTokenizer: EnhancedTokenizer = {
  defaultLanguage: DEFAULT_CODE_LANGUAGE,

  tokenize(code: string, language?: string): (string | Token)[] {
    if (typeof window === 'undefined' || !window.Prism) {
      return [code];
    }

    const normalizedLang = normalizeCodeLang(language || this.defaultLanguage);
    const grammar = window.Prism.languages[normalizedLang] || window.Prism.languages[this.defaultLanguage];
    
    if (!grammar) {
      return [code];
    }

    return window.Prism.tokenize(code, grammar);
  },

  $tokenize(codeNode: CodeNode, language?: string): LexicalNode[] {
    if (typeof window === 'undefined' || !window.Prism) {
      return [$createCodeHighlightNode(codeNode.getTextContent())];
    }

    const normalizedLang = normalizeCodeLang(language || this.defaultLanguage);
    const diffedLanguage = getDiffedLanguage(normalizedLang);
    
    const code = codeNode.getTextContent();

    let tokens: Array<string | Token> = window.Prism.tokenize(
      code,
      window.Prism.languages[diffedLanguage ? 'diff' : normalizedLang] || 
      window.Prism.languages[this.defaultLanguage],
    );

    // Handle diff highlighting
    if (diffedLanguage) {
      tokens = tokenizeDiffHighlight(tokens, diffedLanguage);
    }

    return $mapTokensToLexicalStructure(tokens);
  },
};

/**
 * Check if Prism and required languages are available
 */
export function checkPrismAvailability(): boolean {
  return typeof window !== 'undefined' && !!window.Prism && !!window.Prism.languages;
}

/**
 * Get available Prism languages
 */
export function getAvailablePrismLanguages(): string[] {
  if (!checkPrismAvailability()) {
    return [];
  }

  return Object.keys(window.Prism.languages)
    .filter(
      (language) => typeof window.Prism.languages[language] !== 'function',
    )
    .sort();
}