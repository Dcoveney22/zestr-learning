import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const s = {
  sage: "#01796F",
  cream: "#FAF8F3",
  charcoal: "#1C1C1A",
  muted: "#6B6B60",
  border: "#E8E4DC",
  terracotta: "#CD5C5C",
  serif: { fontFamily: "'Cormorant Garamond', Georgia, serif" },
  sans: { fontFamily: "'DM Sans', system-ui, sans-serif" },
};

// ── Content config ─────────────────────────────────────────────────────────
// This is where you define the episodes for each bundle.
// episode audio_url will point to Cloudflare R2 once files are uploaded.

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
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 72, height: 72 }}
    >
      <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#E8E4DC"
          strokeWidth="4"
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={s.sage}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
      </svg>
      <span
        className="absolute text-sm font-semibold"
        style={{ color: s.sage }}
      >
        {pct}%
      </span>
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

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: s.cream }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: s.sage, borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: s.muted }}>
            Loading your bundle...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: s.cream }}
      >
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={loadBundle}
            className="text-sm"
            style={{ color: s.sage }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

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
      className="min-h-screen"
      style={{ backgroundColor: s.cream, ...s.sans }}
    >
      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
        style={{
          backgroundColor: "white",
          borderBottom: `1px solid ${s.border}`,
        }}
      >
        <div className="flex items-center gap-3">
          <img
            src="https://zestr.co.uk/zestr-logo-new.png"
            alt="Zest:r"
            style={{ height: "24px" }}
          />
          <span
            className="text-xs font-medium tracking-widest uppercase px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#F0F9F7", color: s.sage }}
          >
            Learning
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs"
          style={{ color: s.muted, fontWeight: 300 }}
        >
          Sign out
        </button>
      </nav>

      {/* ── HERO ── */}
      <div className="px-5 pt-10 pb-8 max-w-2xl mx-auto">
        {/* Expired warning */}
        {isExpired && (
          <div
            className="rounded-2xl px-5 py-4 mb-6 text-sm"
            style={{
              backgroundColor: "#FFF1F1",
              border: "1px solid #FEC5C5",
              color: "#a83333",
            }}
          >
            Your access to this bundle expired on {formatDate(expiresAt)}.
            Questions? Email{" "}
            <a href="mailto:david@zestr.co.uk" style={{ fontWeight: 600 }}>
              david@zestr.co.uk
            </a>
          </div>
        )}

        {/* Access banner */}
        {!isExpired && (
          <div
            className="rounded-2xl px-5 py-3 mb-8 flex items-center justify-between text-sm"
            style={{ backgroundColor: "#F0F9F7", border: "1px solid #C5E8E3" }}
          >
            <span style={{ color: "#1a5e55", fontWeight: 300 }}>
              Access expires <strong>{formatDate(expiresAt)}</strong>
            </span>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: s.sage, color: "white" }}
            >
              {daysRemaining}d left
            </span>
          </div>
        )}

        {/* Bundle header */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex-1">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: s.sage }}
            >
              Assemble You · Podcast Learning
            </p>
            <h1
              className="text-3xl font-light leading-snug mb-2"
              style={{ ...s.serif, color: s.charcoal }}
            >
              {content?.title || bundle?.experience?.name}
            </h1>
            <p
              className="text-sm leading-relaxed"
              style={{ color: s.muted, fontWeight: 300 }}
            >
              {content?.subtitle}
            </p>
          </div>
          <ProgressRing progress={listenedCount} total={episodes.length} />
        </div>

        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: s.muted, fontWeight: 300 }}
        >
          {content?.description}
        </p>

        {/* Progress summary */}
        <div
          className="rounded-2xl px-5 py-4 mb-8 flex items-center justify-between"
          style={{ backgroundColor: "white", border: `1px solid ${s.border}` }}
        >
          <div>
            <p
              className="text-xs uppercase tracking-widest font-semibold mb-0.5"
              style={{ color: s.muted }}
            >
              Your progress
            </p>
            <p
              className="text-2xl font-light"
              style={{ ...s.serif, color: s.charcoal }}
            >
              {listenedCount} of {episodes.length} episodes
            </p>
          </div>
          {listenedCount === episodes.length && episodes.length > 0 && (
            <div
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "#F0F9F7",
                color: s.sage,
                border: "1px solid #C5E8E3",
              }}
            >
              ✓ Complete
            </div>
          )}
        </div>

        {/* Episodes list */}
        <div>
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: s.muted }}
          >
            Episodes
          </h2>

          <div className="space-y-3">
            {episodes.map((ep, i) => {
              const listened = listenedSlugs.includes(ep.slug);
              const available = !!ep.audio_url;

              return (
                <div
                  key={ep.slug}
                  onClick={() =>
                    available && !isExpired && navigate(`/listen/${ep.slug}`)
                  }
                  className="rounded-2xl px-5 py-4 flex items-center gap-4 transition-all"
                  style={{
                    backgroundColor: "white",
                    border: `1px solid ${listened ? "#C5E8E3" : s.border}`,
                    cursor: available && !isExpired ? "pointer" : "default",
                    opacity: isExpired ? 0.6 : 1,
                  }}
                >
                  {/* Number / check */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                    style={{
                      backgroundColor: listened ? s.sage : "#F5F5F5",
                      color: listened ? "white" : s.muted,
                    }}
                  >
                    {listened ? "✓" : i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium"
                      style={{ color: s.charcoal }}
                    >
                      {ep.title}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: s.muted, fontWeight: 300 }}
                    >
                      {ep.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs" style={{ color: s.muted }}>
                      {ep.duration}
                    </span>
                    {available && !isExpired && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: listened ? "#F0F9F7" : s.sage,
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill={listened ? s.sage : "white"}
                        >
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    )}
                    {!available && (
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: "#F5F5F5", color: s.muted }}
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
          className="mt-12 pt-6 text-center"
          style={{ borderTop: `1px solid ${s.border}` }}
        >
          <p className="text-xs" style={{ color: "#AEAAA0" }}>
            Questions about your bundle?{" "}
            <a href="mailto:david@zestr.co.uk" style={{ color: s.sage }}>
              david@zestr.co.uk
            </a>
          </p>
          <p className="text-xs mt-1" style={{ color: "#AEAAA0" }}>
            Zest:r Learning · Powered by Assemble You
          </p>
        </div>
      </div>
    </div>
  );
}
