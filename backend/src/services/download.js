const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const DOWNLOADS_DIR = path.join(__dirname, '../../downloads');
const YTDLP_TIMEOUT_MS = 60_000;

function getVideoInfo(url) {
  return new Promise((resolve, reject) => {
    execFile(
      'yt-dlp',
      ['-j', url],
      { maxBuffer: 1024 * 1024 * 10, timeout: YTDLP_TIMEOUT_MS },
      (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(stderr?.trim() || error.message));
        }

        let data;
        try {
          data = JSON.parse(stdout);
        } catch (parseErr) {
          return reject(new Error('Could not parse video metadata'));
        }

        resolve({
          title: data.title,
          thumbnail: data.thumbnail,
          duration: data.duration,
          uploader: data.uploader,
          formats: data.formats?.map((f) => ({
            format_id: f.format_id,
            ext: f.ext,
            resolution: f.resolution,
            url: f.url,
          })),
        });
      }
    );
  });
}

function downloadVideo(url) {
  return new Promise((resolve, reject) => {
    const outputTemplate = path.join(DOWNLOADS_DIR, '%(id)s.%(ext)s');

    execFile(
      'yt-dlp',
      ['-f', 'best[ext=mp4]/best', '-o', outputTemplate, '--print', 'after_move:filepath', url],
      { maxBuffer: 1024 * 1024 * 10, timeout: YTDLP_TIMEOUT_MS },
      (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(stderr?.trim() || error.message));
        }

        const filePath = stdout.trim().split('\n').pop();

        if (!filePath || !fs.existsSync(filePath)) {
          return reject(new Error('yt-dlp reported success but no file was found on disk'));
        }

        const fileName = path.basename(filePath);
        logger.info(`Downloaded: ${fileName}`);
        resolve({ filePath, fileName });
      }
    );
  });
}

function fileExists(fileName) {
  return fs.existsSync(path.join(DOWNLOADS_DIR, fileName));
}

module.exports = { getVideoInfo, downloadVideo, fileExists, DOWNLOADS_DIR };