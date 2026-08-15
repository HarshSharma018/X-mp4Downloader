const { getVideoInfo } = require('../services/video.service');

async function createDownload(req, res) 
{
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }


  if (!/^https?:\/\/(x\.com|twitter\.com)\//.test(url)) {
    return res.status(400).json({ error: 'url must be a valid twitter/x link' });
  }

  
  try {
    const info = await getVideoInfo(url);
    res.status(200).json(info);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch video info' });
  }
  
}

module.exports = { createDownload };
