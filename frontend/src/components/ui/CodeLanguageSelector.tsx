import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Code } from 'lucide-react';

interface Language {
  id: string;
  name: string;
  aliases?: string[];
}

const POPULAR_LANGUAGES: Language[] = [
  { id: 'javascript', name: 'JavaScript', aliases: ['js'] },
  { id: 'typescript', name: 'TypeScript', aliases: ['ts'] },
  { id: 'python', name: 'Python', aliases: ['py'] },
  { id: 'java', name: 'Java' },
  { id: 'csharp', name: 'C#', aliases: ['cs'] },
  { id: 'cpp', name: 'C++', aliases: ['c++', 'cc'] },
  { id: 'c', name: 'C' },
  { id: 'php', name: 'PHP' },
  { id: 'ruby', name: 'Ruby', aliases: ['rb'] },
  { id: 'go', name: 'Go', aliases: ['golang'] },
  { id: 'rust', name: 'Rust', aliases: ['rs'] },
  { id: 'swift', name: 'Swift' },
  { id: 'kotlin', name: 'Kotlin', aliases: ['kt'] },
];

const WEB_LANGUAGES: Language[] = [
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'scss', name: 'SCSS/Sass', aliases: ['sass'] },
  { id: 'less', name: 'Less' },
  { id: 'jsx', name: 'JSX' },
  { id: 'tsx', name: 'TSX' },
  { id: 'vue', name: 'Vue' },
  { id: 'angular', name: 'Angular' },
];

const DATA_LANGUAGES: Language[] = [
  { id: 'sql', name: 'SQL' },
  { id: 'json', name: 'JSON' },
  { id: 'yaml', name: 'YAML', aliases: ['yml'] },
  { id: 'xml', name: 'XML' },
  { id: 'markdown', name: 'Markdown', aliases: ['md'] },
  { id: 'csv', name: 'CSV' },
];

const SHELL_LANGUAGES: Language[] = [
  { id: 'bash', name: 'Bash', aliases: ['shell', 'sh'] },
  { id: 'powershell', name: 'PowerShell', aliases: ['ps1'] },
  { id: 'batch', name: 'Batch', aliases: ['bat', 'cmd'] },
  { id: 'dockerfile', name: 'Dockerfile' },
];

const OTHER_LANGUAGES: Language[] = [
  { id: 'plain', name: 'Plain Text', aliases: ['text', 'txt'] },
  { id: 'r', name: 'R' },
  { id: 'matlab', name: 'MATLAB' },
  { id: 'perl', name: 'Perl' },
  { id: 'lua', name: 'Lua' },
  { id: 'haskell', name: 'Haskell', aliases: ['hs'] },
  { id: 'scala', name: 'Scala' },
  { id: 'clojure', name: 'Clojure' },
  { id: 'erlang', name: 'Erlang' },
  { id: 'elixir', name: 'Elixir' },
];

interface CodeLanguageSelectorProps {
  selectedLanguage?: string;
  onLanguageChange: (language: string) => void;
}

export default function CodeLanguageSelector({ 
  selectedLanguage = 'javascript', 
  onLanguageChange 
}: CodeLanguageSelectorProps) {
  const findLanguageById = (id: string): Language | undefined => {
    const allLanguages = [
      ...POPULAR_LANGUAGES,
      ...WEB_LANGUAGES, 
      ...DATA_LANGUAGES,
      ...SHELL_LANGUAGES,
      ...OTHER_LANGUAGES
    ];
    return allLanguages.find(lang => lang.id === id);
  };

  const selectedLang = findLanguageById(selectedLanguage) || POPULAR_LANGUAGES[0];

  const renderLanguageGroup = (title: string, languages: Language[]) => (
    <SelectGroup key={title}>
      <SelectLabel className="text-xs font-medium text-gray-500">
        {title}
      </SelectLabel>
      {languages.map((language) => (
        <SelectItem
          key={language.id}
          value={language.id}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Code size={12} />
            <span>{language.name}</span>
            {language.aliases && (
              <span className="text-xs text-gray-500">
                ({language.aliases.join(', ')})
              </span>
            )}
          </div>
        </SelectItem>
      ))}
    </SelectGroup>
  );

  return (
    <Select value={selectedLanguage} onValueChange={onLanguageChange}>
      <SelectTrigger className="h-7 px-2 text-xs border-gray-300 hover:bg-gray-50 w-auto min-w-24">
        <div className="flex items-center gap-1">
          <Code size={12} />
          <SelectValue placeholder={selectedLang.name} />
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-80 overflow-y-auto">
        {renderLanguageGroup("Popular", POPULAR_LANGUAGES)}
        {renderLanguageGroup("Web", WEB_LANGUAGES)}
        {renderLanguageGroup("Data", DATA_LANGUAGES)}
        {renderLanguageGroup("Shell", SHELL_LANGUAGES)}
        {renderLanguageGroup("Other", OTHER_LANGUAGES)}
      </SelectContent>
    </Select>
  );
}