"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentsPage() {
  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* YUQORI QISM: Sarlavha va Tugma */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          To'lovlar
        </h1>

        <Button className="bg-[#18181B] text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 w-full sm:w-auto">
          <Plus size={18} className="mr-2" />
          To'lov qo'shish
        </Button>
      </div>

      {/* JADVAL (TABLE) SARLAVHASI */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-4 transition-colors">
          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-900 dark:text-gray-200">
            <div>Talaba</div>
            <div>Guruh</div>
            <div>Miqdor</div>
            <div>Oy</div>
            <div>Usul</div>
            <div>Sana</div>
          </div>
        </div>
      </div>

      {/* Shu yerdan pastga jadvalning ma'lumotlar qatori (ro'yxati) qo'shilib boradi */}
    </div>
  );
}
