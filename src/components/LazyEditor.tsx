import { lazy, Suspense, type ComponentProps } from 'react'

const Editor = lazy(() => import('./CodeEditor'))

/** CodeMirror ayrı bir parçada yüklenir; ilk açılış hızlı olur. */
export function LazyEditor(props: ComponentProps<typeof Editor>) {
  return (
    <Suspense fallback={<pre className="code" style={{ minHeight: props.minHeight ?? '340px', margin: 0, border: 'none', padding: 16 }}>Editör yükleniyor…</pre>}>
      <Editor {...props} />
    </Suspense>
  )
}
