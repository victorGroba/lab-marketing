import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/ui/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={session.user.name ?? "Usuario"} papel={session.user.papel} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
