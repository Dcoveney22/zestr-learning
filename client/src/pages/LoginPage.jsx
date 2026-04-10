import { useState } from "react";
import { useNavigate } from "react-router-dom";

const s = {
  sage: "#01796F",
  cream: "#FAF8F3",
  charcoal: "#1C1C1A",
  muted: "#6B6B60",
  border: "#E8E4DC",
  serif: { fontFamily: "'Cormorant Garamond', Georgia, serif" },
  sans: { fontFamily: "'DM Sans', system-ui, sans-serif" },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
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
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: s.cream }}
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
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-lg"
        style={{ border: `1px solid ${s.border}`, backgroundColor: "white" }}
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
            Welcome back
          </p>
          <h1 className="text-3xl font-light text-white" style={s.serif}>
            Continue learning.
          </h1>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: s.muted, ...s.sans }}
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
                  style={{ color: s.muted, ...s.sans }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
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

            {error && (
              <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-all mb-4"
              style={{
                backgroundColor: loading ? "#9CA3AF" : s.sage,
                cursor: loading ? "not-allowed" : "pointer",
                ...s.sans,
              }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>

            <p className="text-center text-xs" style={{ color: s.muted }}>
              Have a new access code?{" "}
              <a href="/redeem" style={{ color: s.sage, fontWeight: 500 }}>
                Redeem it here
              </a>
            </p>
          </form>
        </div>
      </div>

      <p className="text-xs text-center mt-6" style={{ color: "#AEAAA0" }}>
        Zest:r · david@zestr.co.uk
      </p>
    </div>
  );
}
