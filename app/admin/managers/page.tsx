"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";

// Backenddan keladigan ma'lumotlar turi (Sizning kodingizga moslab)
interface Manager {
  _id: string; // Yoki id
  first_name: string; // Sizning kodingizdagi nom
  last_name: string; // Sizning kodingizdagi nom
  email: string;
  role: string;
  status: string;
}

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Next.js da .env faylni chaqirish
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const token = localStorage.getItem("token");

        // Agar API_URL bo'lmasa xatolik oldini olish
        if (!API_URL) {
          console.error("API URL topilmadi");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/staff/all-managers`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Ma'lumotlarni olishda xatolik");
        }

        const res = await response.json();

        // Sizning kodingizdagi logikani saqlab qoldim (res.data.data yoki res.data)
        // Backend odatda { success: true, data: [...] } qaytaradi
        const managersList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setManagers(managersList);
      } catch (err) {
        console.error(err);
        setError("Server bilan bog'lanishda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, [API_URL]);

  // Statusni rangli chiqarish
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "active" || s === "faol") {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
          Faol
        </Badge>
      );
    }
    if (s === "blocked" || s === "deleted" || s === "ishdan bo'shatilgan") {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
          Bloklangan
        </Badge>
      );
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (error) return <p className="text-red-500 p-6">{error}</p>;

  return (
    <Card className="m-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Foydalanuvchilar ro'yxati
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ism</TableHead>
              <TableHead>Familiya</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers.length > 0 ? (
              managers.map((m) => (
                <TableRow key={m._id}>
                  {/* Backenddan kelgan first_name va last_name ishlatilmoqda */}
                  <TableCell className="font-medium">{m.first_name}</TableCell>
                  <TableCell>{m.last_name}</TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{m.role}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(m.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => console.log("Edit", m._id)}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Tahrirlash
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> O'chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-gray-500"
                >
                  Ma'lumot topilmadi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
