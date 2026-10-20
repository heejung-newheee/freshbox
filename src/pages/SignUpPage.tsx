import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { IconLeaf } from "@/components/ui/icons";
import { Button, Input } from "@/components/ui";

export function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const signUp = useAuthStore((s) => s.signUp);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다");
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(email, password, name.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setDone(true);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200 mb-3">
            <IconLeaf size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            FreshBox
          </h1>
          <p className="text-[13px] text-gray-400 mt-1">
            스마트 냉장고 관리 서비스
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-7 shadow-sm">
          {done ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 text-2xl">
                ✉️
              </div>
              {/* <h2 className="text-[16px] font-bold text-stone-900 mb-2">이메일을 확인하세요</h2> */}
              <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
                {/* {email}로 확인 링크를 보냈습니다.<br /> */}
                {/* 이메일을 확인한 후 로그인하세요. */}
                가입을 축하드립니다.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="w-full"
              >
                로그인으로 이동
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-[18px] font-bold text-stone-900 mb-1">
                회원가입
              </h2>
              <p className="text-[12px] text-gray-400 mb-6">
                새 계정을 만들어 시작하세요
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                    이름
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름"
                    autoComplete="name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                    이메일
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일 주소"
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                    비밀번호
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호 (6자 이상)"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                    비밀번호 확인
                  </label>
                  <Input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="비밀번호 재입력"
                    autoComplete="new-password"
                    required
                  />
                </div>

                {error && (
                  <div className="px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1"
                >
                  {loading ? "가입 중..." : "회원가입"}
                </Button>
              </form>
            </>
          )}
        </div>

        {!done && (
          <p className="text-center text-[13px] text-gray-400 mt-5">
            이미 계정이 있으신가요?{" "}
            <Link
              to="/login"
              className="text-emerald-600 font-semibold hover:underline"
            >
              로그인
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
