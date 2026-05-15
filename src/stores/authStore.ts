import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../utils/supabase";
import type { Role } from "@/@types";

interface AuthStore {
  user: User | null;
  fridgeId: string | null;
  role: Role | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setFridgeId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

async function resolveProfile(userId: string): Promise<{ fridgeId: string; role: Role }> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("fridge_id, role")
      .eq("id", userId)
      .maybeSingle();

    const fridgeId = profile?.fridge_id ?? userId;
    const role: Role = fridgeId === userId ? "owner" : ((profile?.role as Role) ?? "viewer");
    return { fridgeId, role };
  } catch {
    return { fridgeId: userId, role: "owner" };
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  fridgeId: null,
  role: null,
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
    const { fridgeId, role } = await resolveProfile(data.user.id);
    set({ user: data.user, fridgeId, role });
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, fridgeId: null, role: null });
  },

  checkUser: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      if (user) {
        const { fridgeId, role } = await resolveProfile(user.id);
        set({ user, fridgeId, role, loading: false });
      } else {
        set({ user: null, fridgeId: null, role: null, loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },
}));
