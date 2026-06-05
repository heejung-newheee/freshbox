import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";

const QK = ["mealNotes"] as const;

export function useMealNotes() {
  return useQuery({ queryKey: QK, queryFn: api.getMealNotes });
}

export function useUpdateMealNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateMealNotes,
    onMutate: async (notes) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData(QK);
      qc.setQueryData(QK, notes);
      return { prev };
    },
    onError: (_err, _notes, ctx) => {
      if (ctx) qc.setQueryData(QK, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
