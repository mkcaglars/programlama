import { inline } from './inline'

/** **kalın** ve `kod` biçimlendirmesi olan, satırlara bölünmüş metni gösterir. */
export function Rich({ text, as = 'p' }: { text: string; as?: 'p' | 'span' }) {
  const Tag = as
  return (
    <>
      {text.split('\n').map((p, i) => (
        <Tag key={i}>{inline(p)}</Tag>
      ))}
    </>
  )
}
