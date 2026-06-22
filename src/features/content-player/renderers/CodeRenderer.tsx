import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface CodeRendererProps {
  fileName: string;
  content: string;
  language?: string;
}

export const CodeRenderer: React.FC<CodeRendererProps> = ({ fileName, content, language }) => {
  const [copied, setCopied] = React.useState(false);

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
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] overflow-hidden relative">
      {/* Absolute Copy Button to keep it clean */}
      <button 
        onClick={handleCopy}
        className="absolute top-4 right-4 z-20 bg-[#333]/80 hover:bg-[#444] text-white p-2 rounded-lg transition-all backdrop-blur-sm border border-white/10"
        title="Copy Code"
      >
        {copied ? <Check className="w-4 h-4 text-green" /> : <Copy className="w-4 h-4" />}
      </button>

      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-[#333]">
        <SyntaxHighlighter
          language={getLanguage()}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '2rem',
            background: 'transparent',
            fontSize: '12px',
            lineHeight: '1.6',
          }}
          showLineNumbers={true}
          lineNumberStyle={{ minWidth: '3.5em', paddingRight: '1em', color: '#858585', textAlign: 'right' }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
