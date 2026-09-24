/**
 * Template (re-renderiza a cada navegação) para animar a entrada do
 * conteúdo das páginas do painel, sem re-animar a barra lateral/cabeçalho.
 */
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-enter">{children}</div>;
}
