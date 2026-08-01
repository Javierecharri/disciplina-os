import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { AppDataProvider } from "@/hooks/useAppData";
import { AppShell } from "@/components/shared/AppShell";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Disciplina OS",
  description: "Tu sistema operativo personal de disciplina — hábitos y progreso, todos los días.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AppDataProvider>
            <TooltipProvider delay={200}>
              <AppShell>{children}</AppShell>
              <CommandPalette />
              <Toaster position="bottom-right" />
            </TooltipProvider>
          </AppDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
