# X Video Downloader

Downloads videos from X (Twitter). Paste a tweet URL, get an MP4.

Built around an async job queue instead of a blocking request, so the API stays responsive regardless of how long a download takes.

# Live

- Live: https://x-mp4downloader-1.onrender.com


## Architecture

```
Browser → Express API → BullMQ Queue (Redis) → Worker → yt-dlp → File saved
              ↓                                            ↓
           Postgres  ←──────────── job status ──────────────┘
```

1. Client submits a URL → API validates it, queues a job, returns a `jobId` immediately
2. Worker picks up the job, runs `yt-dlp`, downloads the video
3. Worker writes the result to Postgres
4. Client polls `GET /api/jobs/:id` until status is `completed`

## Stack

Node.js, Express, BullMQ, Redis, PostgreSQL, yt-dlp, ffmpeg, Docker, React (Vite)

##structure 

```
backend/src/
├── routes/         URL → handler mapping
├── controllers/    request handling logic
├── services/       yt-dlp integration
├── queues/         Redis connection + BullMQ producer
├── workers/        BullMQ consumer (background processing)
├── middlewares/     validation, rate limiting, error handling
├── config/            database setup
└── utils/               logging
frontend/           React + Vite
```
