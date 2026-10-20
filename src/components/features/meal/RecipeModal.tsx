import type { RecipeRecommendation } from "@/services/api";

export function RecipeModal({
  recipe,
  onClose,
}: {
  recipe: RecipeRecommendation;
  onClose: () => void;
}) {
  return (
    <div data-modal
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
      >
        {/* Sticky header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <h2 className="text-[16px] font-extrabold text-stone-900 truncate">
              {recipe.koreanName}
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5 truncate">
              {recipe.name}
              {recipe.area && ` · ${recipe.area}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-[16px] shrink-0 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {recipe.thumbnail && (
            <img
              src={recipe.thumbnail}
              alt={recipe.name}
              className="w-full h-44 object-cover"
            />
          )}
          <div className="p-6 flex flex-col gap-4">
            {recipe.fullIngredients.length > 0 && (
              <div>
                <h3 className="text-[13px] font-bold text-stone-700 mb-2">
                  재료
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  {recipe.fullIngredients.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-[12px] text-gray-600"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="font-medium">{item.ingredient}</span>
                      {item.measure && (
                        <span className="text-gray-400">{item.measure}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recipe.instructions && (
              <div>
                <h3 className="text-[13px] font-bold text-stone-700 mb-2">
                  만드는 법
                </h3>
                <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-line">
                  {recipe.instructions}
                </p>
              </div>
            )}

            {recipe.youtube && (
              <a
                href={recipe.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-9.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-colors"
              >
                ▶ YouTube에서 보기
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
