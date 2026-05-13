import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { IconLeaf } from "@/components/ui/icons";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      navigate("/", { replace: true });
    }
  };

  const inputCls =
    "w-full px-4 py-3 border border-gray-200 rounded-xl text-[14px] text-gray-800 bg-gray-50 outline-none focus:border-emerald-400 focus:bg-white transition-colors";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200 mb-3">
            <IconLeaf size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">FreshBox</h1>
          <p className="text-[13px] text-gray-400 mt-1">스마트 냉장고 관리 서비스</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
          <h2 className="text-[18px] font-bold text-stone-900 mb-1">로그인</h2>
          <p className="text-[12px] text-gray-400 mb-6">계정에 로그인하여 시작하세요</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소"
                className={inputCls}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                className={inputCls}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl text-[14px] font-bold border-none cursor-pointer hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-1"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-gray-400 mt-5">
          계정이 없으신가요?{" "}
          <Link to="/signup" className="text-emerald-600 font-semibold hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
