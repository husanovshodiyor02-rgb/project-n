"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Camera, Calendar, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    first_name: "Kachok",
    last_name: "Ta'lim",
    email: "usern88@mail.ru",
    role: "manager",
    createdAt: "2025-06-03",
    avatar: "",
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getHeaders = (isFormData = false) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const headers: any = {
      Authorization: `Bearer ${token}`,
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    return { headers };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // const res = await axios.get(`${API_URL}/api/auth/me`, getHeaders());
        // setProfile(res.data.data);
      } catch (error) {
        console.error("Profilni yuklashda xato:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const payload = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
      };

      await axios.post(
        `${API_URL}/api/auth/edit-profile`,
        payload,
        getHeaders()
      );
      alert("Profil ma'lumotlari muvaffaqiyatli saqlandi!");
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Profilni saqlashda xatolik yuz berdi"
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImg(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      await axios.post(
        `${API_URL}/api/auth/edit-profile-img`,
        formData,
        getHeaders(true)
      );

      setProfile((prev) => ({ ...prev, avatar: URL.createObjectURL(file) }));
      alert("Rasm muvaffaqiyatli yuklandi!");
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Rasmni yuklashda xatolik yuz berdi"
      );
    } finally {
      setIsUploadingImg(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordSaving(true);
    try {
      const payload = {
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      };

      await axios.post(
        `${API_URL}/api/auth/edit-password`,
        payload,
        getHeaders()
      );

      alert("Parol muvaffaqiyatli o'zgartirildi!");
      setIsPasswordModalOpen(false);
      setPasswords({ current_password: "", new_password: "" });
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Parolni o'zgartirishda xatolik yuz berdi"
      );
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* YUQORI QISM */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 transition-colors">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-md relative">
              <img
                src={profile.avatar}
                alt="Profile Avatar"
                className={`w-full h-full object-cover ${
                  isUploadingImg ? "opacity-50" : ""
                }`}
              />
              {isUploadingImg && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-800 dark:text-gray-200" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImg}
              className="absolute bottom-0 right-0 bg-black dark:bg-gray-700 text-white p-2 rounded-full border-2 border-white dark:border-gray-800 hover:bg-gray-800 dark:hover:bg-gray-600 transition shadow-sm"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {profile.email}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-2">
              <Calendar className="w-4 h-4" />
              <span>Qo'shilgan: {profile.createdAt}</span>
            </div>
          </div>
        </div>

        <span className="bg-red-600 dark:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md capitalize">
          {profile.role}
        </span>
      </div>

      {/* PASTKI QISM */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm transition-colors">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Profil ma'lumotlari
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Shaxsiy ma'lumotlaringizni yangilashingiz mumkin.
          </p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">Ism</Label>
              <Input
                id="first_name"
                name="first_name"
                value={profile.first_name}
                onChange={handleInputChange}
                required
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Familiya</Label>
              <Input
                id="last_name"
                name="last_name"
                value={profile.last_name}
                onChange={handleInputChange}
                required
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                required
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Input
                id="role"
                name="role"
                value={profile.role}
                readOnly
                className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-6">
            <Button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full sm:w-auto bg-black dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white"
            >
              Parol ni O'zgartirish
            </Button>

            <Button
              type="submit"
              disabled={isSavingProfile}
              className="w-full sm:w-auto bg-black dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white min-w-[120px]"
            >
              {isSavingProfile && (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              )}
              O'zgartirish
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-gray-900 border dark:border-gray-800 text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle>Parolni o'zgartirish</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdatePassword} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Joriy parol</Label>
              <Input
                type="password"
                required
                value={passwords.current_password}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    current_password: e.target.value,
                  })
                }
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label>Yangi parol</Label>
              <Input
                type="password"
                required
                minLength={8}
                value={passwords.new_password}
                onChange={(e) =>
                  setPasswords({ ...passwords, new_password: e.target.value })
                }
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100"
              />
            </div>

            <DialogFooter className="pt-2 flex sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                className="w-full sm:w-auto dark:border-gray-700 dark:text-gray-300"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={isPasswordSaving}
                className="w-full sm:w-auto bg-black dark:bg-gray-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700"
              >
                {isPasswordSaving && (
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                )}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
