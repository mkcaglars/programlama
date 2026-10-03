import CodeMirror from '@uiw/react-codemirror'
import { StreamLanguage } from '@codemirror/language'
import { csharp } from '@codemirror/legacy-modes/mode/clike'
import { mySQL } from '@codemirror/legacy-modes/mode/sql'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useEffect, useMemo, useRef } from 'react'
import type { EditorHandle } from './editorHandle'

const csLang = StreamLanguage.define(csharp)
const sqlLang = StreamLanguage.define(mySQL)

interface Props {
  value: string
  onChange(v: string): void
  lang: 'cs' | 'sql'
  minHeight?: string
  handleRef?: React.RefObject<EditorHandle | null>
  onRun?: () => void
}

export default function CodeEditor({ value, onChange, lang, minHeight = '340px', handleRef, onRun }: Props) {
  const viewRef = useRef<EditorView | null>(null)
  const runRef = useRef(onRun)
  useEffect(() => {
    runRef.current = onRun
  }, [onRun])
  useEffect(() => {
    if (!handleRef) return
    handleRef.current = {
      jumpTo(line: number) {
        const view = viewRef.current
        if (!view) return
        const l = view.state.doc.line(Math.min(Math.max(1, line), view.state.doc.lines))
        view.dispatch({ selection: { anchor: l.from, head: l.to }, scrollIntoView: true })
        view.focus()
      },
    }
  }, [handleRef])
  const extensions = useMemo(
    () => [
      lang === 'cs' ? csLang : sqlLang,
      EditorView.lineWrapping,
      EditorView.domEventHandlers({
        keydown(e) {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault()
            runRef.current?.()
            return true
          }
          return false
        },
      }),
    ],
    [lang],
  )
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={oneDark}
      extensions={extensions}
      minHeight={minHeight}
      onCreateEditor={(view) => {
        viewRef.current = view
      }}
      basicSetup={{ foldGutter: false, highlightActiveLineGutter: true, autocompletion: false, tabSize: 4 }}
      indentWithTab
    />
  )
}
