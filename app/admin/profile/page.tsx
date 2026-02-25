"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { User, Calendar, Camera, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const Profile = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const API_URL =
    process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
  const token = Cookies.get("token");

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setFormData({
          first_name: parsedUser?.first_name || "",
          last_name: parsedUser?.last_name || "",
          email: parsedUser?.email || "",
        });
      } catch (error) {
        console.error("User ma'lumotlarini o'qishda xatolik:", error);
      }
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fd = new FormData();
    fd.append("image", file);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/edit-profile-img`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const backendData =
        response.data?.user || response.data?.data || response.data;

      const newImageUrl =
        backendData?.image || response.data?.image || user?.image;

      const updatedUser = {
        ...user,
        ...(typeof backendData === "object" ? backendData : {}),
        image: newImageUrl,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Rasm muvaffaqiyatli yangilandi");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/edit-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const backendData =
        response.data?.user || response.data?.data || response.data;

      const updatedUser = {
        ...user,
        ...formData,
        ...(typeof backendData === "object" ? backendData : {}),
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Ma'lumotlar muvaffaqiyatli yangilandi");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isMounted) return null;
  if (!user)
    return (
      <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-medium transition-colors">
        Yuklanmoqda...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans text-gray-900 dark:text-gray-100 transition-colors">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm transition-colors">
        <div className="flex items-center gap-6">
          <div className="relative w-max shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative transition-colors">
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
              {user?.image ? (
                <img
                  src={user.image}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-gray-400 dark:text-gray-500" />
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-[#18181b] dark:bg-white text-white dark:text-black p-2 rounded-full border-[3px] border-white dark:border-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 z-10 shadow-md"
            >
              <Camera size={14} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white transition-colors">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base transition-colors">
              {user?.email}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs md:text-sm flex items-center gap-1.5 mt-1 transition-colors">
              <Calendar size={14} />
              Qo'shilgan:{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toISOString().split("T")[0]
                : "2024-01-01"}
            </p>
          </div>
        </div>

        <div className="bg-[#e11d48] text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-medium tracking-wide">
          {user?.role || "manager"}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors">
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white transition-colors">
            Profil ma'lumotlari
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors">
            Shaxsiy ma'lumotlaringizni yangilashingiz mumkin.
          </p>
        </div>

        <form onSubmit={handleInfoSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-300 transition-colors">
                Ism
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl text-sm md:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-300 transition-colors">
                Familiya
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl text-sm md:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-300 transition-colors">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-transparent border border-gray-200 dark:border-gray-800 rounded-xl text-sm md:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-300 transition-colors">
                Rol
              </label>
              <input
                type="text"
                value={user?.role || "manager"}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl text-sm md:text-base text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-950 focus:outline-none cursor-not-allowed transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-10">
            <button
              type="button"
              className="px-6 py-2.5 bg-[#18181b] dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Parol ni O'zgartirish
            </button>

            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#18181b] dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUpdating && <Loader2 className="animate-spin" size={16} />}
              O'zgartirish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
