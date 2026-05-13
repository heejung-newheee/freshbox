import { supabase } from "@/utils/supabase";
import type { FoodItem, Role } from "@/@types";
import { useAuthStore } from "@/stores/authStore";

// ─── helpers ─────────────────────────────────────────────────────────────────

function getStoreIds(): { userId: string; fridgeId: string } {
  const { user, fridgeId } = useAuthStore.getState();
  if (!user || !fridgeId) throw new Error("로그인이 필요합니다");
  return { userId: user.id, fridgeId };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeItem = (item: any): FoodItem => ({
  ...item,
  location:
    item.location === "냉장칸"
      ? "냉장"
      : item.location === "냉동칸"
        ? "냉동"
        : item.location,
  category:
    (
      {
        채소: "채소/과일",
        육류: "육류/달걀",
        두부: "두부/콩류",
        가공: "가공식품",
      } as Record<string, string>
    )[item.category as string] ?? item.category,
  zone: item.zone ? (item.zone as string).replace(/칸$/, "") : item.zone,
});

// ─── Food Items ───────────────────────────────────────────────────────────────

export const getFoodItems = async (): Promise<FoodItem[]> => {
  const { fridgeId } = getStoreIds();
  const { data, error } = await supabase
    .from("food_items")
    .select("*")
    .eq("fridge_id", fridgeId)
    .eq("consumed", false)
    .order("expiry", { ascending: true });

  if (error) throw error;
  return (data || []).map(normalizeItem);
};

export const addFoodItem = async (
  item: Omit<FoodItem, "id" | "consumed">,
): Promise<FoodItem | null> => {
  const { fridgeId } = getStoreIds();
  const { data, error } = await supabase
    .from("food_items")
    .insert([{
      ...item,
      consumed: false,
      fridge_id: fridgeId,
      created_at: new Date().toISOString(),
    }])
    .select();

  if (error) throw error;
  return data?.[0] ? normalizeItem(data[0]) : null;
};

export const markFoodItemConsumed = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("food_items")
    .update({ consumed: true })
    .eq("id", id);
  if (error) throw error;
};

export const deleteFoodItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from("food_items").delete().eq("id", id);
  if (error) throw error;
};

// ─── Fridge Members ───────────────────────────────────────────────────────────

export interface FridgeMember {
  id: string;
  fridge_owner_id: string;
  member_email: string;
  member_id: string | null;
  role: Extract<Role, "editor" | "viewer">;
  created_at: string;
}

export const getFridgeMembers = async (): Promise<FridgeMember[]> => {
  const { userId } = getStoreIds();
  const { data, error } = await supabase
    .from("fridge_members")
    .select("*")
    .eq("fridge_owner_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as FridgeMember[];
};

export const inviteFridgeMember = async (
  email: string,
  role: Extract<Role, "editor" | "viewer">,
): Promise<FridgeMember> => {
  const { userId } = getStoreIds();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!profile) throw new Error("FreshBox에 가입되지 않은 이메일입니다");

  const { data: existing } = await supabase
    .from("fridge_members")
    .select("id")
    .eq("fridge_owner_id", userId)
    .eq("member_email", email)
    .maybeSingle();

  if (existing) throw new Error("이미 초대된 멤버입니다");

  const { data, error } = await supabase
    .from("fridge_members")
    .insert([{ fridge_owner_id: userId, member_email: email, member_id: profile.id, role }])
    .select()
    .single();

  if (error) throw error;

  await supabase.rpc("set_member_fridge", {
    p_member_id: profile.id,
    p_fridge_id: userId,
  });

  return data as FridgeMember;
};

export const removeFridgeMember = async (id: string): Promise<void> => {
  const { data: row } = await supabase
    .from("fridge_members")
    .select("member_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("fridge_members").delete().eq("id", id);
  if (error) throw error;

  if (row?.member_id) {
    await supabase.rpc("set_member_fridge", {
      p_member_id: row.member_id,
      p_fridge_id: row.member_id,
    });
  }
};
