import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  onTaskClick?: (taskId: string) => void;
}

function MarkdownRenderer({ content, onTaskClick }: MarkdownRendererProps) {
  // Custom components for react-markdown
  const components: Partial<Components> = {
    // Custom link renderer to handle task references
    a: ({ children, href }) => {
      // Check if this is a task reference link (#CT-XXX)
      const taskIdMatch = href?.match(/^#(CT-\w+)$/);

      if (taskIdMatch && onTaskClick) {
        const taskId = taskIdMatch[1];
        return (
          <button
            onClick={() => onTaskClick(taskId)}
            className="text-primary hover:text-primary/80 underline font-mono text-sm cursor-pointer bg-transparent border-none p-0"
          >
            {children}
          </button>
        );
      }

      // Regular external link
      return (
        <a
          href={href}
          className="text-blue-600 hover:text-blue-800 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    },
    // Style headings
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900">{children}</h3>
    ),
    // Style paragraphs
    p: ({ children }) => (
      <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>
    ),
    // Style lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700">{children}</ol>
    ),
    // Style code blocks - detect inline vs block by checking className
    code: ({ className, children }) => {
      const isBlock = className?.includes('language-');
      if (!isBlock) {
        return (
          <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        );
      }
      return (
        <code className="block bg-gray-100 text-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto mb-3">
          {children}
        </code>
      );
    },
    // Style blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 py-2 mb-3 text-gray-600 italic">
        {children}
      </blockquote>
    ),
    // Style tables (via remark-gfm)
    table: ({ children }) => (
      <div className="overflow-x-auto mb-3">
        <table className="min-w-full border-collapse border border-gray-300">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-900">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 px-3 py-2 text-gray-700">{children}</td>
    ),
  };

  // Process content to auto-link standalone task IDs (e.g., #CT-001 in plain text)
  const processContent = (text: string): string => {
    // Replace standalone #CT-XXX references with markdown links
    return text.replace(
      /#(CT-\w+)(?!\))/g,
      '[$&](#$1)'
    );
  };

  const processedContent = processContent(content);

  return (
    <div className="markdown-content prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

export default memo(MarkdownRenderer);
