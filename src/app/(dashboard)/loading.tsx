/**
 * Esqueleto exibido instantaneamente ao navegar entre telas do painel,
 * enquanto os dados carregam. Também habilita o pré-carregamento das
 * páginas pelo Next.js, deixando a navegação muito mais rápida.
 */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <div className="mb-6 h-8 w-44 rounded-lg bg-slate-200" />
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="h-20 rounded-2xl bg-slate-200" />
        <div className="h-20 rounded-2xl bg-slate-200" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
