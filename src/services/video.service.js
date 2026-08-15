const { exec } = require('child_process');

function getVideoInfo(url) {
  return new Promise((resolve, reject) => {
    const command = `yt-dlp -j "${url}"`;

    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

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

module.exports = { getVideoInfo };
