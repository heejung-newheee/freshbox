export function SegmentedControl<T extends string | boolean>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      className={`inline-flex shrink-0 bg-gray-100 rounded-lg p-0.5 ${disabled ? "opacity-50" : ""}`}
    >
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-colors ${
            value === o.value
              ? "bg-white text-stone-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
