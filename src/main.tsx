import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router";
import { supabase } from "./utils/supabase";
import { useAuthStore } from "./stores/authStore";

export const queryClient = new QueryClient();

let prevUserId: string | null = null;

// 로그아웃 및 다른 유저 전환 시 상태/캐시 초기화
supabase.auth.onAuthStateChange((_event, session) => {
  const store = useAuthStore.getState();
  const nextUserId = session?.user?.id ?? null;

  if (_event === "SIGNED_OUT") {
    store.setUser(null);
    store.setFridgeId(null);
    queryClient.clear();
  } else if (prevUserId !== null && nextUserId !== prevUserId) {
    queryClient.clear();
  }

  prevUserId = nextUserId;
});

// 앱 시작 시 세션 + fridge_id 한번에 로드
useAuthStore.getState().checkUser();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
