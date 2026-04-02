import express from "express";
import { createServer as createViteServer } from "vite";
import * as cheerio from "cheerio";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/news", async (req, res) => {
    try {
      const response = await fetch("https://www.f1news.ru/");
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const news: any[] = [];
      
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        const className = $(el).attr('class') || '';
        
        if (href && href.includes('/news/') && text.length > 20 && (className.includes('b-news-list__title') || className.includes('b-home-super-news__link'))) {
          // Try to find time
          let time = '';
          if (className.includes('b-news-list__title')) {
             time = $(el).closest('li').find('.b-news-list__time').text().trim() || $(el).closest('li').find('.b-news-list__date').text().trim();
          }
          
          news.push({
            id: href,
            title: text,
            link: href.startsWith('http') ? href : "https://www.f1news.ru" + href,
            time: time || 'Недавно'
          });
        }
      });

      // Deduplicate by link and limit to 20
      const uniqueNews = Array.from(new Map(news.map(item => [item.link, item])).values()).slice(0, 20);

      res.json({ news: uniqueNews });
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/weather/:city", async (req, res) => {
    try {
      const city = req.params.city;
      // Use lang=ru for Russian and format=j1 for JSON
      const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=ru`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ error: "Failed to fetch weather" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
