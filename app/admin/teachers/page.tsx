"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  MoreHorizontal,
  Filter,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Types
interface Teacher {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // --- QO'SHISH STATE ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [addLoading, setAddLoading] = useState(false);

  // --- TAHRIRLASH (EDIT) STATE ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  // --- O'CHIRISH (DELETE) STATE ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 1. DATA OLISH (FETCH)
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/teacher/get-all-teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data.data || res.data || []);
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // 2. TEACHER QO'SHISH
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const token = localStorage.getItem("token");
      const today = new Date().toISOString().split("T")[0];
      const payload = {
        ...newTeacher,
        role: "teacher",
        work_date: today,
        status: "faol",
        active: true,
        is_deleted: false,
      };

      await axios.post(`${API_URL}/api/staff/create-teacher`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsAddModalOpen(false);
      setNewTeacher({ first_name: "", last_name: "", email: "", password: "" });
      fetchTeachers();
      alert("Ustoz qo'shildi!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setAddLoading(false);
    }
  };

  // 3. TEACHER TAHRIRLASH
  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher({
      _id: teacher._id,
      first_name: teacher.first_name || (teacher as any).firstName,
      last_name: teacher.last_name || (teacher as any).lastName,
      email: teacher.email,
      status: teacher.status || "faol",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/teacher/create-teacher`, editingTeacher, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditModalOpen(false);
      setEditingTeacher(null);
      fetchTeachers();
      alert("Ustoz ma'lumotlari yangilandi!");
    } catch (error: any) {
      console.error("Update error:", error);
      alert(error.response?.data?.message || "Yangilashda xatolik");
    } finally {
      setEditLoading(false);
    }
  };

  // 4. ADMIN O'CHIRISH
  const openDeleteModal = (id: string) => {
    setTeacherToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/teacher/fire-teacher`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { _id: teacherToDelete },
      });

      setIsDeleteModalOpen(false);
      setTeacherToDelete(null);
      fetchTeachers();
      alert("Ustoz o'chirildi!");
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "O'chirishda xatolik");
    } finally {
      setDeleteLoading(false);
    }
  };

  // 5. FILTER VA QIDIRUV
  const filteredTeachers = teachers.filter((teacher) => {
    const fName = (
      teacher.first_name ||
      (teacher as any).firstName ||
      ""
    ).toLowerCase();
    const lName = (
      teacher.last_name ||
      (teacher as any).lastName ||
      ""
    ).toLowerCase();
    const email = (teacher.email || "").toLowerCase();
    const status = (teacher.status || "").toLowerCase();

    let statusMatch = true;
    if (filterStatus === "Tatilda")
      statusMatch = status.includes("ta'tilda") || status.includes("tatilda");
    else if (filterStatus === "Faol") statusMatch = status.includes("faol");
    else if (filterStatus === "Nofaol")
      statusMatch =
        status.includes("bo'shatilgan") || status.includes("nofaol");

    const searchLower = searchQuery.toLowerCase();
    const searchMatch =
      fName.includes(searchLower) ||
      lName.includes(searchLower) ||
      email.includes(searchLower);

    return statusMatch && searchMatch;
  });

  // Status Badge qismi
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("faol") && !s.includes("nofaol")) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/40 transition-colors">
          {status}
        </Badge>
      );
    }
    if (s.includes("ta'tilda") || s.includes("tatilda")) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-900/40 transition-colors">
          {status}
        </Badge>
      );
    }
    if (s.includes("bo'shatilgan") || s.includes("nofaol")) {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/40 transition-colors">
          {status}
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="dark:bg-gray-800 dark:text-gray-300 transition-colors"
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Card className="dark:bg-gray-900 dark:border-gray-800 transition-colors shadow-sm">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4 space-y-0 pb-6">
          <CardTitle className="text-2xl font-bold dark:text-gray-100">
            Ustozlar ro'yxati
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Qidirish..."
                className="pl-9 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 dark:text-white dark:placeholder-gray-400 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 flex-1 sm:flex-none flex gap-2 items-center transition-colors"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={18} />{" "}
                <span className="hidden sm:inline">Ustoz Qo'shish</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex gap-2 min-w-[110px] justify-between bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                  >
                    {filterStatus} <Filter size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40 bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200"
                >
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("All")}
                    className="dark:focus:bg-gray-800 cursor-pointer"
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("Tatilda")}
                    className="dark:focus:bg-gray-800 cursor-pointer"
                  >
                    Tatilda
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("Faol")}
                    className="dark:focus:bg-gray-800 cursor-pointer"
                  >
                    Faol
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus("Nofaol")}
                    className="dark:focus:bg-gray-800 cursor-pointer"
                  >
                    Nofaol
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-950/50 transition-colors">
                <TableRow className="dark:border-gray-800 hover:bg-transparent dark:hover:bg-transparent">
                  <TableHead className="dark:text-gray-400 font-semibold">
                    Ism
                  </TableHead>
                  <TableHead className="dark:text-gray-400 font-semibold">
                    Familiya
                  </TableHead>
                  <TableHead className="dark:text-gray-400 font-semibold">
                    Email
                  </TableHead>
                  <TableHead className="dark:text-gray-400 font-semibold">
                    Rol
                  </TableHead>
                  <TableHead className="dark:text-gray-400 font-semibold">
                    Holat
                  </TableHead>
                  <TableHead className="text-right dark:text-gray-400 font-semibold">
                    Amallar
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="animate-spin h-5 w-5 mx-auto text-gray-400 dark:text-gray-500" />
                    </TableCell>
                  </TableRow>
                ) : filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-gray-500 dark:text-gray-400"
                    >
                      Ma'lumot topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher, index) => (
                    <TableRow
                      key={teacher._id || index}
                      className="dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <TableCell className="font-medium dark:text-gray-200">
                        {teacher.first_name || (teacher as any).firstName}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {teacher.last_name || (teacher as any).lastName}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {teacher.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="dark:border-gray-700 dark:text-gray-300 bg-white dark:bg-gray-950"
                        >
                          {teacher.role || "Ustoz"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 dark:hover:bg-gray-800 dark:text-gray-300"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200"
                          >
                            <DropdownMenuLabel className="dark:text-gray-400">
                              Amallar
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="dark:bg-gray-800" />
                            <DropdownMenuItem
                              onClick={() => openEditModal(teacher)}
                              className="dark:focus:bg-gray-800 cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteModal(teacher._id)}
                              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 dark:focus:bg-gray-800 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 1. QO'SHISH MODALI */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors">
          <DialogHeader>
            <DialogTitle>Yangi Ustoz Qo'shish</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTeacher} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Ism</Label>
                <Input
                  required
                  className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                  value={newTeacher.first_name}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, first_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Familiya</Label>
                <Input
                  required
                  className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                  value={newTeacher.last_name}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, last_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Email</Label>
              <Input
                type="email"
                required
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                value={newTeacher.email}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Parol</Label>
              <Input
                type="password"
                required
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                value={newTeacher.password}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, password: e.target.value })
                }
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:bg-gray-950"
                onClick={() => setIsAddModalOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={addLoading}
                className="bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {addLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. TAHRIRLASH MODALI */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors">
          <DialogHeader>
            <DialogTitle>Ustozni Tahrirlash</DialogTitle>
          </DialogHeader>
          {editingTeacher && (
            <form onSubmit={handleUpdateTeacher} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Ism</Label>
                  <Input
                    className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                    value={editingTeacher.first_name}
                    onChange={(e) =>
                      setEditingTeacher({
                        ...editingTeacher,
                        first_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Familiya</Label>
                  <Input
                    className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                    value={editingTeacher.last_name}
                    onChange={(e) =>
                      setEditingTeacher({
                        ...editingTeacher,
                        last_name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Email</Label>
                <Input
                  type="email"
                  className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                  value={editingTeacher.email}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Holat</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white transition-colors"
                  value={editingTeacher.status}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="faol">Faol</option>
                  <option value="ta'tilda">Ta'tilda</option>
                  <option value="ishdan bo'shatilgan">
                    Ishdan bo'shatilgan
                  </option>
                </select>
              </div>
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:bg-gray-950"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  className="bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  {editLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}{" "}
                  Yangilash
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. O'CHIRISH MODALI */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
              <AlertCircle size={20} /> O'chirishni tasdiqlang
            </DialogTitle>
            <DialogDescription className="pt-2 dark:text-gray-400">
              Haqiqatan ham bu ustozni o'chirmoqchimisiz? Bu amalni ortga
              qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:bg-gray-950"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTeacher}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
            >
              {deleteLoading ? (
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
