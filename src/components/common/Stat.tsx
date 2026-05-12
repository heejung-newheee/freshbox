interface StatProps {
  icon: string;
  value: number | string;
  label: string;
  sublabel?: string;
}

export function Stat({ icon, value, label, sublabel }: StatProps) {
  return (
    <div className="flex-1 p-5 rounded-xl bg-gray-50 border border-gray-200 text-center">
      <div className="text-[32px] mb-2">{icon}</div>
      <div className="text-[28px] font-bold mb-1">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
      {sublabel && (
        <div className="text-[11px] text-gray-400 mt-0.5">{sublabel}</div>
      )}
    </div>
  );
}
