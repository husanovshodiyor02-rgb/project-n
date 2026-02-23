"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Wallet,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  PanelLeft,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  // 1. User ma'lumotlarini olish (LocalStorage dan)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login"); // Token bo'lmasa login sahifasiga otib yuborish
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  // 2. Chiqish funksiyasi (Logout)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login"); // Login sahifasiga qaytish
  };

  // Menyu ro'yxati
  const menuItems: SidebarItem[] = [
    { name: "Asosiy", href: "/admin", icon: LayoutDashboard },
    { name: "Menagerlar", href: "/admin/managers", icon: Users },
    { name: "Adminlar", href: "/admin/admins", icon: ShieldCheck },
    { name: "Ustozlar", href: "/admin/teachers", icon: GraduationCap },
    { name: "Studentlar", href: "/admin/students", icon: GraduationCap },
    { name: "Guruhlar", href: "/admin/groups", icon: Users },
    { name: "Kurslar", href: "/admin/courses", icon: BookOpen },
    { name: "Payment", href: "/admin/payments", icon: Wallet },
  ];

  const bottomItems: SidebarItem[] = [
    { name: "Sozlamalar", href: "/admin/settings", icon: Settings },
    { name: "Profile", href: "/admin/profile", icon: User },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* SIDEBAR (Chap tomon) */}
      <aside
        className={`
          ${isSidebarOpen ? "w-64" : "w-0 -ml-4"} 
          bg-white dark:bg-slate-900 border-r dark:border-slate-800 transition-all duration-300 flex flex-col h-full
        `}
      >
        <div className="p-6 h-16 flex items-center">
          <h1
            className={`text-xl font-bold dark:text-white ${
              !isSidebarOpen && "hidden"
            }`}
          >
            Admin CRM
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Menu Section */}
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Menu
          </p>

          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-white border shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white dark:border-slate-700"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }
                `}
              >
                <item.icon
                  className={`w-5 h-5 mr-3 ${
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}

          <Separator className="my-4 dark:bg-slate-800" />

          {/* Boshqalar Section */}
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Boshqalar
          </p>

          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${
                  pathname === item.href
                    ? "bg-white border shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}

          {/* Chiqish Tugmasi */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-2"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Chiqish
          </button>
        </div>
      </aside>

      {/* ASOSIY QISM (O'ng tomon) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* HEADER (Tepa qism) */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <PanelLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              {/* Hozirgi sahifa nomini topib qo'yish */}
              {menuItems.find((i) => i.href === pathname)?.name ||
                bottomItems.find((i) => i.href === pathname)?.name ||
                "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Profile */}
            <div className="flex items-center gap-3 border-l pl-4 dark:border-slate-700">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user?.name || "Foydalanuvchi"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.role || "Admin"}
                </p>
              </div>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* CONTENT (Sahifa mazmuni) */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
