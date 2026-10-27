import { Search } from "lucide-react";

/** Campo de busca simples via formulário GET (sem necessidade de JS). */
export function SearchInput({
  name = "q",
  defaultValue = "",
  placeholder = "Buscar...",
  action,
  hidden,
}: {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  action?: string;
  /** Campos ocultos enviados junto (ex.: manter o filtro atual). */
  hidden?: Record<string, string>;
}) {
  return (
    <form action={action} className="relative mb-4">
      {hidden &&
        Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-foreground placeholder:text-muted focus:border-brand focus:outline-2 focus:outline-offset-0 focus:outline-brand"
      />
    </form>
  );
}
