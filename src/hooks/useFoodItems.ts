import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import type { FoodItem, Location, Zone } from "@/@types";

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

export function useUpdateItem(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, item }: { id: string; item: Omit<FoodItem, "id" | "consumed"> }) =>
      api.updateFoodItem(id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      onSuccess?.();
    },
  });
}

export function useMoveItemZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, location, zone }: { id: string; location: Location; zone: Zone | undefined }) =>
      api.moveItemZone(id, location, zone),
    onMutate: async ({ id, location, zone }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData<FoodItem[]>(QUERY_KEY);
      qc.setQueryData<FoodItem[]>(QUERY_KEY, (old = []) =>
        old.map((item) => item.id === id ? { ...item, location, zone } : item),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEY, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
