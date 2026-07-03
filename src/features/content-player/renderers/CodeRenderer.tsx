import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface CodeRendererProps {
  fileName: string;
  content: string;
  language?: string;
}

export const CodeRenderer: React.FC<CodeRendererProps> = ({ fileName, content, language }) => {
  const [copied, setCopied] = React.useState(false);
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguage = () => {
    if (language) return language;
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'py': return 'python';
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'jsx': return 'jsx';
      case 'tsx': return 'tsx';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'ipynb': return 'python';
      default: return 'text';
    }
  };

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden relative ${isLight ? 'bg-gray-50' : 'bg-[#1e1e1e]'}`}>
      {/* Absolute Copy Button to keep it clean */}
      <button 
        onClick={handleCopy}
        className={`absolute top-4 right-4 z-20 p-2 rounded-lg transition-all backdrop-blur-sm border ${
          isLight 
            ? 'bg-white/80 hover:bg-gray-100 text-gray-700 border-gray-200 shadow-sm' 
            : 'bg-[#333]/80 hover:bg-[#444] text-white border-white/10'
        }`}
        title="Copy Code"
      >
        {copied ? <Check className={`w-4 h-4 ${isLight ? 'text-green-600' : 'text-green'}`} /> : <Copy className="w-4 h-4" />}
      </button>

      <div className={`flex-1 overflow-auto scrollbar-thin ${isLight ? 'scrollbar-thumb-gray-300' : 'scrollbar-thumb-[#333]'}`}>
        <SyntaxHighlighter
          language={getLanguage()}
          style={isLight ? vs : vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '2rem',
            background: 'transparent',
            fontSize: '12px',
            lineHeight: '1.6',
          }}
          showLineNumbers={true}
          lineNumberStyle={{ minWidth: '3.5em', paddingRight: '1em', color: isLight ? '#9ca3af' : '#858585', textAlign: 'right' }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
