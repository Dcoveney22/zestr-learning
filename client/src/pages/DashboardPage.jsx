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

function ProgressRing({ progress, total }) {
  const pct = total === 0 ? 0 : Math.round((progress / total) * 100);
  const r = 32;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div
      style={{
        position: "relative",
        width: "80px",
        height: "80px",
        flexShrink: 0,
      }}
    >
      <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="5"
        />
        <circle
          cx="40"
          cy="40"
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
            fontSize: "18px",
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
            letterSpacing: "0.05em",
            marginTop: "2px",
          }}
        >
          done
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBundle();
  }, []);

  const loadBundle = async () => {
    const token = localStorage.getItem("learning_token");
    try {
      const res = await fetch("/api/bundle", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("learning_token");
        localStorage.removeItem("learning_user");
        navigate("/login");
        return;
      }
      const data = await res.json();
      setBundle(data);
    } catch {
      setError("Failed to load your bundle. Please try again.");
    } finally {
      setLoading(false);
    }
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
            Loading your bundle...
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
            onClick={loadBundle}
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

  const content = BUNDLE_CONTENT[bundle?.experience?.slug] || null;
  const episodes = content?.episodes || [];
  const listenedSlugs = bundle?.progress || [];
  const listenedCount = episodes.filter((e) =>
    listenedSlugs.includes(e.slug),
  ).length;
  const expiresAt = bundle?.user?.expires_at
    ? new Date(bundle.user.expires_at)
    : null;
  const daysRemaining = bundle?.user?.days_remaining ?? 0;
  const isExpired = bundle?.user?.is_expired;
  const formatDate = (d) =>
    d?.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const heroBg = content?.color || darkTeal;

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
            src="https://zestr.co.uk/zestr-logo-new.png"
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
      </nav>

      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${heroBg} 0%, ${darkTeal} 100%)`,
          padding: "48px 24px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-20px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        />

        <div
          style={{ maxWidth: "600px", margin: "0 auto", position: "relative" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: "100px",
              padding: "5px 12px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Assemble You · Podcast Learning
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "20px",
              marginBottom: "28px",
            }}
          >
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontFamily: serif,
                  fontWeight: 300,
                  color: "white",
                  fontSize: "clamp(2rem, 6vw, 3rem)",
                  lineHeight: 1.15,
                  margin: "0 0 8px",
                }}
              >
                {content?.title || bundle?.experience?.name}
              </h1>
              <p
                style={{
                  fontSize: "14px",
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

          {/* Stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{ fontSize: "18px", fontWeight: 700, color: "white" }}
              >
                {listenedCount}/{episodes.length}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 300,
                }}
              >
                episodes
              </span>
            </div>
            {!isExpired && expiresAt && (
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{ fontSize: "18px", fontWeight: 700, color: "white" }}
                >
                  {daysRemaining}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: 300,
                  }}
                >
                  days left · expires {formatDate(expiresAt)}
                </span>
              </div>
            )}
            {isExpired && (
              <div
                style={{
                  backgroundColor: "rgba(205,92,92,0.3)",
                  borderRadius: "12px",
                  padding: "10px 16px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 500,
                  }}
                >
                  Access expired {formatDate(expiresAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "32px 24px 64px",
        }}
      >
        {/* About */}
        <div
          style={{
            backgroundColor: "white",
            border: `1px solid ${border}`,
            borderRadius: "20px",
            padding: "24px 28px",
            marginBottom: "24px",
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
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
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

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {episodes.map((ep, i) => {
              const listened = listenedSlugs.includes(ep.slug);
              const available = !!ep.audio_url;

              return (
                <div
                  key={ep.slug}
                  onClick={() =>
                    available && !isExpired && navigate(`/listen/${ep.slug}`)
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
                  {/* Number / check */}
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

                  {/* Info */}
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

                  {/* Action */}
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

        {/* Assemble You credit */}
        <div
          style={{
            backgroundColor: "white",
            border: `1px solid ${border}`,
            borderRadius: "20px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#F0F9F7",
              border: "1px solid #C5E8E3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "20px",
            }}
          >
            🎧
          </div>
          <div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: charcoal,
                margin: "0 0 2px",
              }}
            >
              Powered by Assemble You
            </p>
            <p
              style={{
                fontSize: "12px",
                color: muted,
                fontWeight: 300,
                margin: 0,
              }}
            >
              Award-winning podcast-style learning for hospitality professionals
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "40px",
            paddingTop: "24px",
            borderTop: `1px solid ${border}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "12px", color: "#AEAAA0", margin: 0 }}>
            Questions about your bundle?{" "}
            <a
              href="mailto:david@zestr.co.uk"
              style={{ color: sage, textDecoration: "none", fontWeight: 500 }}
            >
              david@zestr.co.uk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
