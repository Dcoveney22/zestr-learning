import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

const sage = "#01796F";
const cream = "#FAF8F3";
const charcoal = "#1C1C1A";
const muted = "#6B6B60";
const border = "#E8E4DC";
const darkTeal = "#014A43";
const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'DM Sans', system-ui, sans-serif";

const ALL_EPISODES = {
  "ssos-01": {
    title: "Episode 1",
    bundle: "Stay Sharp on Shift",
    description: "Coming soon — check back shortly.",
    duration: "~8 mins",
    audio_url: null,
    transcript_url: null,
    infographic_url: null,
  },
  "ls-01": {
    title: "Episode 1",
    bundle: "Leadership Sprint",
    description: "Coming soon — check back shortly.",
    duration: "~8 mins",
    audio_url: null,
    transcript_url: null,
    infographic_url: null,
  },
};

export default function ListenPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [marked, setMarked] = useState(false);

  const episode = ALL_EPISODES[slug];

  useEffect(() => {
    if (!episode) navigate("/dashboard");
  }, [episode]);

  useEffect(() => {
    if (marked || duration === 0) return;
    if (currentTime / duration >= 0.8) markListened();
  }, [currentTime, duration, marked]);

  const markListened = async () => {
    if (marked) return;
    setMarked(true);
    const token = localStorage.getItem("learning_token");
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ episodeSlug: slug }),
      });
    } catch {
      /* silent */
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime =
      ((e.clientX - rect.left) / rect.width) * duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!episode) return null;

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
          gap: "12px",
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: muted,
            fontWeight: 300,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: sans,
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
          Back to bundle
        </button>
      </nav>

      <div
        style={{
          maxWidth: "520px",
          margin: "0 auto",
          padding: "40px 20px 60px",
        }}
      >
        {/* Episode header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: sage,
              marginBottom: "12px",
            }}
          >
            {episode.bundle} · Assemble You
          </p>
          <h1
            style={{
              fontFamily: serif,
              fontSize: "2.25rem",
              fontWeight: 300,
              color: charcoal,
              marginBottom: "10px",
              lineHeight: 1.2,
            }}
          >
            {episode.title}
          </h1>
          <p style={{ fontSize: "14px", color: muted, fontWeight: 300 }}>
            {episode.description}
          </p>
        </div>

        {/* Player card */}
        <div
          style={{
            backgroundColor: "white",
            border: `1px solid ${border}`,
            borderRadius: "24px",
            overflow: "hidden",
            marginBottom: "20px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          {/* Art */}
          <div
            style={{
              backgroundColor: darkTeal,
              height: "160px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="1.5"
              >
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
                <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
          </div>

          <div style={{ padding: "28px 28px 24px" }}>
            {episode.audio_url ? (
              <>
                <audio
                  ref={audioRef}
                  src={episode.audio_url}
                  onTimeUpdate={() =>
                    setCurrentTime(audioRef.current?.currentTime || 0)
                  }
                  onLoadedMetadata={() =>
                    setDuration(audioRef.current?.duration || 0)
                  }
                  onEnded={() => {
                    setPlaying(false);
                    markListened();
                  }}
                />

                {/* Progress bar */}
                <div
                  onClick={handleSeek}
                  style={{
                    position: "relative",
                    height: "6px",
                    borderRadius: "3px",
                    backgroundColor: "#E8E4DC",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "3px",
                      width: `${progress}%`,
                      backgroundColor: sage,
                      transition: "width 0.1s linear",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      left: `calc(${progress}% - 7px)`,
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      backgroundColor: "white",
                      border: `2px solid ${sage}`,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                    }}
                  />
                </div>

                {/* Time */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: muted,
                    marginBottom: "24px",
                  }}
                >
                  <span>{fmt(currentTime)}</span>
                  <span>{fmt(duration)}</span>
                </div>

                {/* Controls */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "28px",
                  }}
                >
                  <button
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime -= 15;
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={muted}
                      strokeWidth="1.8"
                    >
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 .49-3.49" />
                    </svg>
                    <span
                      style={{
                        fontSize: "10px",
                        color: muted,
                        fontWeight: 500,
                      }}
                    >
                      15s
                    </span>
                  </button>

                  <button
                    onClick={togglePlay}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: sage,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 16px rgba(1,121,111,0.35)",
                      transition: "transform 0.1s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    {playing ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="white"
                        style={{ marginLeft: "3px" }}
                      >
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime += 15;
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={muted}
                      strokeWidth="1.8"
                    >
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-.49-3.49" />
                    </svg>
                    <span
                      style={{
                        fontSize: "10px",
                        color: muted,
                        fontWeight: 500,
                      }}
                    >
                      15s
                    </span>
                  </button>
                </div>

                {marked && (
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: sage,
                        backgroundColor: "#F0F9F7",
                        padding: "6px 14px",
                        borderRadius: "100px",
                        border: "1px solid #C5E8E3",
                      }}
                    >
                      ✓ Marked as listened
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#F5F5F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={muted}
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 500,
                    color: charcoal,
                    marginBottom: "6px",
                  }}
                >
                  Audio coming soon
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: muted,
                    fontWeight: 300,
                    lineHeight: 1.6,
                  }}
                >
                  This episode will be available shortly.
                  <br />
                  Check back soon.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Downloads */}
        {(episode.transcript_url || episode.infographic_url) && (
          <div
            style={{
              backgroundColor: "white",
              border: `1px solid ${border}`,
              borderRadius: "20px",
              padding: "20px 24px",
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
                marginBottom: "16px",
              }}
            >
              Downloads
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {episode.transcript_url && (
                <a
                  href={episode.transcript_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    textDecoration: "none",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      backgroundColor: "#F0F9F7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={sage}
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <span
                    style={{ fontSize: "14px", color: sage, fontWeight: 500 }}
                  >
                    Download transcript
                  </span>
                </a>
              )}
              {episode.infographic_url && (
                <a
                  href={episode.infographic_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    textDecoration: "none",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      backgroundColor: "#F0F9F7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={sage}
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <span
                    style={{ fontSize: "14px", color: sage, fontWeight: 500 }}
                  >
                    Download infographic
                  </span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", paddingTop: "8px" }}>
          <p style={{ fontSize: "12px", color: "#AEAAA0" }}>
            Questions?{" "}
            <a
              href="mailto:david@zestr.co.uk"
              style={{ color: sage, textDecoration: "none" }}
            >
              david@zestr.co.uk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
