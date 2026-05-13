import { supabase } from "@/utils/supabase";
import type { FoodItem, Role } from "@/@types";

// ─── helpers ─────────────────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("로그인이 필요합니다");
  return data.user.id;
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
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("food_items")
    .select("*")
    .eq("user_id", userId)
    .eq("consumed", false)
    .order("expiry", { ascending: true });

  if (error) throw error;
  return (data || []).map(normalizeItem);
};

export const addFoodItem = async (
  item: Omit<FoodItem, "id" | "consumed">,
): Promise<FoodItem | null> => {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("food_items")
    .insert([{ ...item, consumed: false, user_id: userId, created_at: new Date().toISOString() }])
    .select();

  if (error) throw error;
  return data?.[0] ? normalizeItem(data[0]) : null;
};

export const deleteFoodItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from("food_items").delete().eq("id", id);
  if (error) throw error;
};

export const markFoodItemConsumed = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("food_items")
    .update({ consumed: true })
    .eq("id", id);
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
  const userId = await getCurrentUserId();
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
  const userId = await getCurrentUserId();

  // Check if already invited
  const { data: existing } = await supabase
    .from("fridge_members")
    .select("id")
    .eq("fridge_owner_id", userId)
    .eq("member_email", email)
    .maybeSingle();

  if (existing) throw new Error("이미 초대된 이메일입니다");

  const { data, error } = await supabase
    .from("fridge_members")
    .insert([{ fridge_owner_id: userId, member_email: email, role }])
    .select()
    .single();

  if (error) throw error;
  return data as FridgeMember;
};

export const removeFridgeMember = async (id: string): Promise<void> => {
  const { error } = await supabase.from("fridge_members").delete().eq("id", id);
  if (error) throw error;
};

// 로그인한 사용자의 이메일과 일치하는 fridge_members 행에 member_id를 연결
export const linkMemberAccount = async (userId: string, email: string): Promise<void> => {
  await supabase
    .from("fridge_members")
    .update({ member_id: userId })
    .eq("member_email", email)
    .is("member_id", null);
};
