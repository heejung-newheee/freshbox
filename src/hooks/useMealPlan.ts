import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import type { MealType } from "@/services/api";

const qk = (weekStart: string) => ["mealPlan", weekStart] as const;

export function useMealPlan(weekStart: string) {
  return useQuery({
    queryKey: qk(weekStart),
    queryFn: () => api.getMealPlans(weekStart),
  });
}

export function useUpsertMeal(weekStart: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ day, mealType, mealName }: { day: number; mealType: MealType; mealName: string }) =>
      api.upsertMealPlan(weekStart, day, mealType, mealName),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk(weekStart) }),
  });
}

export function useDeleteMeal(weekStart: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ day, mealType }: { day: number; mealType: MealType }) =>
      api.deleteMealPlan(weekStart, day, mealType),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk(weekStart) }),
  });
}
