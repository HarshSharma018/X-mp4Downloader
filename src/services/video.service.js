const { exec } = require('child_process');
const path = require('path');

function getVideoInfo(url) {
  return new Promise((resolve, reject) => {
    const command = `yt-dlp -j "${url}"`;

    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) return reject(error);

      const data = JSON.parse(stdout);

      resolve({
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
      });
    });
  });
}

function downloadVideo(url) {
  return new Promise((resolve, reject) => {
    const outputTemplate = path.join(__dirname, '../../downloads/%(id)s.%(ext)s');
    const command = `yt-dlp -f "best[ext=mp4]" -o "${outputTemplate}" --print filename "${url}"`;

    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) return reject(error);

      const filePath = stdout.trim();
      const fileName = path.basename(filePath);

      resolve({ filePath, fileName });
    });
  });
}

module.exports = { getVideoInfo, downloadVideo };
