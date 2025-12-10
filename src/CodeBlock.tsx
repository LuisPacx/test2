import {FC, useEffect, useRef} from 'react';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/base16/solarized-light.css';

hljs.registerLanguage('javascript', javascript);
hljs.configure({ignoreUnescapedHTML: true});

interface CodeBlockProps {
  content: string;
}

export const CodeBlock: FC<CodeBlockProps> = ({content}) => {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (ref.current) {
      hljs.highlightElement(ref.current);
    }
  }, []);

  return (
    <pre ref={ref} className="codeblock">
      <code>{content.trim()}</code>
    </pre>
  );
};
