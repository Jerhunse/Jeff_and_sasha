import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Toaster } from "sonner"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Check if user has admin access (OWNER or COLLABORATOR)
  if (session.user.role !== "OWNER" && session.user.role !== "COLLABORATOR") {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex" data-admin>
      <Toaster position="top-right" />
      <AdminSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

