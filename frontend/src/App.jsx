import { useState } from "react";

const API_BASE = "http://localhost:3000";

const styles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #111318;
    color: #e8e8ea;
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .navbar {
    padding: 18px 32px;
    border-bottom: 1px solid #26282f;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 600;
  }

  .brand-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: #4a4dff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-icon svg {
    width: 15px;
    height: 15px;
  }

  .hero-section {
    max-width: 640px;
    margin: 0 auto;
    padding: 80px 24px;
  }

  .hero-title {
    text-align: center;
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 12px;
  }

  .hero-title .accent {
    color: #7d7fff;
  }

  .hero-sub {
    text-align: center;
    font-size: 15px;
    color: #9a9ca5;
    margin: 0 0 32px;
  }

  .deck {
    display: flex;
    gap: 8px;
    background: #1a1c22;
    border: 1px solid #2c2e36;
    border-radius: 8px;
    padding: 6px;
  }

  .url-input {
    flex: 1;
    background: transparent;
    border: none;
    padding: 10px 12px;
    color: #e8e8ea;
    font-size: 14px;
    outline: none;
  }

  .url-input::placeholder {
    color: #6b6d76;
  }

  .load-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #4a4dff;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0 18px;
    height: 38px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .load-btn:hover {
    background: #3d3fe0;
  }

  .load-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .load-btn svg {
    width: 15px;
    height: 15px;
  }

  @media (max-width: 600px) {
    .hero-title {
      font-size: 28px;
    }

    .deck {
      flex-direction: column;
    }

    .load-btn {
      justify-content: center;
    }
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
  const [error, setError] = useState(null);

  async function handleDownload() {
    setError(null);
    setDownloadUrl(null);
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
        setStatus("done");
      } else if (data.status === "failed") {
        clearInterval(interval);
        setError(data.failedReason || "Download failed");
        setStatus("error");
      }
    }, 2000);
  }

  const isBusy = status === "queued" || status === "polling";

  return (
    <section className="hero-section">
      <h1 className="hero-title">
        Tweet Video <span className="accent">to MP4</span>
      </h1>

      <p className="hero-sub">Paste link and get video</p>

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

      {status === "polling" && <p className="hero-sub">Fetching your video, hang tight...</p>}
      {error && <p style={{ color: "#ff6b6b", textAlign: "center" }}>{error}</p>}
      {downloadUrl && (
        <p style={{ textAlign: "center" }}>
          Done!{" "}
          <a href={downloadUrl} target="_blank" rel="noreferrer" style={{ color: "#7d7fff" }}>
            Download your video
          </a>
        </p>
      )}
    </section>
  );
}

export default function App() {
  return (
    <>
      <style>{styles}</style>
      <Navbar />
      <Hero />
    </>
  );
}