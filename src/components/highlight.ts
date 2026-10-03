// Statik kod görüntüleme için basit C# / SQL renklendirici.
export type Piece = { cls: string; text: string }

const CS_KW = new Set(
  'abstract as base bool break byte case catch char class const continue decimal default delegate do double else enum event false finally float for foreach get if in int interface internal is long namespace new null object out override params private protected public readonly ref return sealed set short static string struct switch this throw true try typeof uint ulong using value var virtual void while partial'.split(' '),
)
const SQL_KW = new Set(
  'SELECT FROM WHERE AND OR NOT ORDER BY ASC DESC INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE PRIMARY KEY AUTO_INCREMENT NULL LIKE IN BETWEEN IS LIMIT AS DISTINCT JOIN INNER LEFT ON GROUP COUNT SUM AVG MIN MAX INT VARCHAR DATE DECIMAL HAVING DROP'.split(' '),
)

export function highlightLine(line: string, lang: 'cs' | 'sql' = 'cs'): Piece[] {
  const out: Piece[] = []
  const re = lang === 'cs'
    ? /(\/\/.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(\b\d+(?:\.\d+)?[fFmMdD]?\b)|([A-Za-z_À-ɏ][\wÀ-ɏ]*)|(\s+)|(.)/g
    : /(--.*$)|('(?:[^'\\]|\\.)*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_À-ɏ][\wÀ-ɏ]*)|(\s+)|(.)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    const [all, com, str, num, word] = m
    if (com) out.push({ cls: 'tk-com', text: all })
    else if (str) out.push({ cls: 'tk-str', text: all })
    else if (num) out.push({ cls: 'tk-num', text: all })
    else if (word) {
      if (lang === 'cs') {
        if (CS_KW.has(word)) out.push({ cls: 'tk-kw', text: word })
        else if (/^[A-ZÇĞİÖŞÜ]/.test(word)) out.push({ cls: 'tk-type', text: word })
        else out.push({ cls: '', text: word })
      } else {
        out.push({ cls: SQL_KW.has(word.toUpperCase()) ? 'tk-kw' : '', text: word })
      }
    } else out.push({ cls: '', text: all })
  }
  return out
}
