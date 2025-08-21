/**
 * Code highlighting utilities for Lexical editor
 */

// Language mapping for common language aliases
export const CODE_LANGUAGE_MAP: Record<string, string> = {
  cpp: 'cpp',
  'c++': 'cpp',
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
  jsx: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  tsx: 'typescript',
  md: 'markdown',
  plaintext: 'plain',
  python: 'python',
  py: 'python',
  text: 'plain',
  html: 'markup',
  xml: 'markup',
  css: 'css',
  scss: 'css',
  sass: 'css',
  less: 'css',
  sql: 'sql',
  mysql: 'sql',
  postgresql: 'sql',
  php: 'php',
  json: 'json',
  bash: 'bash',
  shell: 'bash',
  sh: 'bash',
  go: 'go',
  golang: 'go',
  rust: 'rust',
  rs: 'rust',
  swift: 'swift',
  powershell: 'powershell',
  ps1: 'powershell',
  objectivec: 'objectivec',
  'objective-c': 'objectivec',
  objc: 'objectivec',
  c: 'c',
  diff: 'diff',
};

// Friendly names for display
export const CODE_LANGUAGE_FRIENDLY_NAME_MAP: Record<string, string> = {
  c: 'C',
  cpp: 'C++',
  css: 'CSS',
  markup: 'HTML',
  html: 'HTML',
  xml: 'XML',
  java: 'Java',
  javascript: 'JavaScript',
  js: 'JavaScript',
  jsx: 'React JSX',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  tsx: 'React TSX',
  markdown: 'Markdown',
  md: 'Markdown',
  objectivec: 'Objective-C',
  plain: 'Plain Text',
  powershell: 'PowerShell',
  python: 'Python',
  py: 'Python',
  rust: 'Rust',
  sql: 'SQL',
  swift: 'Swift',
  php: 'PHP',
  json: 'JSON',
  bash: 'Bash',
  shell: 'Shell',
  go: 'Go',
  diff: 'Diff',
};

/**
 * Normalize a code language to its canonical form
 */
export function normalizeCodeLang(lang: string): string {
  const normalized = lang.toLowerCase();
  return CODE_LANGUAGE_MAP[normalized] || normalized;
}

/**
 * Get friendly display name for a language
 */
export function getLanguageFriendlyName(lang: string): string {
  const normalizedLang = normalizeCodeLang(lang);
  return CODE_LANGUAGE_FRIENDLY_NAME_MAP[normalizedLang] || normalizedLang;
}

/**
 * Get available language options for dropdowns
 */
export function getCodeLanguageOptions(): Array<[string, string]> {
  const options: Array<[string, string]> = [];
  
  // Add common languages first
  const commonLanguages = [
    'javascript',
    'typescript',
    'python',
    'java',
    'cpp',
    'c',
    'css',
    'markup',
    'markdown',
    'json',
    'sql',
    'bash',
    'php',
    'go',
    'rust',
    'swift',
    'plain',
  ];

  for (const lang of commonLanguages) {
    options.push([lang, getLanguageFriendlyName(lang)]);
  }

  return options;
}

/**
 * Check if Prism supports a given language
 */
export function isLanguageSupported(language: string): boolean {
  if (typeof window === 'undefined' || !window.Prism) {
    return false;
  }
  
  const normalizedLang = normalizeCodeLang(language);
  return normalizedLang in window.Prism.languages;
}

/**
 * Default language for code blocks
 */
export const DEFAULT_CODE_LANGUAGE = 'plain';