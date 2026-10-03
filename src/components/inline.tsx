import { Fragment } from 'react'

/** **kalın** ve `kod` biçimlendirmesini React öğelerine çevirir. */
export function inline(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="inline-code">{part.slice(1, -1)}</code>
    return <Fragment key={i}>{part}</Fragment>
  })
}
