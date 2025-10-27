import { Tv } from "lucide-react";

export default function CRTToggle() {
  const toggleCRT = () => {
    const isCRT = document.documentElement.classList.contains("crt");
    if (isCRT) {
      document.documentElement.classList.remove("crt");
    } else {
      document.documentElement.classList.add("crt");
    }
    localStorage.setItem("crt", isCRT ? "disabled" : "enabled");
  };

  return (
    <button
      onClick={toggleCRT}
      className="cursor-pointer rounded-2xl p-2 transition-colors hover:text-fg3 active:scale-95 active:text-fg4"
      aria-label="Toggle CRT effect"
    >
      <Tv />
    </button>
  );
}
