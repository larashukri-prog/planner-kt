import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,:;!?')\]}])/gi;

export function renderWithLinks(text: string): ReactNode {
  if (!text) return text;
  const parts = text.split(URL_RE);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex max-w-full items-center gap-0.5 align-bottom text-[var(--color-neon-text)] underline decoration-dotted underline-offset-2 hover:decoration-solid"
        >
          <span className="inline-block max-w-[18ch] truncate align-bottom md:max-w-[28ch]">
            {part}
          </span>
          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
        </a>
      );
    }
    return part;
  });
}
