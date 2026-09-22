import type { Metadata } from "next";
import { SignupForm } from "@/features/auth/signup-form";

export const metadata: Metadata = { title: "Criar conta — Agenda" };

export default function CadastroPage() {
  return <SignupForm />;
}
