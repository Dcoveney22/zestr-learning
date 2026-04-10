import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const sage = "#01796F";
const cream = "#FAF8F3";
const charcoal = "#1C1C1A";
const muted = "#6B6B60";
const border = "#E8E4DC";
const darkTeal = "#014A43";
const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'DM Sans', system-ui, sans-serif";

export default function RedeemPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState("code");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) setCode(urlCode.toUpperCase());
  }, [searchParams]);

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError("");
    setStep("account");
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error?.includes("already exists")
            ? "An account with this email already exists. Please log in."
            : data.error || "Something went wrong.",
        );
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
              fontFamily: sans,
            }}
          >
            {step === "code" ? "Unlock your bundle" : "Create your account"}
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
            {step === "code" ? "Time to learn." : "Almost there."}
          </h1>
        </div>

        {/* Body */}
        <div style={{ padding: "36px 40px" }}>
          {step === "code" ? (
            <form onSubmit={handleCodeSubmit}>
              <p
                style={{
                  fontSize: "14px",
                  color: muted,
                  fontWeight: 300,
                  lineHeight: 1.7,
                  marginBottom: "28px",
                  textAlign: "center",
                }}
              >
                Enter the access code from your Zest:r redemption email to
                unlock your podcast learning bundle.
              </p>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: muted,
                    marginBottom: "8px",
                  }}
                >
                  Access Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ZESTR-XXXXXX"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: `1.5px solid ${border}`,
                    backgroundColor: cream,
                    fontFamily: "monospace",
                    fontSize: "18px",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textAlign: "center",
                    color: charcoal,
                    outline: "none",
                  }}
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
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "100px",
                  backgroundColor: sage,
                  color: "white",
                  fontFamily: sans,
                  fontSize: "14px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                  marginBottom: "20px",
                }}
              >
                Continue →
              </button>

              <p
                style={{
                  textAlign: "center",
                  fontSize: "13px",
                  color: muted,
                  fontWeight: 300,
                }}
              >
                Already have an account?{" "}
                <a
                  href="/login"
                  style={{
                    color: sage,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Log in
                </a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleAccountSubmit}>
              {/* Code confirmation chip */}
              <div
                style={{
                  backgroundColor: "#F0F9F7",
                  border: "1px solid #C5E8E3",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    color: "#1a5e55",
                    fontWeight: 400,
                  }}
                >
                  Code:{" "}
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
                  style={{
                    fontSize: "12px",
                    color: sage,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Change
                </button>
              </div>

              <p
                style={{
                  fontSize: "14px",
                  color: muted,
                  fontWeight: 300,
                  lineHeight: 1.7,
                  marginBottom: "24px",
                }}
              >
                Create your free account to access your learning bundle and save
                your progress.
              </p>

              {/* Email */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: muted,
                    marginBottom: "8px",
                  }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
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
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: muted,
                    marginBottom: "8px",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  style={{
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
                  }}
                />
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: muted,
                    marginBottom: "8px",
                  }}
                >
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  style={{
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
                  }}
                />
              </div>

              {/* Opt in */}
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "24px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  style={{
                    marginTop: "2px",
                    accentColor: sage,
                    width: "15px",
                    height: "15px",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: muted,
                    fontWeight: 300,
                    lineHeight: 1.6,
                  }}
                >
                  Keep me updated on new learning rewards and experiences from
                  Zest:r
                </span>
              </label>

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
                {loading ? "Creating your account..." : "Start learning →"}
              </button>

              <p
                style={{
                  textAlign: "center",
                  fontSize: "13px",
                  color: muted,
                  fontWeight: 300,
                }}
              >
                Already have an account?{" "}
                <a
                  href="/login"
                  style={{
                    color: sage,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Log in
                </a>
              </p>
            </form>
          )}
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
