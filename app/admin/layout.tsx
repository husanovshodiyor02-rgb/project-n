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

  const [userData, setUserData] = useState({
    name: "Yuklanmoqda...",
    role: "User",
    image: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);

        const firstName = parsed?.first_name || "";
        const lastName = parsed?.last_name || "";
        const fullName = parsed?.name || parsed?.fullName || parsed?.username;

        const finalName =
          firstName || lastName
            ? `${firstName} ${lastName}`.trim()
            : fullName || "Foydalanuvchi";

        const finalRole = parsed?.role || "Manager";
        const finalImage = parsed?.image || parsed?.img || "";

        setUserData({
          name: finalName,
          role: finalRole,
          image: finalImage,
        });
      } catch (error) {
        setUserData({ name: "Admin", role: "Manager", image: "" });
      }
    } else {
      setUserData({ name: "Kirilmagan", role: "Mehmon", image: "" });
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

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

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-2"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Chiqish
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <PanelLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              {menuItems.find((i) => i.href === pathname)?.name ||
                bottomItems.find((i) => i.href === pathname)?.name ||
                "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

         
            <div className="flex items-center gap-3 border-l pl-4 dark:border-slate-700 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                  {userData.name}
                </p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                  {userData.role}
                </p>
              </div>
              <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700">              
                <AvatarImage src={userData.image} alt="User Avatar" />
                <AvatarFallback className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold">
                  {userData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
