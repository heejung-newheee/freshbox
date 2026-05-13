import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router";
import { supabase } from "./utils/supabase";
import { useAuthStore } from "./stores/authStore";
import { linkMemberAccount } from "./services/api";

const queryClient = new QueryClient();

// Initialize session and subscribe to auth changes
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setUser(session?.user ?? null);
  useAuthStore.getState().setLoading(false);

  // 로그인 시 초대 목록에 member_id 자동 연결
  if (session?.user) {
    linkMemberAccount(session.user.id, session.user.email ?? "").catch(() => {});
  }
});

useAuthStore.getState().checkUser();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
