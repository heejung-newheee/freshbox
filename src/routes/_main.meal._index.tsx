import { useOutletContext } from "react-router-dom";
import type { FoodItem } from "@/@types";
import { MealPlanner } from "@/pages";

interface OutletCtx {
  items: FoodItem[];
}

export default function MealRoute() {
  const { items = [] } = useOutletContext<OutletCtx>();
  return <MealPlanner items={items} />;
}
