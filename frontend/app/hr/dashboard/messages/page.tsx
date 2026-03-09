"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import HrMessages from "../HrMessages";

export default function HrMessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
      {/* Top bar with logo (matches reference) */}
      <header className="w-full bg-white border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="AVAA logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-[22px] md:text-2xl font-bold tracking-tight text-[#1e3a4f]">
              AVAA
            </span>
          </div>

          {/* Simple right-side avatar placeholder for responsiveness */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#e5e7eb] flex items-center justify-center text-xs font-bold text-[#6b7280] overflow-hidden">
              <span>HR</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main messages layout */}
      <main className="flex-1 w-full px-2 md:px-6 py-4 md:py-6">
        <div className="max-w-6xl mx-auto">
          <HrMessages
            initialUserId={searchParams.get("userId")}
            onBack={() => router.push("/hr-dashboard")}
          />
        </div>
      </main>
    </div>
  );
}


