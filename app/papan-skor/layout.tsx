import { AppContainer } from "@/components/layout/AppContainer";

export default function PapanSkorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppContainer>{children}</AppContainer>;
}
