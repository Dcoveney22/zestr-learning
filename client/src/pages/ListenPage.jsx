import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

const s = {
  sage: "#01796F",
  cream: "#FAF8F3",
  charcoal: "#1C1C1A",
  muted: "#6B6B60",
  border: "#E8E4DC",
  serif: { fontFamily: "'Cormorant Garamond', Georgia, serif" },
  sans: { fontFamily: "'DM Sans', system-ui, sans-serif" },
};

// Must match BUNDLE_CONTENT in DashboardPage
const ALL_EPISODES = {
  "ssos-01": {
    title: "Episode 1",
    bundle: "Stay Sharp on Shift",
    description: "Coming soon",
    duration: "~8 mins",
    audio_url: null,
    transcript_url: null,
    infographic_url: null,
  },
  "ls-01": {
    title: "Episode 1",
    bundle: "Leadership Sprint",
    description: "Coming soon",
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
  const [loading, setLoading] = useState(false);

  const episode = ALL_EPISODES[slug];

  useEffect(() => {
    if (!episode) navigate("/dashboard");
  }, [episode]);

  // Mark as listened when 80% through
  useEffect(() => {
    if (marked || duration === 0) return;
    if (currentTime / duration >= 0.8) {
      markListened();
    }
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
      // silent fail — progress is best effort
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!episode) return null;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: s.cream, ...s.sans }}
    >
      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3"
        style={{
          backgroundColor: "white",
          borderBottom: `1px solid ${s.border}`,
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: s.muted, fontWeight: 300 }}
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

      <div className="max-w-lg mx-auto px-5 py-10">
        {/* Episode header */}
        <div className="text-center mb-10">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: s.sage }}
          >
            {episode.bundle} · Assemble You
          </p>
          <h1
            className="text-3xl font-light mb-3"
            style={{ ...s.serif, color: s.charcoal }}
          >
            {episode.title}
          </h1>
          <p className="text-sm" style={{ color: s.muted, fontWeight: 300 }}>
            {episode.description}
          </p>
        </div>

        {/* Player card */}
        <div
          className="rounded-3xl overflow-hidden mb-6"
          style={{ backgroundColor: "white", border: `1px solid ${s.border}` }}
        >
          {/* Player art */}
          <div
            className="flex items-center justify-center"
            style={{ backgroundColor: "#014A43", height: "180px" }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
              </svg>
            </div>
          </div>

          <div className="px-6 py-6">
            {episode.audio_url ? (
              <>
                {/* Hidden audio element */}
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
                  className="relative h-2 rounded-full mb-3 cursor-pointer"
                  style={{ backgroundColor: "#E8E4DC" }}
                  onClick={handleSeek}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, backgroundColor: s.sage }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-md"
                    style={{
                      left: `calc(${progress}% - 8px)`,
                      backgroundColor: "white",
                      border: `2px solid ${s.sage}`,
                    }}
                  />
                </div>

                {/* Time */}
                <div
                  className="flex justify-between text-xs mb-6"
                  style={{ color: s.muted }}
                >
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6">
                  {/* Rewind 15s */}
                  <button
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime -= 15;
                    }}
                    className="flex flex-col items-center gap-1"
                    style={{ color: s.muted }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 4v6h6" />
                      <path d="M3.51 15a9 9 0 1 0 .49-3.49" />
                      <text
                        x="8"
                        y="14"
                        fontSize="6"
                        fill="currentColor"
                        stroke="none"
                        fontWeight="600"
                      >
                        15
                      </text>
                    </svg>
                    <span className="text-xs" style={{ fontWeight: 300 }}>
                      15s
                    </span>
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                    style={{ backgroundColor: s.sage }}
                  >
                    {playing ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="white"
                        style={{ marginLeft: "3px" }}
                      >
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    )}
                  </button>

                  {/* Forward 15s */}
                  <button
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime += 15;
                    }}
                    className="flex flex-col items-center gap-1"
                    style={{ color: s.muted }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M23 4v6h-6" />
                      <path d="M20.49 15a9 9 0 1 1-.49-3.49" />
                      <text
                        x="8"
                        y="14"
                        fontSize="6"
                        fill="currentColor"
                        stroke="none"
                        fontWeight="600"
                      >
                        15
                      </text>
                    </svg>
                    <span className="text-xs" style={{ fontWeight: 300 }}>
                      15s
                    </span>
                  </button>
                </div>

                {/* Listened badge */}
                {marked && (
                  <div
                    className="mt-5 text-center text-sm font-medium"
                    style={{ color: s.sage }}
                  >
                    ✓ Marked as listened
                  </div>
                )}
              </>
            ) : (
              /* No audio yet */
              <div className="text-center py-4">
                <p
                  className="text-sm mb-2"
                  style={{ color: s.charcoal, fontWeight: 500 }}
                >
                  Audio coming soon
                </p>
                <p
                  className="text-xs"
                  style={{ color: s.muted, fontWeight: 300 }}
                >
                  This episode will be available shortly. Check back soon.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Downloads */}
        {(episode.transcript_url || episode.infographic_url) && (
          <div
            className="rounded-2xl px-5 py-5 mb-6"
            style={{
              backgroundColor: "white",
              border: `1px solid ${s.border}`,
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: s.muted }}
            >
              Downloads
            </p>
            <div className="space-y-3">
              {episode.transcript_url && (
                <a
                  href={episode.transcript_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm transition-opacity hover:opacity-70"
                  style={{ color: s.sage, fontWeight: 500 }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#F0F9F7" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={s.sage}
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  Download transcript
                </a>
              )}
              {episode.infographic_url && (
                <a
                  href={episode.infographic_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm transition-opacity hover:opacity-70"
                  style={{ color: s.sage, fontWeight: 500 }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#F0F9F7" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={s.sage}
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  Download infographic
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs" style={{ color: "#AEAAA0" }}>
            Questions?{" "}
            <a href="mailto:david@zestr.co.uk" style={{ color: s.sage }}>
              david@zestr.co.uk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
