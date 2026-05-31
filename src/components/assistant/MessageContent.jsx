import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const markdownComponents = {
  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-stone-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-stone-900 underline decoration-stone-400 underline-offset-2 transition-colors hover:decoration-stone-700"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1.5 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1.5 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => (
    <h3 className="mb-2 mt-1 font-serif text-base font-medium text-stone-900">{children}</h3>
  ),
  h2: ({ children }) => (
    <h4 className="mb-2 mt-1 font-serif text-sm font-medium text-stone-900">{children}</h4>
  ),
  h3: ({ children }) => (
    <h5 className="mb-2 mt-1 text-sm font-semibold text-stone-900">{children}</h5>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-stone-300 pl-3 italic text-stone-600 last:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-stone-200" />,
  code: ({ inline, children }) =>
    inline ? (
      <code className="rounded bg-stone-100 px-1 py-0.5 text-[0.85em] text-stone-800">{children}</code>
    ) : (
      <code className="block whitespace-pre-wrap rounded-lg bg-stone-100 p-3 text-[0.85em] text-stone-800">
        {children}
      </code>
    ),
}

export default function MessageContent({ content, role = 'assistant' }) {
  const text = typeof content === 'string' ? content : ''

  if (!text) return null

  if (role === 'user') {
    return <span className="whitespace-pre-wrap leading-relaxed">{text}</span>
  }

  return (
    <div className="assistant-markdown text-sm text-stone-700 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {text}
      </ReactMarkdown>
    </div>
  )
}
