"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // QueryClient ni useState ichida yaratish Next.js (App Router) uchun eng to'g'ri usul hisoblanadi
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // MA'LUMOTLAR 5 DAQIQA SAQLANADI (zapros qayta ketmaydi)
            refetchOnWindowFocus: false, // Boshqa tabga o'tib qaytganda avtomat zapros ketmaydi
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
