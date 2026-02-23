"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
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

// Types (Backend maydonlari to'liq hisobga olindi)
interface Group {
  _id: string;
  name?: string;
  group_name?: string;
  teacher?:
    | {
        _id: string;
        first_name: string;
        last_name: string;
      }
    | string;
  students?: any[];
  student_count?: number;

  // Boshlanish vaqti kelishi mumkin bo'lgan variantlar
  start_date?: string;
  started_group?: string;
  createdAt?: string;

  // Tugash vaqti kelishi mumkin bo'lgan variantlar
  end_date?: string | null;
  ended_group?: string | null;
  date?: string | null;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Yordamchi ma'lumotlar state'i (Kurslar va Ustozlar ro'yxati guruh ochish uchun)
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // --- 1. GURUH QO'SHISH STATE ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newGroup, setNewGroup] = useState({
    course_id: "",
    teacher: "",
    started_group: "",
  });

  // --- 2. TUGASH VAQTINI BELGILASH STATE ---
  const [isEndDateModalOpen, setIsEndDateModalOpen] = useState(false);
  const [endDateLoading, setEndDateLoading] = useState(false);
  const [endDateData, setEndDateData] = useState({
    _id: "",
    date: "",
  });

  // --- 3. GURUHNI TUGATISH STATE ---
  const [isEndGroupModalOpen, setIsEndGroupModalOpen] = useState(false);
  const [endGroupLoading, setEndGroupLoading] = useState(false);
  const [groupToEnd, setGroupToEnd] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Ma'lumotlarni yuklash
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/group/get-all-group`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data.data || res.data || []);
    } catch (error) {
      console.error("Guruhlarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      // Ustozlar ro'yxatini yuklash (Dropdown uchun)
      const resTeachers = await axios.get(
        `${API_URL}/api/teacher/get-all-teachers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeachers(resTeachers.data.data || resTeachers.data || []);

      // Kurslar ro'yxatini yuklash
      const resCourses = await axios.get(
        `${API_URL}/api/course/get-all-courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCourses(resCourses.data.data || resCourses.data || []);
    } catch (error) {
      console.error("Ustoz/Kurslarni yuklashda xatolik:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchAuxData();
  }, []);

  // --- API: GURUH YARATISH ---
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await axios.post(`${API_URL}/api/group/create-group`, newGroup, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAddModalOpen(false);
      setNewGroup({ course_id: "", teacher: "", started_group: "" });
      fetchGroups();
      alert("Guruh muvaffaqiyatli qo'shildi!");
    } catch (error: any) {
      console.error("Guruh ochishda xatolik:", error);
      alert(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setAddLoading(false);
    }
  };

  // --- API: TUGASH VAQTINI BELGILASH ---
  const handleEditEndDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEndDateLoading(true);
    try {
      await axios.put(`${API_URL}/api/group/edit-end-group`, endDateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEndDateModalOpen(false);
      setEndDateData({ _id: "", date: "" });
      fetchGroups();
      alert("Tugash vaqti belgilandi!");
    } catch (error: any) {
      console.error("Tugash vaqtini belgilashda xatolik:", error);
      alert(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setEndDateLoading(false);
    }
  };

  // --- API: GURUHNI TUGATISH ---
  const handleEndGroup = async () => {
    if (!groupToEnd) return;
    setEndGroupLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/group/end-group`,
        { _id: groupToEnd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEndGroupModalOpen(false);
      setGroupToEnd(null);
      fetchGroups();
      alert("Guruh tugatildi!");
    } catch (error: any) {
      console.error("Guruhni tugatishda xatolik:", error);
      alert(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setEndGroupLoading(false);
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
            className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 flex gap-2 items-center transition-colors w-full sm:w-auto"
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
                {loading ? (
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
                  groups.map((group, index) => {
                    // Backendda boshlanish va tugash sanasi har xil propertylarda kelishi mumkin
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

      {/* 1. GURUH QO'SHISH MODALI */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors">
          <DialogHeader>
            <DialogTitle>Yangi Guruh Qo'shish</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Kursni tanlang</Label>
              <select
                required
                className="flex h-10 w-full rounded-md border border-input dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-700 dark:text-white transition-colors"
                value={newGroup.course_id}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, course_id: e.target.value })
                }
              >
                <option value="" disabled>
                  Kurs tanlang
                </option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name || c.course_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Ustozni tanlang</Label>
              <select
                required
                className="flex h-10 w-full rounded-md border border-input dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-700 dark:text-white transition-colors"
                value={newGroup.teacher}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, teacher: e.target.value })
                }
              >
                <option value="" disabled>
                  Ustoz tanlang
                </option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.first_name} {t.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Boshlanish sanasi</Label>
              <Input
                type="date"
                required
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white dark:[color-scheme:dark]"
                value={newGroup.started_group}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, started_group: e.target.value })
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
                )}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. TUGASH VAQTINI BELGILASH MODALI */}
      <Dialog open={isEndDateModalOpen} onOpenChange={setIsEndDateModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors">
          <DialogHeader>
            <DialogTitle>Tugash vaqtini belgilash</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditEndDate} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Tugash sanasi</Label>
              <Input
                type="date"
                required
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white dark:[color-scheme:dark]"
                value={endDateData.date}
                onChange={(e) =>
                  setEndDateData({ ...endDateData, date: e.target.value })
                }
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:bg-gray-950"
                onClick={() => setIsEndDateModalOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={endDateLoading}
                className="bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {endDateLoading && (
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
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors">
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
              className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:bg-gray-950"
              onClick={() => setIsEndGroupModalOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleEndGroup}
              disabled={endGroupLoading}
              className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
            >
              {endGroupLoading ? (
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
