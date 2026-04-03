import { useOutletContext } from "react-router-dom";
import { FridgeMapPage } from "@/pages";

export default function FridgeRoute() {
  const context = useOutletContext<any>();
  return (
    <FridgeMapPage
      items={context?.items || []}
      onConsume={context?.markConsumed}
    />
  );
}
