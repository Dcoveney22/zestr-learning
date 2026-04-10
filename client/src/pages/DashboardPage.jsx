import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const sage = "#01796F";
const cream = "#FAF8F3";
const charcoal = "#1C1C1A";
const muted = "#6B6B60";
const border = "#E8E4DC";
const darkTeal = "#014A43";
const terracotta = "#CD5C5C";
const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'DM Sans', system-ui, sans-serif";

const BUNDLE_CONTENT = {
  "stay-sharp-on-shift-30": {
    title: "Stay Sharp on Shift",
    subtitle: "Podcast learning for hospitality professionals",
    description:
      "Short, practical audio lessons you can listen to on your commute or break. Covering mental resilience, handling difficult conversations, building confidence under pressure, and simple wellbeing habits that actually stick.",
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
      "Short, practical audio lessons you can listen to on your commute or break. Covering mental resilience, handling difficult conversations, building confidence under pressure, and simple wellbeing habits that actually stick.",
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
      "Leadership is not just for managers. This bundle gives you the tools to lead from wherever you are — handling pressure, communicating with confidence, motivating a team, and thinking strategically even on a busy shift.",
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
      "Leadership is not just for managers. This bundle gives you the tools to lead from wherever you are — handling pressure, communicating with confidence, motivating a team, and thinking strategically even on a busy shift.",
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
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div
      style={{
        position: "relative",
        width: "68px",
        height: "68px",
        flexShrink: 0,
      }}
    >
      <svg width="68" height="68" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke={border}
          strokeWidth="4"
        />
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke={sage}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 600,
          color: sage,
          fontFamily: sans,
        }}
      >
        {pct}%
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
          padding: "24px",
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
              fontFamily: sans,
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

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: cream, fontFamily: sans }}
    >
      {/* Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "white",
          borderBottom: `1px solid ${border}`,
          padding: "0 20px",
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
            style={{ height: "22px" }}
          />
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: sage,
              backgroundColor: "#F0F9F7",
              padding: "3px 8px",
              borderRadius: "100px",
            }}
          >
            Learning
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            fontSize: "13px",
            color: muted,
            fontWeight: 300,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: sans,
          }}
        >
          Sign out
        </button>
      </nav>

      {/* Hero band */}
      <div style={{ backgroundColor: darkTeal, padding: "40px 20px 36px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              marginBottom: "10px",
            }}
          >
            Assemble You · Podcast Learning
          </p>
          <h1
            style={{
              fontFamily: serif,
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              fontWeight: 300,
              color: "white",
              lineHeight: 1.2,
              marginBottom: "8px",
            }}
          >
            {content?.title || bundle?.experience?.name}
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 300,
            }}
          >
            {content?.subtitle}
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "28px 20px 60px",
        }}
      >
        {/* Expired warning */}
        {isExpired && (
          <div
            style={{
              backgroundColor: "#FFF1F1",
              border: "1px solid #FEC5C5",
              borderRadius: "16px",
              padding: "16px 20px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "#a83333",
                fontWeight: 300,
                lineHeight: 1.6,
              }}
            >
              Your access expired on {formatDate(expiresAt)}. Questions?{" "}
              <a
                href="mailto:david@zestr.co.uk"
                style={{ color: "#a83333", fontWeight: 600 }}
              >
                david@zestr.co.uk
              </a>
            </p>
          </div>
        )}

        {/* Access banner */}
        {!isExpired && expiresAt && (
          <div
            style={{
              backgroundColor: "#F0F9F7",
              border: "1px solid #C5E8E3",
              borderRadius: "16px",
              padding: "14px 20px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{ fontSize: "13px", color: "#1a5e55", fontWeight: 300 }}>
              Access expires{" "}
              <strong style={{ fontWeight: 600 }}>
                {formatDate(expiresAt)}
              </strong>
            </p>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "white",
                backgroundColor: sage,
                padding: "4px 10px",
                borderRadius: "100px",
              }}
            >
              {daysRemaining}d left
            </span>
          </div>
        )}

        {/* Progress card */}
        <div
          style={{
            backgroundColor: "white",
            border: `1px solid ${border}`,
            borderRadius: "20px",
            padding: "24px 28px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: muted,
                marginBottom: "6px",
              }}
            >
              Your progress
            </p>
            <p
              style={{
                fontFamily: serif,
                fontSize: "28px",
                fontWeight: 300,
                color: charcoal,
                lineHeight: 1,
              }}
            >
              {listenedCount} of {episodes.length}
            </p>
            <p
              style={{
                fontSize: "12px",
                color: muted,
                fontWeight: 300,
                marginTop: "4px",
              }}
            >
              episodes listened
            </p>
          </div>
          <ProgressRing progress={listenedCount} total={episodes.length} />
        </div>

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
              marginBottom: "12px",
            }}
          >
            About this bundle
          </p>
          <p
            style={{
              fontSize: "14px",
              color: muted,
              fontWeight: 300,
              lineHeight: 1.7,
            }}
          >
            {content?.description}
          </p>
        </div>

        {/* Episodes */}
        <div>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: muted,
              marginBottom: "16px",
            }}
          >
            Episodes
          </p>

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
                    border: `1px solid ${listened ? "#C5E8E3" : border}`,
                    borderRadius: "16px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    cursor: available && !isExpired ? "pointer" : "default",
                    opacity: isExpired ? 0.6 : 1,
                    transition: "box-shadow 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (available && !isExpired)
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Number / check */}
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: listened ? sage : "#F5F5F5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "13px",
                      fontWeight: 600,
                      color: listened ? "white" : muted,
                    }}
                  >
                    {listened ? "✓" : i + 1}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: charcoal,
                        marginBottom: "2px",
                      }}
                    >
                      {ep.title}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: muted,
                        fontWeight: 300,
                      }}
                    >
                      {ep.description}
                    </p>
                  </div>

                  {/* Duration + play */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: "12px", color: muted }}>
                      {ep.duration}
                    </span>
                    {available && !isExpired ? (
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: listened ? "#F0F9F7" : sage,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill={listened ? sage : "white"}
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
                          backgroundColor: "#F5F5F5",
                          padding: "4px 10px",
                          borderRadius: "100px",
                        }}
                      >
                        Soon
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: `1px solid ${border}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "12px", color: "#AEAAA0" }}>
            Questions?{" "}
            <a
              href="mailto:david@zestr.co.uk"
              style={{ color: sage, textDecoration: "none" }}
            >
              david@zestr.co.uk
            </a>
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "#AEAAA0",
              marginTop: "4px",
              fontWeight: 300,
            }}
          >
            Zest:r Learning · Powered by Assemble You
          </p>
        </div>
      </div>
    </div>
  );
}
