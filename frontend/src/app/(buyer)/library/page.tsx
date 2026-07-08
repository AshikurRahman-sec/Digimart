"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LibraryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="loading-panel">
      <span>Redirecting to your workspace...</span>
    </main>
  );
}
