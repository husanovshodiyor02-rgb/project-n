// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest){
//     const token = request.cookies.get("token")?.value;
//     const role = request.cookies.get("role")?.value;
//     const pathname = request.nextUrl.pathname;

//     if (!token){
//         return NextResponse.redirect(new URL("/login", request.url));
//     }
//     if (
//       pathname.startsWith("/managers") &&
//       role !== "managers" &&
//       role !== "developer"
//     ) {
//     return NextResponse.redirect(new URL("/", request.url));
//     }

//     if (
//       pathname.startsWith("/admins") &&
//       role !== "admins" &&
//       role !== "developer"
//     ) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//     return NextResponse.next();
// }
// // "/((?!login).*)";
// export const config = {
//     matcher: [
//         "/",
//         "/admins/:path*",
//         "/managers/:path*",
//         "/developer/:path*",
//     ],
// };


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Login va statik fayllarni tekshirmasdan o'tkazib yuborish
  if (
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") // rasm, css, js fayllar
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  // 2. Token yo'q bo'lsa -> Login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Role tekshiruvi (Managers)
  if (
    pathname.startsWith("/managers") &&
    role !== "managers" &&
    role !== "developer"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 4. Role tekshiruvi (Admins)
  if (
    pathname.startsWith("/admins") &&
    role !== "admins" &&
    role !== "developer"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Config: Keraksiz fayllarni (api, static) middlewarega kiritmaslik
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};