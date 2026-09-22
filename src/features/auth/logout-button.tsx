import { logout } from "./actions";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-slate-100 hover:text-foreground"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Sair
      </button>
    </form>
  );
}
