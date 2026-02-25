"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTheme } from "next-themes";
import { Moon, Sun, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setTheme, theme } = useTheme();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/sign-in`, {
        email,
        password,
      });

      console.log("Login javobi:", res.data);

      const data = res.data;
      const token = data.token || data.data?.token || data.accessToken;
      const role = data.role || data.data?.role || data.user?.role || "admin";
      const user = data.user || data.data?.user || data.data;

      if (token) {
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Lax`;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }

        router.push("/admin");
      } else {
        setError("Login muvaffaqiyatli, lekin token kelmadi.");
      }
    } catch (err: any) {
      console.error("Xatolik:", err);
      const errorMsg =
        err.response?.data?.message || "Email yoki parol noto‘g‘ri";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 transition-colors duration-300 relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 left-4 rounded-full"
        onClick={toggleTheme}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      <Card className="w-full max-w-md shadow-xl border-none dark:bg-slate-900 dark:border dark:border-slate-800 mx-4">
        <CardHeader className="text-center space-y-2 pt-10">
          <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
            Xush kelibsiz <span className="animate-pulse">👋</span>
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 text-md">
            Hisobingizga kirish uchun email va parolni kiriting
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-10 px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-semibold text-slate-700 dark:text-slate-300"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-blue-50/50 border-transparent focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-900 dark:text-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-semibold text-slate-700 dark:text-slate-300"
              >
                Parol
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-blue-50/50 border-transparent focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-900 dark:text-white transition-all"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-md font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-gray-200 shadow-lg mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kirilmoqda...
                </>
              ) : (
                "Kirish"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}