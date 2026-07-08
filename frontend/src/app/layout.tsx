import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "DigiMart",
  description: "Digital marketplace for creators and buyers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="theme-shell">
          <div className="theme-toggle-anchor">
            <ThemeToggle />
          </div>
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
