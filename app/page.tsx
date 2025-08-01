import { ThemeSwitcher } from "@/components/theme-switcher";
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans flex-1">
      <ThemeSwitcher />
    </div>
  );
}
