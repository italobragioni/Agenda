import Link from "next/link";
import { CarviLogo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex justify-center">
          <CarviLogo className="h-20" />
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
