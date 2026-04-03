import { useOutletContext } from "react-router-dom";
import { Dashboard } from "@/pages";

export default function DashboardRoute() {
  const context = useOutletContext<any>();
  return <Dashboard items={context?.items || []} />;
}
