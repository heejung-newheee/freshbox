import { useState } from "react";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import type { AppNotification } from "@/services/api";

const QK = ["notifications"] as const;

export function useNotifications() {
  // 재고가 바뀌면(추가/소비) 알림도 다시 계산
  const { dataUpdatedAt } = useQuery({ queryKey: ["foodItems"], queryFn: api.getFoodItems });
  return useQuery({
    queryKey: [...QK, dataUpdatedAt],
    queryFn: api.getNotifications,
    placeholderData: keepPreviousData,
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markNotificationsRead,
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueriesData<AppNotification[]>({ queryKey: QK });
      qc.setQueriesData<AppNotification[]>({ queryKey: QK }, (old = []) =>
        old.filter((n) => !ids.includes(n.id)),
      );
      return { prev };
    },
    onError: (_err, _ids, ctx) => {
      ctx?.prev.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

// ─── Push ─────────────────────────────────────────────────────────────────────

const pushSupported =
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

const PUSH_QK = ["pushEnabled"] as const;

export function usePushSetting() {
  const qc = useQueryClient();
  const [pending, setPending] = useState(false);
  // 한 번 확인한 구독 상태는 캐시해 두어 모달을 다시 열 때 토글이 움직이지 않게 함
  const { data: enabled = false, isPending: loading } = useQuery({
    queryKey: PUSH_QK,
    queryFn: async () => {
      if (!pushSupported) return false;
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      return !!sub && Notification.permission === "granted";
    },
    staleTime: Infinity,
  });
  const setEnabled = (v: boolean) => qc.setQueryData(PUSH_QK, v);

  const toggle = async () => {
    setPending(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const current = await reg.pushManager.getSubscription();
      if (enabled) {
        if (current) {
          await api.deletePushSubscription(current.endpoint);
          await current.unsubscribe();
        }
        setEnabled(false);
        return;
      }
      if ((await Notification.requestPermission()) !== "granted") {
        alert("브라우저 설정에서 알림 권한을 허용해주세요.");
        return;
      }
      const sub =
        current ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
        }));
      await api.savePushSubscription(sub.toJSON());
      setEnabled(true);
    } catch {
      alert("알림 설정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setPending(false);
    }
  };

  return { supported: pushSupported, enabled, loading, pending, toggle };
}
