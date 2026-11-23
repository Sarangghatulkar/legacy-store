import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/lib/authContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "LEGACY — The Architecture of Luxury Timepieces & Horology",
  description: "Sculptural mechanical timepieces forged in 316L surgical stainless steel with double-domed sapphire crystal. Experience the Tourbillon, Astrum, Noir and Heritage series.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-white text-black font-sans selection:bg-black selection:text-white">
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#000000',
                color: '#ffffff',
                border: '1px solid #262626',
                borderRadius: '2px',
                fontSize: '12px',
                fontFamily: 'sans-serif',
                letterSpacing: '0.05em',
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
