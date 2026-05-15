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

// ─── Fridge Owner ────────────────────────────────────────────────────────────

export interface FridgeOwnerInfo {
  id: string;
  email: string;
}

export const getFridgeOwnerInfo = async (): Promise<FridgeOwnerInfo> => {
  const { fridgeId } = getStoreIds();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("id", fridgeId)
    .single();
  if (error) throw error;
  return data as FridgeOwnerInfo;
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
  const { fridgeId } = getStoreIds();
  const { data, error } = await supabase
    .from("fridge_members")
    .select("*")
    .eq("fridge_owner_id", fridgeId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as FridgeMember[];
};

export const inviteFridgeMember = async (
  email: string,
  role: Extract<Role, "editor" | "viewer">,
): Promise<void> => {
  const { fridgeId } = getStoreIds();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!profile) throw new Error("FreshBox에 가입되지 않은 이메일입니다");

  const { data: existing } = await supabase
    .from("fridge_members")
    .select("id")
    .eq("fridge_owner_id", fridgeId)
    .eq("member_email", email)
    .maybeSingle();

  if (existing) throw new Error("이미 초대된 멤버입니다");

  const { error } = await supabase.rpc("invite_fridge_member", {
    p_fridge_id: fridgeId,
    p_member_email: email,
    p_member_id: profile.id,
    p_role: role,
  });

  if (error) throw error;

  await supabase.rpc("set_member_fridge", {
    p_member_id: profile.id,
    p_fridge_id: fridgeId,
  });

  await supabase.rpc("set_member_role", { p_member_id: profile.id, p_role: role });
};

export const updateMemberRole = async (
  id: string,
  role: Extract<Role, "editor" | "viewer">,
): Promise<void> => {
  const { data: row } = await supabase
    .from("fridge_members")
    .select("member_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("fridge_members").update({ role }).eq("id", id);
  if (error) throw error;

  if (row?.member_id) {
    await supabase.rpc("set_member_role", { p_member_id: row.member_id, p_role: role });
  }
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

// ─── Shopping Items ───────────────────────────────────────────────────────────

export interface ShoppingItem {
  id: string;
  name: string;
  qty: string;
  checked: boolean;
}

export const getShoppingItems = async (): Promise<ShoppingItem[]> => {
  const { fridgeId } = getStoreIds();
  const { data, error } = await supabase
    .from("shopping_items")
    .select("id, name, qty, checked")
    .eq("fridge_id", fridgeId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as ShoppingItem[];
};

export const addShoppingItem = async (name: string, qty: string): Promise<ShoppingItem> => {
  const { fridgeId } = getStoreIds();
  const { data, error } = await supabase
    .from("shopping_items")
    .insert([{ fridge_id: fridgeId, name, qty, checked: false }])
    .select("id, name, qty, checked")
    .single();
  if (error) throw error;
  return data as ShoppingItem;
};

export const toggleShoppingItem = async (id: string, checked: boolean): Promise<void> => {
  const { error } = await supabase.from("shopping_items").update({ checked }).eq("id", id);
  if (error) throw error;
};

export const deleteShoppingItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from("shopping_items").delete().eq("id", id);
  if (error) throw error;
};

export const clearCheckedShoppingItems = async (): Promise<void> => {
  const { fridgeId } = getStoreIds();
  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("fridge_id", fridgeId)
    .eq("checked", true);
  if (error) throw error;
};

// ─── Recipe Recommendations (TheMealDB) ──────────────────────────────────────

export interface RecipeRecommendation {
  name: string;
  koreanName: string;
  ingredients: string;
  area: string;
  thumbnail: string;
}

async function translate(text: string, from: string, to: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`,
    );
    const data = await res.json();
    return data.responseData?.translatedText ?? text;
  } catch {
    return text;
  }
}

export const getRecipeRecommendations = async (
  ingredients: string[],
): Promise<RecipeRecommendation[]> => {
  if (ingredients.length === 0) return [];

  const englishIngredient = await translate(ingredients[0], "ko", "en");

  const searchRes = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(englishIngredient)}`,
  );
  const searchData = await searchRes.json();
  const meals: { idMeal: string; strMeal: string; strMealThumb: string }[] =
    searchData.meals ?? [];

  if (meals.length === 0) return [];

  const shuffled = [...meals].sort(() => Math.random() - 0.5).slice(0, 3);

  const details = await Promise.all(
    shuffled.map(async (m) => {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`);
      const d = await res.json();
      return d.meals?.[0] ?? null;
    }),
  );

  return Promise.all(
    details.filter(Boolean).map(async (d) => {
      const ings: string[] = [];
      for (let i = 1; i <= 5; i++) {
        const ing = d[`strIngredient${i}`]?.trim();
        if (ing) ings.push(ing);
      }
      const [koreanName, koreanIngredients, koreanArea] = await Promise.all([
        translate(d.strMeal, "en", "ko"),
        translate(ings.join(", "), "en", "ko"),
        d.strArea ? translate(d.strArea, "en", "ko") : Promise.resolve(""),
      ]);
      return {
        name: d.strMeal,
        koreanName,
        ingredients: koreanIngredients,
        area: koreanArea,
        thumbnail: d.strMealThumb ?? "",
      };
    }),
  );
};

// ─── Meal Plans ───────────────────────────────────────────────────────────────

export type MealType = "b" | "l" | "d";

export interface MealPlanRow {
  day: number;       // 0=Mon … 6=Sun
  meal_type: MealType;
  meal_name: string;
  ingredients: string;
}

export const getMealPlans = async (weekStart: string): Promise<MealPlanRow[]> => {
  const { fridgeId } = getStoreIds();
  const { data, error } = await supabase
    .from("meal_plans")
    .select("day, meal_type, meal_name, ingredients")
    .eq("fridge_id", fridgeId)
    .eq("week_start", weekStart);
  if (error) throw error;
  return (data || []) as MealPlanRow[];
};

export const upsertMealPlan = async (
  weekStart: string,
  day: number,
  mealType: MealType,
  mealName: string,
  ingredients = "",
): Promise<void> => {
  const { fridgeId } = getStoreIds();
  const { error } = await supabase.from("meal_plans").upsert(
    { fridge_id: fridgeId, week_start: weekStart, day, meal_type: mealType, meal_name: mealName, ingredients },
    { onConflict: "fridge_id,week_start,day,meal_type" },
  );
  if (error) throw error;
};

export const deleteMealPlan = async (
  weekStart: string,
  day: number,
  mealType: MealType,
): Promise<void> => {
  const { fridgeId } = getStoreIds();
  const { error } = await supabase
    .from("meal_plans")
    .delete()
    .eq("fridge_id", fridgeId)
    .eq("week_start", weekStart)
    .eq("day", day)
    .eq("meal_type", mealType);
  if (error) throw error;
};
