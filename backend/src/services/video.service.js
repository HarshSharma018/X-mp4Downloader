
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    execFile('yt-dlp', args, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (stderr && stderr.trim()) {
        console.warn('[yt-dlp stderr]', stderr.trim());
      }
      if (error) {
        error.stderr = stderr;
        return reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
}

async function getVideoInfo(url) {
  const { stdout } = await runYtDlp(['-j', '--no-playlist', url]);

  const firstLine = stdout.trim().split('\n')[0];
  const data = JSON.parse(firstLine);

  return {
    title: data.title,
    thumbnail: data.thumbnail,
    duration: data.duration,
    uploader: data.uploader,
    formats: data.formats?.map(f => ({
      format_id: f.format_id,
      ext: f.ext,
      resolution: f.resolution,
      url: f.url,
    })),
  };
}

async function downloadVideo(url) {
  const outputTemplate = path.join(__dirname, '../../downloads/%(id)s.%(ext)s');

  const args = [
    '-f', 'best[ext=mp4]',
    '-o', outputTemplate,
    '--no-playlist',
    '--print', 'after_move:filepath',
    url,
  ];

  const { stdout } = await runYtDlp(args);

  const lines = stdout.trim().split('\n').filter(Boolean);
  const filePath = lines[lines.length - 1];

  if (!filePath) {
    throw new Error('yt-dlp did not report a final file path (empty --print output)');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`yt-dlp reported success but file does not exist on disk: ${filePath}`);
  }

  const fileName = path.basename(filePath);
  return { filePath, fileName };
}

module.exports = { getVideoInfo, downloadVideo };