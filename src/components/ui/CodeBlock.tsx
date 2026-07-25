import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useToast } from "../../hooks/useToast";

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language, filename, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      type: "success",
      title: "Copied to Clipboard",
      message: `${filename || "Code snippet"} has been copied successfully.`
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightCode = (rawCode: string, lang: string) => {
    const escaped = rawCode
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const l = lang.toLowerCase();

    if (l === "sql") {
      return escaped
        .replace(
          /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|HAVING|LIMIT|AND|OR|NOT|OVER|ROWS|BETWEEN|PRECEDING|FOLLOWING|CURRENT ROW|UNBOUNDED|AS|WITH|INSERT|INTO|VALUES|CREATE|TABLE|VIEW|ALTER|DROP)\b/g,
          '<span class="text-brand-secondary font-semibold">$1</span>'
        )
        .replace(
          /\b(COUNT|SUM|AVG|MIN|MAX|DATE_TRUNC|CURRENT_DATE|COALESCE|CAST)\b/g,
          '<span class="text-brand-accent font-semibold">$1</span>'
        )
        .replace(/('.*?')/g, '<span class="text-emerald-400">$1</span>')
        .replace(/(--.*)/g, '<span class="text-brand-muted italic">$1</span>');
    }

    if (l === "python" || l === "py") {
      return escaped
        .replace(
          /\b(def|class|import|from|as|return|if|else|elif|for|while|in|with|try|except|finally|raise|assert|lambda|pass|break|continue|global|nonlocal|and|or|not|is|None|True|False)\b/g,
          '<span class="text-brand-primary font-semibold">$1</span>'
        )
        .replace(
          /\b(print|len|range|str|int|float|dict|list|set|tuple|open|sum|max|min|datetime|timedelta)\b/g,
          '<span class="text-brand-secondary">$1</span>'
        )
        .replace(/(@\w+)/g, '<span class="text-brand-accent font-semibold">$1</span>')
        .replace(/(".*?"|'.*?')/g, '<span class="text-emerald-400">$1</span>')
        .replace(/(#.*)/g, '<span class="text-brand-muted italic">$1</span>');
    }

    if (l === "yaml" || l === "yml") {
      return escaped
        .replace(/^(\s*)([\w-]+)(:)/gm, '$1<span class="text-brand-secondary font-semibold">$2</span>$3')
        .replace(/(:)(.*)$/gm, '$1<span class="text-emerald-400">$2</span>')
        .replace(/(-)(.*)$/gm, '$1<span class="text-brand-primary">$2</span>')
        .replace(/(#.*)/g, '<span class="text-brand-muted italic">$1</span>');
    }

    return escaped;
  };

  const lines = code.trim().split("\n");

  return (
    <div className="w-full glass border border-white/5 rounded-xl overflow-hidden flex flex-col font-code">
      {/* File header */}
      <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          {filename && (
            <span className="text-xs text-brand-muted font-medium ml-2 font-heading">
              {filename}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-brand-muted font-semibold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/5">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="text-brand-muted hover:text-white transition-colors p-1 rounded hover:bg-white/5"
            title="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className="flex overflow-x-auto text-sm leading-relaxed p-4 bg-[#080d22]/40 max-h-[480px]">
        {showLineNumbers && (
          <div className="text-right text-brand-muted/30 select-none pr-4 border-r border-white/5 flex flex-col font-medium min-w-[2.5rem]">
            {lines.map((_, idx) => (
              <span key={idx}>{idx + 1}</span>
            ))}
          </div>
        )}
        <pre className={showLineNumbers ? "pl-4 text-left flex-1" : "text-left flex-1"}>
          <code
            dangerouslySetInnerHTML={{
              __html: highlightCode(code.trim(), language)
            }}
          />
        </pre>
      </div>
    </div>
  );
}
