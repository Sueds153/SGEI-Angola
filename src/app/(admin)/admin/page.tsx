import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();
  
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }
  
  // Dashboard → redireciona para configurações (ou crie um dashboard real depois)
  redirect("/admin/configuracoes");
}