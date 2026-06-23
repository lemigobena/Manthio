import React from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import { useTheme } from '../../../../context/ThemeContext';

interface MonacoEditorProps {
  code: string;
  language: string;
  onChange: (value: string | undefined) => void;
  path?: string;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({ code, language, onChange, path }) => {
  const { theme } = useTheme();

  const handleBeforeMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('manthio-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
        { token: 'keyword', foreground: '00F5D4' },
        { token: 'string', foreground: 'a3be8c' },
      ],
      colors: {
        'editor.background': '#0D1117',
        'editor.foreground': '#d8dee9',
        'editorLineNumber.foreground': '#4c566a',
        'editor.selectionBackground': '#2e3440',
        'editorCursor.foreground': '#00F5D4',
      }
    });
    
    monaco.editor.defineTheme('manthio-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '0D7D6E' },
      ],
      colors: {
        'editor.background': '#FAF6EE',
        'editorLineNumber.foreground': '#a0aec0',
      }
    });
  };

  return (
    <Editor
      height="100%"
      path={path}
      language={language}
      value={code}
      theme={theme === 'dark' ? 'manthio-dark' : 'manthio-light'}
      beforeMount={handleBeforeMount}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        lineHeight: 1.6,
        padding: { top: 16, bottom: 16 },
        scrollBeyondLastLine: false,
        roundedSelection: false,
        renderLineHighlight: 'all',
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        }
      }}
      loading={
        <div className="flex h-full items-center justify-center text-muted animate-pulse">
          Loading editor...
        </div>
      }
    />
  );
};
