"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Home,
  Users,
  Mail,
  ClipboardList,
  Heart,
  PanelLeftClose,
  PanelLeft,
  QrCode,
  Armchair,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/rsvp-dashboard", label: "RSVP Dashboard", icon: ClipboardList },
  { href: "/admin/guests", label: "Guests", icon: Users },
  { href: "/admin/seating", label: "Seating Chart", icon: Armchair },
  { href: "/admin/invitations", label: "Invitations", icon: Mail },
  { href: "/admin/qr-code", label: "QR Codes", icon: QrCode },
]

interface AdminSidebarProps {
  user: { name?: string | null; email?: string | null; role?: string | null }
}

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed"

export function AdminSidebar({ user }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Hydrate collapsed state from localStorage after mount to avoid flash
  useEffect(() => {
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (stored !== null) setCollapsed(stored === "true")
  }, [mounted])
  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
  }, [mounted, collapsed])

  return (
    <aside
      className={cn(
        "border-r bg-muted/30 flex flex-col transition-[width] duration-200 ease-in-out shrink-0",
        collapsed ? "w-[4.5rem]" : "w-64"
      )}
    >
      <div className="p-4 border-b flex items-center justify-between gap-2 min-h-[4.5rem]">
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-2 overflow-hidden",
            collapsed && "justify-center flex-1"
          )}
        >
          <Heart className="h-6 w-6 text-primary fill-primary shrink-0" />
          {!collapsed && (
            <span className="font-sans text-xl font-bold truncate">
              Wedding Admin
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href + "/"))
            const link = (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full font-sans transition-none",
                    collapsed ? "justify-center px-0" : "justify-start gap-3"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.label}
                </Button>
              </Link>
            )
            return link
          })}
        </div>
      </nav>

      <div
        className={cn(
          "p-4 border-t",
          collapsed && "flex flex-col items-center"
        )}
      >
        <div className={cn("text-sm", collapsed && "text-center")}>
          <p className="font-medium truncate" title={user.name || user.email || undefined}>
            {user.name || user.email || "—"}
          </p>
          <p className="text-muted-foreground capitalize truncate">
            {user.role?.toLowerCase() ?? "—"}
          </p>
        </div>
      </div>
    </aside>
  )
}
