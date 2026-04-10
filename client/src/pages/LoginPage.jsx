import { useState } from "react";
import { useNavigate } from "react-router-dom";

const sage = "#01796F";
const cream = "#FAF8F3";
const charcoal = "#1C1C1A";
const muted = "#6B6B60";
const border = "#E8E4DC";
const darkTeal = "#014A43";
const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'DM Sans', system-ui, sans-serif";

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

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: `1.5px solid ${border}`,
    backgroundColor: cream,
    fontFamily: sans,
    fontSize: "14px",
    fontWeight: 300,
    color: charcoal,
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: muted,
    marginBottom: "8px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: cream,
        fontFamily: sans,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <img
          src="https://zestr.co.uk/zestr-logo-new.png"
          alt="Zest:r"
          style={{ height: "30px", display: "block", margin: "0 auto 8px" }}
        />
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: muted,
            fontWeight: 500,
          }}
        >
          Learning
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "white",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          border: `1px solid ${border}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: darkTeal,
            padding: "36px 40px 32px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              fontWeight: 600,
              marginBottom: "10px",
            }}
          >
            Welcome back
          </p>
          <h1
            style={{
              fontFamily: serif,
              fontSize: "36px",
              fontWeight: 300,
              color: "white",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Continue learning.
          </h1>
        </div>

        {/* Body */}
        <div style={{ padding: "36px 40px" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                style={inputStyle}
              />
            </div>

            {error && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#DC2626",
                  marginBottom: "16px",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "100px",
                backgroundColor: loading ? "#9CA3AF" : sage,
                color: "white",
                fontFamily: sans,
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.01em",
                marginBottom: "20px",
              }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>

            <p
              style={{
                textAlign: "center",
                fontSize: "13px",
                color: muted,
                fontWeight: 300,
              }}
            >
              Have a new access code?{" "}
              <a
                href="/redeem"
                style={{ color: sage, fontWeight: 500, textDecoration: "none" }}
              >
                Redeem it here
              </a>
            </p>
          </form>
        </div>
      </div>

      <p
        style={{
          fontSize: "12px",
          color: "#AEAAA0",
          marginTop: "24px",
          textAlign: "center",
        }}
      >
        Zest:r · david@zestr.co.uk
      </p>
    </div>
  );
}
