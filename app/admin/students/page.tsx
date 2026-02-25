"use client";

import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  MoreHorizontal,
  Filter,
  Loader2,
  AlertCircle,
  Phone,
  RotateCcw,
  Info,
  Trash,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Student {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string;
  groups_count?: number;
  groups?: any[];
}

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    groupId: "",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await axios.get(`${API_URL}/api/student/get-all-students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data || res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = localStorage.getItem("token");
      return axios.post(`${API_URL}/api/student/create-student`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsAddModalOpen(false);
      setNewStudent({ first_name: "", last_name: "", phone: "", groupId: "" });
      alert("Student muvaffaqiyatli qo'shildi!");
    },
    onError: (error: any) => {
      console.error("Add error:", error);
      alert(error.response?.data?.message || "Qo'shishda xatolik yuz berdi");
    },
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      first_name: newStudent.first_name,
      last_name: newStudent.last_name,
      phone: newStudent.phone,
      groups: [
        {
          group: newStudent.groupId,
        },
      ],
    };
    addMutation.mutate(payload);
  };

  const openDeleteModal = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      return axios.delete(`${API_URL}/api/student/delete-student`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { _id: id },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      alert("Student o'chirildi!");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "O'chirishda xatolik");
    },
  });

  const handleDeleteStudent = () => {
    if (studentToDelete) {
      deleteMutation.mutate(studentToDelete);
    }
  };

  const handleRestoreStudent = (id: string) => {
    alert("Bu funksiya hali API ga ulanmagan");
  };

  const filteredStudents = students.filter((student: any) => {
    const fName = (student.first_name || student.firstName || "").toLowerCase();
    const lName = (student.last_name || student.lastName || "").toLowerCase();
    const phone = (student.phone || "").toLowerCase();
    const status = (student.status || "").toLowerCase();

    let statusMatch = true;
    if (filterStatus === "Yakunladi")
      statusMatch = status.includes("yakunladi");
    else if (filterStatus === "Tatilda")
      statusMatch = status.includes("ta'tilda") || status.includes("tatilda");
    else if (filterStatus === "Faol") statusMatch = status.includes("faol");

    const searchLower = searchQuery.toLowerCase();
    const searchMatch =
      fName.includes(searchLower) ||
      lName.includes(searchLower) ||
      phone.includes(searchLower);

    return statusMatch && searchMatch;
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-slate-950 min-h-screen font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Studentlar ro'yxati
        </h1>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-slate-400" />
            <Input
              placeholder="Qidirish..."
              className="pl-9 bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-gray-200 flex gap-2 items-center"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} />{" "}
            <span className="hidden sm:inline">Student Qo'shish</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex gap-2 min-w-[100px] justify-between dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
              >
                {filterStatus} <Filter size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-white dark:bg-slate-900 dark:border-slate-800"
            >
              <DropdownMenuItem
                className="dark:focus:bg-slate-800 dark:text-slate-200 cursor-pointer"
                onClick={() => setFilterStatus("All")}
              >
                All
              </DropdownMenuItem>
              <DropdownMenuItem
                className="dark:focus:bg-slate-800 dark:text-slate-200 cursor-pointer"
                onClick={() => setFilterStatus("Faol")}
              >
                Faol
              </DropdownMenuItem>
              <DropdownMenuItem
                className="dark:focus:bg-slate-800 dark:text-slate-200 cursor-pointer"
                onClick={() => setFilterStatus("Yakunladi")}
              >
                Yakunladi
              </DropdownMenuItem>
              <DropdownMenuItem
                className="dark:focus:bg-slate-800 dark:text-slate-200 cursor-pointer"
                onClick={() => setFilterStatus("Tatilda")}
              >
                Tatilda
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 border-b dark:border-slate-800 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Ism</th>
                <th className="px-6 py-4">Familiya</th>
                <th className="px-6 py-4">Telefon raqam</th>
                <th className="px-6 py-4 text-center">Guruhlar soni</th>
                <th className="px-6 py-4">Holat</th>
                <th className="px-6 py-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center bg-white dark:bg-slate-900"
                  >
                    <Loader2 className="animate-spin h-5 w-5 mx-auto text-gray-400 dark:text-slate-500" />
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900"
                  >
                    Ma'lumot topilmadi
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student: any, index: number) => (
                  <tr
                    key={student._id || index}
                    className="bg-white dark:bg-slate-900 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-100">
                      {student.first_name || student.firstName}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-slate-300">
                      {student.last_name || student.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                      {student.phone}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-slate-400">
                      {student.groups_count || student.groups?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                        ${
                          student.status?.toLowerCase().includes("faol")
                            ? "text-green-600 dark:text-green-400"
                            : student.status
                                ?.toLowerCase()
                                .includes("yakunladi")
                            ? "text-gray-500 dark:text-gray-400"
                            : student.status
                                ?.toLowerCase()
                                .includes("tatilda") ||
                              student.status?.toLowerCase().includes("ta'tilda")
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {student.status || "Noma'lum"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 dark:text-slate-400 dark:hover:bg-slate-800"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white dark:bg-slate-900 w-48 shadow-lg border border-gray-100 dark:border-slate-800"
                        >
                          <DropdownMenuItem
                            onClick={() => openDeleteModal(student._id)}
                            className="cursor-pointer py-2 hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-slate-200"
                          >
                            <Trash className="mr-2 h-4 w-4" /> O'chirish
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRestoreStudent(student._id)}
                            className="cursor-pointer py-2 hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-slate-200"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" /> Orqaga
                            qaytarish
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer py-2 hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-slate-200">
                            <Info className="mr-2 h-4 w-4" /> Info
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Yangi Student Qo'shish
            </DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Tizimga yangi o'quvchi qo'shish uchun ma'lumotlarni to'ldiring.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Ism</Label>
                <Input
                  required
                  placeholder="Alisher"
                  className="dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  value={newStudent.first_name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, first_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Familiya</Label>
                <Input
                  required
                  placeholder="Yusupov"
                  className="dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  value={newStudent.last_name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, last_name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-slate-300">Telefon raqam</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-slate-500" />
                <Input
                  required
                  placeholder="+9989"
                  className="pl-9 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  value={newStudent.phone}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-slate-300">Guruh</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-slate-500" />
                <Input
                  required
                  placeholder="Guruh ID si"
                  className="pl-9 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  value={newStudent.groupId}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, groupId: e.target.value })
                  }
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                *O'quvchi biriktiriladigan guruhning ID raqami.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={addMutation.isPending}
                className="bg-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-gray-200 text-white"
              >
                {addMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
              <AlertCircle size={20} /> O'chirishni tasdiqlang
            </DialogTitle>
            <DialogDescription className="pt-2 dark:text-slate-400">
              Haqiqatan ham bu studentni o'chirmoqchimisiz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800"
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteStudent}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Ha, o'chirish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
