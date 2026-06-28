import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "BrainBoom",
    description: "Asah otakmu! Tebak-tebakan seru setiap hari.",
    manifest: "/manifest.json",
    robots: "index, follow",
    openGraph: {
        title: "BrainBoom",
        description: "Asah otakmu! Tebak-tebakan seru setiap hari.",
        type: "website",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "BrainBoom",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id">
            <head>
                <link rel="icon" href="/icons/icon-192.png" />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
            </head>
            <body>{children}</body>
        </html>
    );
}
