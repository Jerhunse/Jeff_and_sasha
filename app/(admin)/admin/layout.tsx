import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Settings,
  Heart
} from "lucide-react"

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

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/guests", label: "Guests", icon: Users },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/pages", label: "Pages", icon: FileText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-6 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-serif text-xl font-bold">Wedding Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="p-4 border-t">
          <div className="text-sm">
            <p className="font-medium">{session.user.name || session.user.email}</p>
            <p className="text-muted-foreground capitalize">{session.user.role.toLowerCase()}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

