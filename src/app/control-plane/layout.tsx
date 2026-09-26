import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ControlPlaneProvider } from "@/components/control-plane/ControlPlaneProvider";
import { ControlPlaneShell } from "@/components/control-plane/Shell";
import "./control-plane.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI-Native Edge & Network Control Plane",
    template: "%s · Control Plane",
  },
  description:
    "Control plane for Kubernetes, K3s, KubeEdge, AI workloads, SDN and edge infrastructure.",
  robots: { index: false, follow: false },
};

export default function ControlPlaneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} min-h-dvh bg-[#07090d]`}>
      <ControlPlaneProvider>
        <ControlPlaneShell>{children}</ControlPlaneShell>
      </ControlPlaneProvider>
    </div>
  );
}
