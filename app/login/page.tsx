"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const { setTheme, theme } = useTheme();

  // Dark/Light rejimni almashtirish
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Chap yuqoridagi Dark Mode tugmasi */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 left-4 rounded-full"
        onClick={toggleTheme}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      {/* Login Kartochkasi */}
      <Card className="w-[400px] shadow-xl border-none dark:bg-slate-900 dark:border dark:border-slate-800">
        <CardHeader className="text-center space-y-2 pt-10">
          <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
            Xush kelibsiz <span className="animate-pulse">👋</span>
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 text-md">
            Hisobingizga kirish uchun email va parolni kiriting
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-10 px-8">
          <form className="space-y-6">
            {/* Email Input */}
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
                placeholder="usern88@mail.ru"
                // Rasmdagi kabi och ko'k fon, Dark modeda qora
                className="h-12 bg-blue-50/50 border-transparent focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-900 dark:text-white transition-all"
              />
            </div>

            {/* Parol Input */}
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
                className="h-12 bg-blue-50/50 border-transparent focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-900 dark:text-white transition-all"
              />
            </div>

            {/* Kirish Tugmasi */}
            <Button className="w-full h-12 text-md font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-gray-200 shadow-lg mt-2">
              Kirish
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

