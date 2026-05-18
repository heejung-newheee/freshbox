import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import type { FridgeSettings } from "@/services/api";

const QK = ["fridgeSettings"] as const;

export function useFridgeSettings() {
  return useQuery({
    queryKey: QK,
    queryFn: api.getFridgeSettings,
  });
}

export function useUpdateFridgeSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<FridgeSettings>) => api.updateFridgeSettings(settings),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
