import { useQuery } from "@tanstack/react-query";
import * as api from "@/services/api";

export function useRecipeRecommendations(ingredients: string[]) {
  return useQuery({
    queryKey: ["recipes", ingredients.join(",")],
    queryFn: () => api.getRecipeRecommendations(ingredients),
    enabled: ingredients.length > 0,
    staleTime: 0,
  });
}
