"use client";

import { useTransition } from "react";
import { Loader2, Crown, Ban, Tag, Building2 } from "lucide-react";
import {
  grantPremium,
  grantBasic,
  grantEmpresarial,
  revokeAccess,
} from "./actions";

export function AdminRowActions({ businessId }: { businessId: string }) {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-1.5">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Liberar Premium de cortesia para este estabelecimento?"))
            start(() => grantPremium(businessId));
        }}
        className="tap inline-flex items-center gap-1 rounded-lg bg-brand-soft px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-blue-100 disabled:opacity-50"
      >
        <Crown className="h-3.5 w-3.5" /> Premium
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Definir como plano Empresarial (de cortesia)?"))
            start(() => grantEmpresarial(businessId));
        }}
        className="tap inline-flex items-center gap-1 rounded-lg bg-brand-soft px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-blue-100 disabled:opacity-50"
      >
        <Building2 className="h-3.5 w-3.5" /> Empresarial
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Definir este estabelecimento como plano Essencial (de cortesia)?"))
            start(() => grantBasic(businessId));
        }}
        className="tap inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50"
      >
        <Tag className="h-3.5 w-3.5" /> Essencial
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Expirar o acesso deste estabelecimento agora?"))
            start(() => revokeAccess(businessId));
        }}
        className="tap inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Ban className="h-3.5 w-3.5" /> Expirar
      </button>
    </div>
  );
}
