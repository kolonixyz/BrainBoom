import type { Metadata } from "next";
import { BrainBoomGame } from "../components/game/BrainBoomGame";

export const metadata: Metadata = {
    title: "BrainBoom — Tebak-tebakan Seru!",
    description: "Asah otakmu dengan tebak-tebakan seru. Berhasil semua tantangan?",
};

export default function GamePage() {
    return <BrainBoomGame />;
}
