import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Extract AI | Invoice Processing",
  description: "Automated invoice data extraction for finance teams.",
};

import { ThemeProvider } from "./context/ThemeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

