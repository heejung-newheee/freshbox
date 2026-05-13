import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../utils/supabase";

interface AuthStore {
  user: User | null;
  fridgeId: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setFridgeId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

// profiles.fridge_id 조회 — 실패 시 userId로 fallback
async function resolveFridgeId(userId: string): Promise<string> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("fridge_id")
      .eq("id", userId)
      .maybeSingle();
    return data?.fridge_id ?? userId;
  } catch {
    return userId;
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  fridgeId: null,
  loading: true,

  setUser: (user) => set({ user }),
  setFridgeId: (fridgeId) => set({ fridgeId }),
  setLoading: (loading) => set({ loading }),

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    const fridgeId = await resolveFridgeId(data.user.id);
    set({ user: data.user, fridgeId });
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, fridgeId: null });
  },

  checkUser: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      if (user) {
        const fridgeId = await resolveFridgeId(user.id);
        set({ user, fridgeId, loading: false });
      } else {
        set({ user: null, fridgeId: null, loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },
}));
