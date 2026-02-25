"use client";

import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  MoreHorizontal,
  Loader2,
  CalendarClock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Types
interface Group {
  _id: string;
  name?: string;
  group_name?: string;
  teacher?: any;
  students?: any[];
  student_count?: number;
  start_date?: string;
  started_group?: string;
  createdAt?: string;
  end_date?: string | null;
  ended_group?: string | null;
  date?: string | null;
}

export default function GroupsPage() {
  const queryClient = useQueryClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // --- 1. GURUH QO'SHISH STATE (Rasmdagidek: nomi, ustoz, email) ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    teacher: "",
    email: "",
  });

  // --- 2. TUGASH VAQTINI BELGILASH STATE ---
  const [isEndDateModalOpen, setIsEndDateModalOpen] = useState(false);
  const [endDateData, setEndDateData] = useState({
    _id: "",
    date: "",
  });

  // --- 3. GURUHNI TUGATISH STATE ---
  const [isEndGroupModalOpen, setIsEndGroupModalOpen] = useState(false);
  const [groupToEnd, setGroupToEnd] = useState<string | null>(null);

  // ==========================================
  // QUERIES: MA'LUMOTLARNI OLIB KELISH
  // ==========================================

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/group/get-all-group`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return res.data.data || res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ==========================================
  // MUTATIONS: MA'LUMOTLARNI O'ZGARTIRISH
  // ==========================================

  // 1. GURUH YARATISH
  const addMutation = useMutation({
    mutationFn: async (payload: any) => {
      return axios.post(`${API_URL}/api/group/create-group`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsAddModalOpen(false);
      setNewGroup({ name: "", teacher: "", email: "" });
      alert("Guruh muvaffaqiyatli qo'shildi!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(newGroup);
  };

  // 2. TUGASH VAQTINI BELGILASH
  const editEndDateMutation = useMutation({
    mutationFn: async (payload: any) => {
      return axios.put(`${API_URL}/api/group/edit-end-group`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsEndDateModalOpen(false);
      setEndDateData({ _id: "", date: "" });
      alert("Tugash vaqti belgilandi!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const handleEditEndDate = (e: React.FormEvent) => {
    e.preventDefault();
    editEndDateMutation.mutate(endDateData);
  };

  // 3. GURUHNI TUGATISH
  const endGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`${API_URL}/api/group/end-group`, {
        data: { _id: id },
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsEndGroupModalOpen(false);
      setGroupToEnd(null);
      alert("Guruh tugatildi!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const handleEndGroup = () => {
    if (groupToEnd) {
      endGroupMutation.mutate(groupToEnd);
    }
  };

  // --- Yordamchi Funksiyalar ---
  const formatDateTime = (
    dateString?: string | null,
    isEndDate: boolean = false
  ) => {
    if (!dateString) return isEndDate ? "Davom etmoqda" : "Vaqt noma'lum";

    const d = new Date(dateString);
    if (isNaN(d.getTime()))
      return isEndDate ? "Davom etmoqda" : "Noto'g'ri sana";

    const pad = (n: number) => n.toString().padStart(2, "0");
    const date = `${pad(d.getDate())}.${pad(
      d.getMonth() + 1
    )}.${d.getFullYear()}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
      d.getSeconds()
    )}`;

    return `${date}, ${time}`;
  };

  const getTeacherName = (teacher: any) => {
    if (!teacher) return "Biriktirilmagan";
    if (typeof teacher === "string") return teacher;
    return (
      `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim() ||
      "Noma'lum"
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Card className="dark:bg-gray-900 dark:border-gray-800 transition-colors shadow-sm">
        {/* HEADER */}
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6">
          <CardTitle className="text-2xl font-bold dark:text-gray-100">
            Guruhlar ro'yxati
          </CardTitle>
          <Button
            className="bg-[#18181b] text-white hover:bg-[#18181b]/90 dark:bg-white dark:text-black dark:hover:bg-gray-200 flex gap-2 items-center transition-colors w-full sm:w-auto"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} />
            <span>Guruh Qo'shish</span>
          </Button>
        </CardHeader>

        {/* TABLE */}
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-950/50 transition-colors">
                <TableRow className="dark:border-gray-800 hover:bg-transparent dark:hover:bg-transparent">
                  <TableHead className="dark:text-gray-400 font-semibold w-16 text-center">
                    No
                  </TableHead>
                  <TableHead className="dark:text-gray-400 font-semibold">
                    Guruh nomi
                  </TableHead>
                  <TableHead className="dark:text-gray-400 font-semibold">
                    Ustoz
                  </TableHead>
                  <TableHead className="dark:text-gray-400 font-semibold text-center">
                    O'quvchilar soni
                  </TableHead>
                  <TableHead className="dark:text-gray-400 font-semibold">
                    Boshlangan vaqti
                  </TableHead>
                  <TableHead className="dark:text-gray-400 font-semibold">
                    Tugagan vaqti
                  </TableHead>
                  <TableHead className="text-right dark:text-gray-400 font-semibold pr-6">
                    Amallar
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="animate-spin h-5 w-5 mx-auto text-gray-400 dark:text-gray-500" />
                    </TableCell>
                  </TableRow>
                ) : groups.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-gray-500 dark:text-gray-400"
                    >
                      Ma'lumot topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  groups.map((group: any, index: number) => {
                    const startTime =
                      group.start_date ||
                      group.started_group ||
                      group.createdAt;
                    const endTime =
                      group.end_date || group.ended_group || group.date;

                    return (
                      <TableRow
                        key={group._id || index}
                        className="dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <TableCell className="text-center font-medium dark:text-gray-400">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium dark:text-gray-200">
                          {group.name || group.group_name || "Nomsiz guruh"}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {getTeacherName(group.teacher)}
                        </TableCell>
                        <TableCell className="text-center dark:text-gray-300">
                          {group.student_count || group.students?.length || 0}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {formatDateTime(startTime, false)}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {formatDateTime(endTime, true)}
                        </TableCell>
                        <TableCell className="text-right pr-4">
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
                              className="bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 w-52"
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  setEndDateData({ _id: group._id, date: "" });
                                  setIsEndDateModalOpen(true);
                                }}
                                className="dark:focus:bg-gray-800 cursor-pointer"
                              >
                                <CalendarClock className="mr-2 h-4 w-4" />{" "}
                                Tugash vaqtini belgilash
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setGroupToEnd(group._id);
                                  setIsEndGroupModalOpen(true);
                                }}
                                className="dark:focus:bg-gray-800 cursor-pointer text-green-600 focus:text-green-600 dark:text-green-500 dark:focus:text-green-400"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" /> Guruhni
                                tugatish
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* 1. GURUH QO'SHISH MODALI (Rasmdagi dizaynga ko'chirilgan 100%) */}
      {/* ====================================================== */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white dark:bg-[#18181b] dark:border-gray-800 dark:text-gray-100 p-6 rounded-xl shadow-lg border-0">
          <DialogHeader>
            {/* Rasmda Tahrirlash deb yozilgan, xohlasangiz Guruh qo'shish deb o'zgartirishingiz mumkin */}
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Tahrirlash
            </DialogTitle>
            <DialogDescription className="hidden">
              Guruh ma'lumotlarini kiritish
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            {/* 1. Guruh nomi (Input bilan) */}
            <div className="space-y-1.5">
              <Label className="text-[14px] font-medium text-gray-800 dark:text-gray-300">
                Guruh nomi
              </Label>
              <Input
                required
                placeholder="Davron"
                className="h-11 rounded-[8px] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 text-[15px] focus-visible:ring-1 focus-visible:ring-gray-400 text-gray-900 dark:text-white"
                value={newGroup.name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, name: e.target.value })
                }
              />
            </div>

            {/* 2. Ustoz (Input bilan) */}
            <div className="space-y-1.5">
              <Label className="text-[14px] font-medium text-gray-800 dark:text-gray-300">
                Ustoz
              </Label>
              <Input
                required
                placeholder="Davron"
                className="h-11 rounded-[8px] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 text-[15px] focus-visible:ring-1 focus-visible:ring-gray-400 text-gray-900 dark:text-white"
                value={newGroup.teacher}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, teacher: e.target.value })
                }
              />
            </div>

            {/* 3. Email (Input bilan) */}
            <div className="space-y-1.5">
              <Label className="text-[14px] font-medium text-gray-800 dark:text-gray-300">
                Email
              </Label>
              <Input
                required
                placeholder="2025-05-15"
                className="h-11 rounded-[8px] border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 text-[15px] focus-visible:ring-1 focus-visible:ring-gray-400 text-gray-900 dark:text-white"
                value={newGroup.email}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, email: e.target.value })
                }
              />
            </div>

            {/* Tugma */}
            <DialogFooter className="pt-3 sm:justify-end">
              <Button
                type="submit"
                disabled={addMutation.isPending}
                className="bg-[#1e1e1c] hover:bg-black text-white dark:bg-white dark:text-black rounded-[8px] px-5 h-10 font-medium transition-colors"
              >
                {addMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. TUGASH VAQTINI BELGILASH MODALI */}
      <Dialog open={isEndDateModalOpen} onOpenChange={setIsEndDateModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 rounded-xl">
          <DialogHeader>
            <DialogTitle>Tugash vaqtini belgilash</DialogTitle>
            <DialogDescription className="hidden">
              Guruhning tugash vaqtini tahrirlash
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEndDate} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Tugash sanasi</Label>
              <Input
                type="date"
                required
                className="h-11 rounded-[8px] border-gray-300 dark:border-gray-700 bg-white dark:bg-transparent dark:text-white dark:[color-scheme:dark]"
                value={endDateData.date}
                onChange={(e) =>
                  setEndDateData({ ...endDateData, date: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-[8px] dark:border-gray-700 dark:hover:bg-gray-800"
                onClick={() => setIsEndDateModalOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={editEndDateMutation.isPending}
                className="bg-[#18181b] text-white dark:bg-white dark:text-black rounded-[8px]"
              >
                {editEndDateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. GURUHNI TUGATISH MODALI */}
      <Dialog open={isEndGroupModalOpen} onOpenChange={setIsEndGroupModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-500">
              <AlertCircle size={20} /> Guruhni tugatish
            </DialogTitle>
            <DialogDescription className="pt-2 dark:text-gray-400">
              Haqiqatan ham bu guruhni tugatmoqchimisiz? Guruh o'z faoliyatini
              to'xtatadi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="rounded-[8px] dark:border-gray-700 dark:hover:bg-gray-800"
              onClick={() => setIsEndGroupModalOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleEndGroup}
              disabled={endGroupMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white rounded-[8px]"
            >
              {endGroupMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Ha, tugatish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
