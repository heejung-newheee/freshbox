import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";

const QK = ["shoppingItems"] as const;

export function useShoppingItems() {
  return useQuery({ queryKey: QK, queryFn: api.getShoppingItems });
}

export function useAddShoppingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, qty }: { name: string; qty: string }) => api.addShoppingItem(name, qty),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useToggleShoppingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
      api.toggleShoppingItem(id, checked),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useDeleteShoppingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteShoppingItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useClearCheckedItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.clearCheckedShoppingItems,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
