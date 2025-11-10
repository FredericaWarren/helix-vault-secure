import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Encrypted Glucose Check",
  description: "Privacy-preserving glucose risk assessment using FHEVM",
  icons: {
    icon: "/glucose-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`glucose-bg text-foreground antialiased`}>
        <div className="fixed inset-0 w-full h-full glucose-bg z-[-20] min-w-[850px]"></div>
        <main className="flex flex-col max-w-screen-lg mx-auto pb-20 min-w-[850px]">
          <nav className="flex w-full px-3 md:px-0 h-fit py-10 justify-between items-center">
            <div className="flex items-center gap-4">
              <Image
                src="/glucose-logo.svg"
                alt="Glucose Check Logo"
                width={60}
                height={60}
              />
              <h1 className="text-2xl font-bold text-white">Encrypted Glucose Check</h1>
            </div>
          </nav>
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}

