export default function PublicLoading() {
  return (
    <main className="mx-auto w-full max-w-md animate-pulse px-4 py-8">
      <div className="mx-auto mb-6 h-16 w-32 rounded-xl bg-slate-200" />
      <div className="mb-3 h-4 w-40 rounded bg-slate-200" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-slate-200" />
        ))}
      </div>
    </main>
  );
}
