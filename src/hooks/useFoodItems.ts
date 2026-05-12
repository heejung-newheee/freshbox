import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import type { FoodItem } from "@/@types";

const QUERY_KEY = ["foodItems"] as const;

export function useFoodItems() {
  const { data: items = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: api.getFoodItems,
  });

  return { items, isLoading, isError, refetch, isFetching };
}

export function useConsumeItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.markFoodItemConsumed,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useAddItem(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: Omit<FoodItem, "id" | "consumed">) => api.addFoodItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      onSuccess?.();
    },
  });
}
