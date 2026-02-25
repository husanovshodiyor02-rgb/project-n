"use client";

import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Clock,
  Users,
  Pencil,
  Trash2,
  Loader2,
  Snowflake,
  Flame,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Card, CardContent } from "@/components/ui/card";


interface Course {
  _id: string;
  name: any;
  description?: string;
  duration?: string;
  price?: number;
  students_count?: number;
  status?: string;
  is_frozen?: boolean;
  active?: boolean;
}

export default function CoursesPage() {
  const queryClient = useQueryClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;


  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;


  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

 
  const [categoryName, setCategoryName] = useState("");
  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
  });

  
  const [editCourseData, setEditCourseData] = useState({
    _id: "",
    name: "",
    description: "",
    duration: "",
    price: "",
  });

  
  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });


  const getSafeText = (data: any) => {
    if (!data) return "Noma'lum";
    if (typeof data === "object" && data.name) return data.name;
    return data;
  };

  const formatPrice = (price: number = 0) => {
    return new Intl.NumberFormat("en-US").format(price) + " UZS";
  };


  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await axios.get(
        `${API_URL}/api/course/get-courses`,
        getHeaders()
      );
      return res.data.data || res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });


  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      return axios.post(
        `${API_URL}/api/course/create-category`,
        { name },
        getHeaders()
      );
    },
    onSuccess: () => {
      setIsCategoryModalOpen(false);
      setCategoryName("");
      setIsCourseModalOpen(true);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Kategoriya yaratishda xato");
    },
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    createCategoryMutation.mutate(categoryName);
  };

  const createCourseMutation = useMutation({
    mutationFn: async (payload: any) => {
      return axios.post(
        `${API_URL}/api/course/create-course`,
        payload,
        getHeaders()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setIsCourseModalOpen(false);
      setNewCourse({ name: "", description: "", duration: "", price: "" });
      alert("Kurs muvaffaqiyatli qo'shildi!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Kurs yaratishda xato");
    },
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    createCourseMutation.mutate({
      ...newCourse,
      price: Number(newCourse.price),
    });
  };

  
  const openEditModal = (course: Course) => {
    setEditCourseData({
      _id: course._id,
      name: getSafeText(course.name),
      description: course.description || "",
      duration: course.duration || "",
      price: course.price?.toString() || "",
    });
    setIsEditModalOpen(true);
  };

  const editCourseMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        return await axios.post(
          `${API_URL}/api/course/edit-course`,
          payload,
          getHeaders()
        );
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 405) {
          return await axios.put(
            `${API_URL}/api/course/edit-course`,
            payload,
            getHeaders()
          );
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setIsEditModalOpen(false);
      alert("Kurs muvaffaqiyatli tahrirlandi!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Tahrirlashda xatolik yuz berdi");
    },
  });

  const handleEditCourse = (e: React.FormEvent) => {
    e.preventDefault();
    editCourseMutation.mutate({
      _id: editCourseData._id,
      id: editCourseData._id,
      course_id: editCourseData._id,
      name: editCourseData.name,
      description: editCourseData.description,
      duration: editCourseData.duration,
      price: Number(editCourseData.price),
    });
  };


  const freezeMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return axios.put(
        `${API_URL}/api/course/freeze-course`,
        { course_id: courseId },
        getHeaders()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Muzlatishda xato yuz berdi");
    },
  });


  const unfreezeMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return axios.put(
        `${API_URL}/api/course/unfreeze-course`,
        { course_id: courseId },
        getHeaders()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Eritishda xato yuz berdi");
    },
  });

 
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const payload = { _id: id, id, course_id: id };
      try {
        return await axios.delete(`${API_URL}/api/course/delete-course`, {
          ...getHeaders(),
          data: payload,
        });
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 405) {
          return await axios.delete(
            `${API_URL}/api/course/delete-course/${id}`,
            getHeaders()
          );
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
      alert("Kurs muvaffaqiyatli o'chirildi!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "O'chirishda xatolik yuz berdi");
    },
  });

  const handleDeleteCourse = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete);
    }
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Kurslar
        </h1>
        <Button
          className="bg-[#18181B] text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 flex gap-2 items-center transition-colors w-full sm:w-auto"
          onClick={() => setIsCategoryModalOpen(true)}
        >
          <Plus size={18} />
          <span>Kurs Qo'shish</span>
        </Button>
      </div>

    
      {coursesLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
          Hozircha kurslar mavjud emas. Yangi kurs qo'shing.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {courses.map((course: Course) => {
            const isFrozen = course.is_frozen === true;

            return (
              <Card
                key={course._id}
                className={`dark:bg-gray-900 dark:border-gray-800 transition-colors shadow-sm overflow-hidden flex flex-col ${
                  isFrozen ? "opacity-80" : ""
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col h-full justify-between flex-grow">
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 break-words flex-1">
                        {getSafeText(course.name)}
                      </h2>
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium px-2 py-1 rounded whitespace-nowrap">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {course.description || "Ta'rif kiritilmagan"}
                    </p>

                    {isFrozen && (
                      <span className="inline-flex mt-3 items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400">
                        <Snowflake size={12} className="mr-1" /> Muzlatilgan
                      </span>
                    )}
                  </div>

                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-3">
                      <Clock
                        size={16}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      <span>{course.duration || "Noma'lum"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-3">
                      <Users
                        size={16}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      <span>{course.students_count || 0} o'quvchi</span>
                    </div>
                  </div>

                  
                  <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(course)}
                      className="w-full flex items-center justify-center gap-1.5 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setCourseToDelete(course._id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 bg-[#EF4444] hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>O'chirish</span>
                    </Button>

                   
                    {isFrozen ? (
                      <Button
                        size="sm"
                        onClick={() => unfreezeMutation.mutate(course._id)}
                        disabled={
                          unfreezeMutation.isPending &&
                          unfreezeMutation.variables === course._id
                        }
                        className="col-span-2 w-full bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        {unfreezeMutation.isPending &&
                        unfreezeMutation.variables === course._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Flame className="w-4 h-4" />
                        )}
                        <span>Eritish</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => freezeMutation.mutate(course._id)}
                        disabled={
                          freezeMutation.isPending &&
                          freezeMutation.variables === course._id
                        }
                        className="col-span-2 w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        {freezeMutation.isPending &&
                        freezeMutation.variables === course._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Snowflake className="w-4 h-4" />
                        )}
                        <span>Muzlatish</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

  
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[400px] w-[90vw] bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors rounded-xl">
          <DialogHeader>
            <DialogTitle>Yangi Kategoriya Qo'shish</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleCreateCategory}
            className="space-y-4 py-2 sm:py-4"
          >
            <div className="space-y-2">
              <Label className="dark:text-gray-300">
                Guruh nomi (Kategoriya)
              </Label>
              <Input
                required
                placeholder="Masalan: Dasturlash"
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white dark:placeholder:text-gray-500 transition-colors"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:bg-gray-950"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={createCategoryMutation.isPending}
                className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {createCategoryMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Keyingisi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    
      <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
        <DialogContent className="sm:max-w-[425px] w-[90vw] bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors rounded-xl">
          <DialogHeader>
            <DialogTitle>Yangi Kurs Qo'shish</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleCreateCourse}
            className="space-y-4 py-2 sm:py-4"
          >
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Kurs nomi</Label>
              <Input
                required
                placeholder="Backend dasturlash"
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                value={newCourse.name}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Ta'rif (Description)</Label>
              <Input
                required
                placeholder="Yangi kurs haqida ma'lumot"
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                value={newCourse.description}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">
                Davomiyligi (Duration)
              </Label>
              <Input
                required
                placeholder="2 yil"
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                value={newCourse.duration}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, duration: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Narxi (UZS)</Label>
              <Input
                type="number"
                required
                placeholder="1000000"
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                value={newCourse.price}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, price: e.target.value })
                }
              />
            </div>
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:bg-gray-950"
                onClick={() => setIsCourseModalOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={createCourseMutation.isPending}
                className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {createCourseMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] w-[90vw] bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors rounded-xl">
          <DialogHeader>
            <DialogTitle>Kursni Tahrirlash</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCourse} className="space-y-4 py-2 sm:py-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Kurs nomi</Label>
              <Input
                required
                placeholder="Backend dasturlash"
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                value={editCourseData.name}
                onChange={(e) =>
                  setEditCourseData({ ...editCourseData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Ta'rif (Description)</Label>
              <Input
                required
                placeholder="Yangi kurs haqida ma'lumot"
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                value={editCourseData.description}
                onChange={(e) =>
                  setEditCourseData({
                    ...editCourseData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">
                Davomiyligi (Duration)
              </Label>
              <Input
                required
                placeholder="2 yil"
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                value={editCourseData.duration}
                onChange={(e) =>
                  setEditCourseData({
                    ...editCourseData,
                    duration: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Narxi (UZS)</Label>
              <Input
                type="number"
                required
                placeholder="1000000"
                className="bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-white"
                value={editCourseData.price}
                onChange={(e) =>
                  setEditCourseData({
                    ...editCourseData,
                    price: e.target.value,
                  })
                }
              />
            </div>
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:bg-gray-950"
                onClick={() => setIsEditModalOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={editCourseMutation.isPending}
                className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {editCourseMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                O'zgartirish
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

   
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px] w-[90vw] bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
              <AlertCircle size={20} /> O'chirishni tasdiqlang
            </DialogTitle>
            <DialogDescription className="pt-2 dark:text-gray-400">
              Haqiqatan ham bu kursni o'chirmoqchimisiz? Ushbu amalni ortga
              qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:bg-gray-950"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCourse}
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
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
