import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const sage = "#01796F";
const cream = "#FAF8F3";
const charcoal = "#1C1C1A";
const muted = "#6B6B60";
const border = "#E8E4DC";
const darkTeal = "#014A43";
const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'DM Sans', system-ui, sans-serif";
const AY_LOGO =
  "https://cdn.prod.website-files.com/6203efcd8b7ad046a53f6d0c/621e1dec28ca81b27c59877f_AY%20Site%20Logo%20Cropped.png";

const BUNDLE_CONTENT = {
  "stay-sharp-on-shift-30": {
    title: "Stay Sharp on Shift",
    subtitle: "Podcast learning for hospitality professionals",
    description:
      "Short, practical audio lessons built for people on shift. Covering mental resilience, handling difficult conversations, building confidence under pressure, and simple wellbeing habits that actually stick. No screens needed — just real, useful tools for real working life.",
    color: "#2D6A4F",
    episodes: [
      {
        slug: "ssos-01",
        title: "Episode 1",
        description: "Coming soon",
        duration: "~8 mins",
        audio_url: null,
      },
    ],
  },
  "stay-sharp-on-shift-90": {
    title: "Stay Sharp on Shift",
    subtitle: "Podcast learning for hospitality professionals",
    description:
      "Short, practical audio lessons built for people on shift. Covering mental resilience, handling difficult conversations, building confidence under pressure, and simple wellbeing habits that actually stick. No screens needed — just real, useful tools for real working life.",
    color: "#2D6A4F",
    episodes: [
      {
        slug: "ssos-01",
        title: "Episode 1",
        description: "Coming soon",
        duration: "~8 mins",
        audio_url: null,
      },
    ],
  },
  "leadership-sprint-30": {
    title: "Leadership Sprint",
    subtitle: "CPD-accredited audio lessons, built around shift work",
    description:
      "Leadership is not just for managers. This bundle gives you the tools to lead from wherever you are — handling pressure, communicating with confidence, motivating a team, and thinking strategically even on a busy shift. CPD-accredited and built for hospitality.",
    color: "#1B4965",
    episodes: [
      {
        slug: "ls-01",
        title: "Episode 1",
        description: "Coming soon",
        duration: "~8 mins",
        audio_url: null,
      },
    ],
  },
  "leadership-sprint-90": {
    title: "Leadership Sprint",
    subtitle: "CPD-accredited audio lessons, built around shift work",
    description:
      "Leadership is not just for managers. This bundle gives you the tools to lead from wherever you are — handling pressure, communicating with confidence, motivating a team, and thinking strategically even on a busy shift. CPD-accredited and built for hospitality.",
    color: "#1B4965",
    episodes: [
      {
        slug: "ls-01",
        title: "Episode 1",
        description: "Coming soon",
        duration: "~8 mins",
        audio_url: null,
      },
    ],
  },
};

function ProgressRing({ progress, total, size = 80 }) {
  const pct = total === 0 ? 0 : Math.round((progress / total) * 100);
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const cx = size / 2;
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="5"
        />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1,
            fontFamily: sans,
          }}
        >
          {pct}%
        </span>
        <span
          style={{
            fontSize: "9px",
            color: "rgba(255,255,255,0.6)",
            fontWeight: 500,
            marginTop: "2px",
          }}
        >
          done
        </span>
      </div>
    </div>
  );
}

