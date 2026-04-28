import { useOutletContext } from "react-router-dom";
import { Inventory } from "@/pages";

export default function InventoryRoute() {
  const context = useOutletContext<any>();
  return (
    <Inventory
      items={context?.items || []}
      onConsume={context?.markConsumed}
      onAddItem={context?.onAddItem}
    />
  );
}
