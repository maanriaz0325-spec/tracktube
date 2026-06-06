import express from "express";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy for YouTube
  app.get("/api/youtube", async (req, res) => {
    const { part, q, type, maxResults, id, forHandle, playlistId } = req.query;
    const API_KEY = process.env.YOUTUBE_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "YouTube API key not configured." });
    }

    try {
      let url = "";
      if (playlistId) {
        url = `https://www.googleapis.com/youtube/v3/playlistItems`;
      } else if (id && part?.toString().includes("statistics") && !req.query.videoId) {
         // This is a bit ambiguous in standard query params, let's just proxy based on the endpoint needed.
         // Actually, let's make it more explicit or just generic.
      }

      // To simplify, let's just make a generic proxy that appends the key
      // and routes to the correct YouTube endpoint based on a 'path' param
      const ytPath = req.query.ytPath as string;
      if (!ytPath) {
        return res.status(400).json({ error: "Missing ytPath parameter" });
      }

      // Filter out our internal params
      const params = { ...req.query };
      delete params.ytPath;
      params.key = API_KEY;

      const response = await axios.get(`https://www.googleapis.com/youtube/v3/${ytPath}`, {
        params
      });

      res.json(response.data);
    } catch (error: any) {
      console.error("YouTube Proxy Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to fetch from YouTube API" });
    }
  });

  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

startServer();

app.listen(3000, () => console.log("Local: http://localhost:3000"));
export default app;