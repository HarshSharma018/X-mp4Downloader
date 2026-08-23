import { useState } from "react";

const API_BASE = "https://x-mp4downloader.onrender.com";

const styles = `
  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: #0e0e10;
    color: #f0f0f0;
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .navbar {
    padding: 20px 32px;
    border-bottom: 1px solid #232326;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
  }

  .brand-icon {
    width: 26px;
    height: 26px;
    border-radius: 5px;
    background: #0d9488;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .brand-icon svg { width: 14px; height: 14px; }

  .hero-section {
    max-width: 600px;
    margin: 0 auto;
    padding: 70px 24px 40px;
  }

  .hero-title {
    text-align: center;
    font-size: 34px;
    font-weight: 700;
    line-height: 1.25;
    margin: 0 0 12px;
    color: #fff;
  }

  .hero-sub {
    text-align: center;
    font-size: 15px;
    color: #9a9a9f;
    margin: 0 0 32px;
  }

  .deck {
    display: flex;
    gap: 8px;
    background: #1a1a1d;
    border: 1px solid #2a2a2e;
    border-radius: 6px;
    padding: 6px;
  }

  .url-input {
    flex: 1;
    background: transparent;
    border: none;
    padding: 11px 14px;
    color: #f0f0f0;
    font-size: 14px;
    outline: none;
  }

  .url-input::placeholder { color: #6b6b70; }

  .load-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #0d9488;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 0 20px;
    height: 40px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .load-btn:hover { background: #0b7a70; }
  .load-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .load-btn svg { width: 15px; height: 15px; }

  .result-card {
    max-width: 600px;
    margin: 32px auto 0;
    padding: 20px;
    border: 1px solid #2a2a2e;
    border-radius: 6px;
    background: #1a1a1d;
  }

  .result-thumb {
    width: 100%;
    max-height: 320px;
    object-fit: cover;
    border-radius: 4px;
    display: block;
    margin-bottom: 16px;
    background: #26262a;
  }

  .result-download-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #0d9488;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 13px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    width: 100%;
  }

  .result-download-btn:hover { background: #0b7a70; }

  .reset-btn {
    display: block;
    margin: 16px auto 0;
    background: transparent;
    color: #9a9a9f;
    border: none;
    font-size: 13.5px;
    text-decoration: underline;
    cursor: pointer;
  }

  .howto-section {
    max-width: 600px;
    margin: 56px auto 0;
    padding: 0 24px 60px;
  }

  .howto-section h2 {
    font-size: 18px;
    margin-bottom: 14px;
    color: #fff;
  }

  .howto-section ol {
    color: #b0b0b5;
    font-size: 14px;
    line-height: 1.8;
    padding-left: 20px;
  }

  @media (max-width: 600px) {
    .hero-title { font-size: 26px; }
    .deck { flex-direction: column; }
    .load-btn { justify-content: center; }
  }
`;

function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.9 2H22l-8.4 9.6L23 22h-7.1l-5.6-6.9L4 22H1l9-10.3L1 2h7.2l5 6.3L18.9 2zm-1.2 18h1.9L7.4 4H5.4l12.3 16z" />
          </svg>
        </span>
        X Video Downloader
      </div>
    </header>
  );
}

function Hero() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState(null);

async function handleDownload() {
  setError(null);
  setDownloadUrl(null);
  setThumbnail(null);
  setStatus("queued");

  try {
    const res = await fetch(`${API_BASE}/api/downloads/job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setStatus("error");
      return;
    }

    pollJob(data.jobId);
  } catch (err) {
    setError("Could not reach the server");
    setStatus("error");
  }
}

  function pollJob(jobId) {
    setStatus("polling");

    const interval = setInterval(async () => {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
      const data = await res.json();

      if (data.status === "completed") {
        clearInterval(interval);
        setDownloadUrl(`${API_BASE}/files/${data.result.fileName}`);
         setThumbnail(data.result.thumbnail );
        setStatus("done");
      } else if (data.status === "failed") {
        clearInterval(interval);
        setError(data.failedReason || "Download failed");
        setStatus("error");
      }
    }, 2000);
  }

  async function handleFileDownload() {
    const res = await fetch(downloadUrl);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = downloadUrl.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
  }

  function reset() {
    setUrl("");
    setStatus("idle");
    setDownloadUrl(null);
    setThumbnail(null);
    setError(null);
  }

  const isBusy = status === "queued" || status === "polling";

  return (
    <section className="hero-section">
      <h1 className="hero-title">Tweet Video to MP4</h1>

      <p className="hero-sub">Paste link and get video</p>

      {status !== "done" && (
        <div className="deck">
          <input
            className="url-input"
            type="text"
            placeholder="paste url here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="load-btn" onClick={handleDownload} disabled={isBusy || !url}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
            {isBusy ? "Processing..." : "Download"}
          </button>
        </div>
      )}

      {status === "polling" && <p className="hero-sub">Fetching your video, hang tight...</p>}
      {error && <p style={{ color: "#c0392b", textAlign: "center" }}>{error}</p>}

      {status === "done" && downloadUrl && (
        <div className="result-card">
          {thumbnail && <img className="result-thumb" src={thumbnail} alt="Video thumbnail" />}
          <button className="result-download-btn" onClick={handleFileDownload}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
            Download MP4
          </button>
          <p style={{ textAlign: "center", fontSize: 13, color: "#0d9488", marginTop: 8 }}>
            Click above to save the video
          </p>
          <button className="reset-btn" onClick={reset}>
            Download another video
          </button>
        </div>
      )}
    </section>
  );
}

function HowTo() {
  return (
    <section className="howto-section">
      <h2>How it works</h2>
      <ol>
        <li>Find the tweet with the video you want.</li>
        <li>Copy the tweet's link.</li>
        <li>Paste it above and hit Download.</li>
        <li>Wait a few seconds for it to process.</li>
        <li>Click Download MP4 to save it.</li>
      </ol>
    </section>
  );
}

export default function App() {
  return (
    <>
      <style>{styles}</style>
      <Navbar />
      <Hero />
      <HowTo />
    </>
  );
}