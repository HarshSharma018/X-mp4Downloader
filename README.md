# X Video Downloader

A production-style backend service for downloading videos from X (Twitter), built to demonstrate real backend engineering patterns: async job queues, containerization, and persistent storage — not just a CRUD wrapper around yt-dlp.

## Why this exists

Most video-downloader projects are a single blocking endpoint that runs a CLI tool and waits. This one is built the way a real production service would handle unpredictable, slow external work: jobs are queued, processed in the background by dedicated workers, and tracked in a database — so the API stays fast and responsive no matter how long a download takes.

## Architecture