function AddBundleModal({ onClose, onSuccess }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("learning_token");
      const res = await fetch("/api/bundles/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      onSuccess(data.bundle);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "24px",
          overflow: "hidden",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: darkTeal,
            padding: "28px 32px 24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              margin: "0 0 8px",
            }}
          >
            Add a bundle
          </p>
          <h2
            style={{
              fontFamily: serif,
              fontSize: "1.75rem",
              fontWeight: 300,
              color: "white",
              margin: 0,
            }}
          >
            Got a new code?
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px" }}>
          <p
            style={{
              fontSize: "14px",
              color: muted,
              fontWeight: 300,
              lineHeight: 1.6,
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            Enter your new access code to add another learning bundle to your
            account.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
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
                autoFocus
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
                marginBottom: "12px",
              }}
            >
              {loading ? "Adding bundle..." : "Add bundle →"}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "100px",
                backgroundColor: "transparent",
                color: muted,
                fontFamily: sans,
                fontSize: "13px",
                fontWeight: 400,
                border: `1px solid ${border}`,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function BundleCard({ bundle, onOpen }) {
  const content = BUNDLE_CONTENT[bundle.experience_slug] || null;
  const episodes = content?.episodes || [];
  const heroBg = content?.color || darkTeal;
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div
      onClick={() => onOpen(bundle)}
      style={{
        borderRadius: "20px",
        overflow: "hidden",
        border: `1px solid ${border}`,
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${heroBg} 0%, ${darkTeal} 100%)`,
          padding: "24px 24px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "10px",
            lineHeight: 1,
          }}
        >
          <img
            src={AY_LOGO}
            alt="Assemble You"
            style={{
              height: "16px",
              width: "auto",
              filter: "brightness(0) invert(1)",
              display: "block",
              flexShrink: 0,
            }}
          />

          <span
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "10px",
              lineHeight: 1,
              display: "block",
            }}
          >
            ·
          </span>

          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1,
              display: "block",
            }}
          >
            Podcast Learning
          </span>
        </div>
        <h3
          style={{
            fontFamily: serif,
            fontSize: "1.5rem",
            fontWeight: 300,
            color: "white",
            margin: "0 0 4px",
            lineHeight: 1.2,
          }}
        >
          {content?.title || bundle.experience_name}
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.6)",
            margin: 0,
            fontWeight: 300,
          }}
        >
          {content?.subtitle}
        </p>
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div>
            <p
              style={{
                fontSize: "11px",
                color: muted,
                fontWeight: 300,
                margin: "0 0 2px",
              }}
            >
              Episodes
            </p>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: charcoal,
                margin: 0,
              }}
            >
              {episodes.length}
            </p>
          </div>
          <div
            style={{ width: "1px", height: "28px", backgroundColor: border }}
          />
          <div>
            <p
              style={{
                fontSize: "11px",
                color: muted,
                fontWeight: 300,
                margin: "0 0 2px",
              }}
            >
              Expires
            </p>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: bundle.is_expired ? "#DC2626" : charcoal,
                margin: 0,
              }}
            >
              {bundle.is_expired ? "Expired" : formatDate(bundle.expires_at)}
            </p>
          </div>
          {!bundle.is_expired && (
            <>
              <div
                style={{
                  width: "1px",
                  height: "28px",
                  backgroundColor: border,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    color: muted,
                    fontWeight: 300,
                    margin: "0 0 2px",
                  }}
                >
                  Days left
                </p>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: sage,
                    margin: 0,
                  }}
                >
                  {bundle.days_remaining}
                </p>
              </div>
            </>
          )}
        </div>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#F0F9F7",
            border: "1px solid #C5E8E3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={sage}
            strokeWidth="2.5"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function BundleDetail({ bundle, onBack, showBack, navigate }) {
  const [progress, setProgress] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const content = BUNDLE_CONTENT[bundle.experience_slug] || null;
  const episodes = content?.episodes || [];
  const heroBg = content?.color || darkTeal;
  const listenedCount = episodes.filter((e) =>
    progress.includes(e.slug),
  ).length;
  const isExpired = bundle.is_expired;
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  useEffect(() => {
    const token = localStorage.getItem("learning_token");
    fetch(`/api/bundle/${bundle.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setProgress(data.progress || []))
      .catch(() => {})
      .finally(() => setLoadingProgress(false));
  }, [bundle.id]);

  return (
    <div>
      {/* Back button */}
      {showBack && (
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: muted,
            fontWeight: 400,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: sans,
            marginBottom: "20px",
            padding: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          All bundles
        </button>
      )}

      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${heroBg} 0%, ${darkTeal} 100%)`,
          borderRadius: "20px",
          padding: "32px 28px",
          marginBottom: "20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30px",
            right: "-30px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "-10px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.12)",
            borderRadius: "100px",
            padding: "4px 12px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "0",
              lineHeight: 1,
            }}
          >
            <img
              src={AY_LOGO}
              alt="Assemble You"
              style={{
                height: "16px",
                opacity: 0.9,
                filter: "brightness(0) invert(1)",
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Podcast Learning
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontFamily: serif,
                fontWeight: 300,
                color: "white",
                fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
                lineHeight: 1.15,
                margin: "0 0 6px",
              }}
            >
              {content?.title || bundle.experience_name}
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 300,
                margin: 0,
              }}
            >
              {content?.subtitle}
            </p>
          </div>
          <ProgressRing progress={listenedCount} total={episodes.length} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>
              {listenedCount}/{episodes.length}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.6)",
                fontWeight: 300,
              }}
            >
              episodes
            </span>
          </div>
          {!isExpired && (
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{ fontSize: "16px", fontWeight: 700, color: "white" }}
              >
                {bundle.days_remaining}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 300,
                }}
              >
                days left · expires {formatDate(bundle.expires_at)}
              </span>
            </div>
          )}
          {isExpired && (
            <div
              style={{
                backgroundColor: "rgba(205,92,92,0.25)",
                borderRadius: "10px",
                padding: "8px 14px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 500,
                }}
              >
                Expired {formatDate(bundle.expires_at)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div
        style={{
          backgroundColor: "white",
          border: `1px solid ${border}`,
          borderRadius: "20px",
          padding: "24px 28px",
          marginBottom: "20px",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: muted,
            margin: "0 0 12px",
          }}
        >
          About this bundle
        </p>
        <p
          style={{
            fontSize: "14px",
            color: muted,
            fontWeight: 300,
            lineHeight: 1.75,
            margin: 0,
            textAlign: "left",
          }}
        >
          {content?.description}
        </p>
      </div>

      {/* Episodes */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: muted,
              margin: 0,
            }}
          >
            Episodes · {episodes.length} total
          </p>
          {listenedCount === episodes.length && episodes.length > 0 && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: sage,
                backgroundColor: "#F0F9F7",
                border: "1px solid #C5E8E3",
                padding: "3px 10px",
                borderRadius: "100px",
              }}
            >
              ✓ Bundle complete
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {episodes.map((ep, i) => {
            const listened = progress.includes(ep.slug);
            const available = !!ep.audio_url;
            return (
              <div
                key={ep.slug}
                onClick={() =>
                  available &&
                  !isExpired &&
                  navigate(`/listen/${ep.slug}?bundleId=${bundle.id}`)
                }
                style={{
                  backgroundColor: "white",
                  border: `1px solid ${listened ? "#A7D9D3" : border}`,
                  borderRadius: "16px",
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  cursor: available && !isExpired ? "pointer" : "default",
                  opacity: isExpired ? 0.5 : 1,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (available && !isExpired) {
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: listened
                      ? `linear-gradient(135deg, ${sage}, #019A8E)`
                      : "#F5F5F2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "15px",
                    fontWeight: 700,
                    color: listened ? "white" : muted,
                    boxShadow: listened
                      ? "0 2px 8px rgba(1,121,111,0.25)"
                      : "none",
                  }}
                >
                  {listened ? "✓" : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      color: charcoal,
                      margin: "0 0 3px",
                    }}
                  >
                    {ep.title}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: muted,
                      fontWeight: 300,
                      margin: 0,
                    }}
                  >
                    {ep.description} · {ep.duration}
                  </p>
                </div>
                {available && !isExpired ? (
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: listened
                        ? "#F0F9F7"
                        : `linear-gradient(135deg, ${sage}, #019A8E)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: listened
                        ? "none"
                        : "0 2px 8px rgba(1,121,111,0.3)",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill={listened ? sage : "white"}
                      style={{ marginLeft: listened ? 0 : "2px" }}
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: "11px",
                      color: muted,
                      fontWeight: 500,
                      backgroundColor: "#F5F5F2",
                      padding: "5px 12px",
                      borderRadius: "100px",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Coming soon
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    const token = localStorage.getItem("learning_token");
    try {
      const res = await fetch("/api/bundles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("learning_token");
        localStorage.removeItem("learning_user");
        navigate("/login");
        return;
      }
      const data = await res.json();
      const bundleList = Array.isArray(data) ? data : [];
      setBundles(bundleList);
      if (bundleList.length === 1) setSelectedBundle(bundleList[0]);
    } catch {
      setError("Failed to load your bundles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBundleAdded = (newBundle) => {
    setShowAddModal(false);
    loadBundles(); // refresh the list
  };

  const handleLogout = () => {
    localStorage.removeItem("learning_token");
    localStorage.removeItem("learning_user");
    navigate("/login");
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: cream,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: `2px solid ${sage}`,
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p
            style={{
              fontSize: "14px",
              color: muted,
              fontFamily: sans,
              fontWeight: 300,
            }}
          >
            Loading your bundles...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: cream,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "14px",
              color: "#DC2626",
              marginBottom: "16px",
              fontFamily: sans,
            }}
          >
            {error}
          </p>
          <button
            onClick={loadBundles}
            style={{
              fontSize: "14px",
              color: sage,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: cream, fontFamily: sans }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "white",
          borderBottom: `1px solid ${border}`,
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="https://www.zestr.app/zestr-logo-new.png"
            alt="Zest:r"
            style={{ height: "24px" }}
          />
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: sage,
              backgroundColor: "#F0F9F7",
              padding: "3px 10px",
              borderRadius: "100px",
              border: "1px solid #C5E8E3",
            }}
          >
            Learning
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              fontSize: "12px",
              color: sage,
              fontWeight: 600,
              background: "none",
              border: `1px solid #C5E8E3`,
              backgroundColor: "#F0F9F7",
              borderRadius: "100px",
              padding: "6px 14px",
              cursor: "pointer",
              fontFamily: sans,
            }}
          >
            + Add bundle
          </button>
          <button
            onClick={handleLogout}
            style={{
              fontSize: "12px",
              color: muted,
              fontWeight: 400,
              background: "none",
              border: `1px solid ${border}`,
              borderRadius: "100px",
              padding: "6px 14px",
              cursor: "pointer",
              fontFamily: sans,
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "32px 24px 64px",
        }}
      >
        {selectedBundle ? (
          <BundleDetail
            bundle={selectedBundle}
            onBack={() => setSelectedBundle(null)}
            showBack={bundles.length > 1}
            navigate={navigate}
          />
        ) : (
          <>
            <div style={{ marginBottom: "28px" }}>
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: muted,
                  margin: "0 0 8px",
                }}
              >
                Your learning
              </p>
              <h1
                style={{
                  fontFamily: serif,
                  fontSize: "2rem",
                  fontWeight: 300,
                  color: charcoal,
                  margin: 0,
                }}
              >
                {bundles.length === 1
                  ? "Your bundle"
                  : `${bundles.length} bundles unlocked`}
              </h1>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginBottom: "32px",
              }}
            >
              {bundles.map((bundle) => (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  onOpen={setSelectedBundle}
                />
              ))}
            </div>
          </>
        )}

        {/* Assemble You co-brand */}
        <div
          style={{
            backgroundColor: "white",
            border: `1px solid ${border}`,
            borderRadius: "20px",
            overflow: "hidden",
            marginTop: "24px",
          }}
        >
          <div
            style={{
              backgroundColor: "#F3F6FF",
              borderBottom: `1px solid ${border}`,
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: muted,
                margin: 0,
              }}
            >
              Content partner
            </p>
            <div
              style={{
                backgroundColor: "#3A3A38",
                padding: "4px 10px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={AY_LOGO}
                alt="Assemble You"
                style={{ height: "28px", opacity: 1 }}
              />
            </div>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: charcoal,
                margin: "0 0 6px",
              }}
            >
              Award-winning podcast-style learning
            </p>
            <p
              style={{
                fontSize: "13px",
                color: muted,
                fontWeight: 300,
                lineHeight: 1.6,
                margin: "0 0 16px",
              }}
            >
              Your learning bundle is created by Assemble You — used by over 500
              organisations including the NHS, Clermont Hotel Group, and Warner
              Hotels. CPD-accredited, audio-first, and built for real life.
            </p>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {[
                { stat: "85%", label: "say it changed how they think or work" },
                { stat: "94%", label: "want more audio learning like this" },
                { stat: "500+", label: "organisations trust Assemble You" },
              ].map(({ stat, label }) => (
                <div key={stat}>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: sage,
                      margin: "0 0 2px",
                    }}
                  >
                    {stat}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: muted,
                      fontWeight: 300,
                      margin: 0,
                      maxWidth: "120px",
                      lineHeight: 1.4,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: `1px solid ${border}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "12px", color: "#AEAAA0", margin: 0 }}>
            Questions?{" "}
            <a
              href="mailto:david@zestr.co.uk"
              style={{ color: sage, textDecoration: "none", fontWeight: 500 }}
            >
              david@zestr.co.uk
            </a>
          </p>
        </div>
      </div>

      {/* Add bundle modal */}
      {showAddModal && (
        <AddBundleModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleBundleAdded}
        />
      )}
    </div>
  );
}
