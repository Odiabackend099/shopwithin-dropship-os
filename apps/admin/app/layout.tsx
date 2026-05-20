import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Dropship OS Admin",
  description: "Internal operating dashboard for AI-assisted global dropshipping."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
