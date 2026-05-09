import type { FoodItem } from "@/@types";
import { FridgeMap } from "@/components/features";

interface FridgeMapPageProps {
  items: FoodItem[];
  onConsume?: (id: string) => void;
}

const TIPS = [
  { icon: "🧊", title: "냉동칸", desc: "육류·해산물은 소분 후 냉동 보관하면 신선도가 오래 유지됩니다." },
  { icon: "🥬", title: "야채칸", desc: "채소는 신문지나 키친타월로 감싸면 수분 유지에 효과적입니다." },
  { icon: "🚪", title: "도어칸", desc: "온도 변화가 잦은 도어칸은 소스류·조미료 보관에 적합합니다." },
];

export function FridgeMapPage({ items, onConsume }: FridgeMapPageProps) {
  return (
    <div className="flex flex-col gap-5">
      <FridgeMap items={items} onConsume={onConsume} />

      {/* TIP Section */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
        <div className="text-[14px] font-bold text-green-800 mb-3.5">💡 냉장고 보관 TIP</div>
        <div className="grid grid-cols-3 gap-3">
          {TIPS.map((tip) => (
            <div key={tip.title} className="bg-white rounded-xl p-3.5 border border-green-100">
              <div className="text-[22px] mb-2">{tip.icon}</div>
              <div className="text-[13px] font-bold text-green-800 mb-1">{tip.title}</div>
              <div className="text-[12px] text-gray-500 leading-relaxed">{tip.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
