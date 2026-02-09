import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import { getSessionUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Company Secretariat & Probate",
  description: "Company secretariat evaluation questionnaires",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="global-brand-bar">
          <Image
            src="/firstregistrars.png"
            alt="FirstRegistrars & Investor Services"
            width={360}
            height={102}
            priority
            className="global-brand-logo"
          />
        </div>
        {user ? (
          <div className="app-layout">
            <Sidebar role={user.role} />
            <div className="main-content">
              <Header user={user} />
              {children}
            </div>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}
