import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const s = {
  sage: "#01796F",
  cream: "#FAF8F3",
  charcoal: "#1C1C1A",
  muted: "#6B6B60",
  border: "#E8E4DC",
  serif: { fontFamily: "'Cormorant Garamond', Georgia, serif" },
  sans: { fontFamily: "'DM Sans', system-ui, sans-serif" },
};

export default function RedeemPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState("code"); // "code" | "account"
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voucherInfo, setVoucherInfo] = useState(null);

  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) setCode(urlCode.toUpperCase());
  }, [searchParams]);

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setStep("account");
    setError("");
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes("already exists")) {
          setError(
            "An account with this email already exists. Please log in instead.",
          );
        } else {
          setError(data.error || "Something went wrong.");
        }
        return;
      }

      localStorage.setItem("learning_token", data.token);
      localStorage.setItem("learning_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: s.cream,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
      }}
    >
      {/* Logo */}
      <div className="mb-10 text-center">
        <img
          src="https://zestr.co.uk/zestr-logo-new.png"
          alt="Zest:r"
          style={{ height: "32px", margin: "0 auto 8px" }}
        />
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: s.muted, ...s.sans }}
        >
          Learning
        </p>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "448px",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          border: `1px solid ${s.border}`,
          backgroundColor: "white",
        }}
      >
        {/* Header */}
        <div
          className="px-8 pt-8 pb-6 text-center"
          style={{ backgroundColor: "#014A43" }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: "rgba(255,255,255,0.55)", ...s.sans }}
          >
            {step === "code" ? "Unlock your bundle" : "Create your account"}
          </p>
          <h1 className="text-3xl font-light text-white" style={s.serif}>
            {step === "code" ? "Time to learn." : "Almost there."}
          </h1>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          {step === "code" ? (
            <form onSubmit={handleCodeSubmit}>
              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ color: s.muted, ...s.sans, fontWeight: 300 }}
              >
                Enter the access code from your Zest:r redemption email to
                unlock your podcast learning bundle.
              </p>

              <div className="mb-6">
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: s.muted, ...s.sans }}
                >
                  Access Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ZESTR-XXXXXX"
                  required
                  className="w-full px-4 py-3 rounded-xl text-center font-bold tracking-widest"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "18px",
                    border: `1.5px solid ${s.border}`,
                    backgroundColor: "#FAF8F3",
                    color: s.charcoal,
                    outline: "none",
                  }}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-all"
                style={{ backgroundColor: s.sage, ...s.sans }}
              >
                Continue →
              </button>

              <p
                className="text-center text-xs mt-4"
                style={{ color: s.muted }}
              >
                Already have an account?{" "}
                <a href="/login" style={{ color: s.sage, fontWeight: 500 }}>
                  Log in
                </a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleAccountSubmit}>
              <div
                className="rounded-xl px-4 py-3 mb-6 text-sm"
                style={{
                  backgroundColor: "#F0F9F7",
                  border: `1px solid #C5E8E3`,
                }}
              >
                <p style={{ color: "#1a5e55", fontWeight: 400 }}>
                  Access code:{" "}
                  <strong
                    style={{ fontFamily: "monospace", letterSpacing: "0.1em" }}
                  >
                    {code}
                  </strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep("code");
                    setError("");
                  }}
                  className="text-xs mt-1"
                  style={{ color: s.sage }}
                >
                  Change code
                </button>
              </div>

              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ color: s.muted, fontWeight: 300 }}
              >
                Create your free account to access your learning bundle. We'll
                use your email to save your progress.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: s.muted }}
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{
                      border: `1.5px solid ${s.border}`,
                      backgroundColor: "#FAF8F3",
                      color: s.charcoal,
                      outline: "none",
                      fontWeight: 300,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: s.muted }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{
                      border: `1.5px solid ${s.border}`,
                      backgroundColor: "#FAF8F3",
                      color: s.charcoal,
                      outline: "none",
                      fontWeight: 300,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: s.muted }}
                  >
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{
                      border: `1.5px solid ${s.border}`,
                      backgroundColor: "#FAF8F3",
                      color: s.charcoal,
                      outline: "none",
                      fontWeight: 300,
                    }}
                  />
                </div>
              </div>

              {/* Opt in */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  className="mt-0.5 flex-shrink-0"
                  style={{ accentColor: s.sage, width: "16px", height: "16px" }}
                />
                <span
                  className="text-xs leading-relaxed"
                  style={{ color: s.muted, fontWeight: 300 }}
                >
                  Keep me updated on new learning rewards and experiences from
                  Zest:r
                </span>
              </label>

              {error && (
                <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-all"
                style={{
                  backgroundColor: loading ? "#9CA3AF" : s.sage,
                  cursor: loading ? "not-allowed" : "pointer",
                  ...s.sans,
                }}
              >
                {loading ? "Creating your account..." : "Start learning →"}
              </button>

              <p
                className="text-center text-xs mt-4"
                style={{ color: s.muted }}
              >
                Already have an account?{" "}
                <a href="/login" style={{ color: s.sage, fontWeight: 500 }}>
                  Log in
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      <p className="text-xs text-center mt-6" style={{ color: "#AEAAA0" }}>
        Zest:r · david@zestr.co.uk
      </p>
    </div>
  );
}
