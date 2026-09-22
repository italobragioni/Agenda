import type { Metadata } from "next";
import { ForgotForm } from "@/features/auth/forgot-form";

export const metadata: Metadata = { title: "Esqueci minha senha — Agenda" };

export default function EsqueciSenhaPage() {
  return <ForgotForm />;
}
