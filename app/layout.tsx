import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PLATFORM_LABEL, PRODUCT_DESCRIPTION, PRODUCT_NAME } from "@/lib/brand";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} | ${PLATFORM_LABEL}`,
  description: PRODUCT_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
