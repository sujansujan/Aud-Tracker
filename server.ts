import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Country code to Audible domain mapping (matching bonukai/MediaTracker)
  const countryDomains: Record<string, string> = {
    au: 'com.au',
    ca: 'ca',
    de: 'de',
    fr: 'fr',
    in: 'in',
    it: 'it',
    es: 'es',
    jp: 'co.jp',
    uk: 'co.uk',
    us: 'com',
  };

  const getDomain = (country: string = 'us') => {
    const code = country.toLowerCase();
    return countryDomains[code] || 'com';
  };

  // 1. Audible Search Proxy Endpoint (bonukai/MediaTracker Audible provider pattern)
  app.get('/api/audible/search', async (req, res) => {
    try {
      const query = (req.query.query || req.query.title || req.query.keywords || '') as string;
      const countryCode = ((req.query.country || req.query.marketplace || 'us') as string).toLowerCase();
      const numResults = parseInt((req.query.num_results || '50') as string, 10);

      if (!query.trim()) {
        return res.json({ products: [], total_results: 0 });
      }

      const domain = getDomain(countryCode);
      const audibleUrl = new URL(`https://api.audible.${domain}/1.0/catalog/products`);
      audibleUrl.searchParams.set('title', query.trim());
      audibleUrl.searchParams.set('num_results', String(numResults));
      audibleUrl.searchParams.set('response_groups', 'contributors,rating,media,product_attrs');
      audibleUrl.searchParams.set('image_sizes', '500,1000,2400');

      let response = await fetch(audibleUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      });

      // If title search yielded 0 or failed, fallback to keywords search
      if (!response.ok) {
        const fallbackUrl = new URL(`https://api.audible.${domain}/1.0/catalog/products`);
        fallbackUrl.searchParams.set('keywords', query.trim());
        fallbackUrl.searchParams.set('num_results', String(numResults));
        fallbackUrl.searchParams.set('response_groups', 'contributors,rating,media,product_attrs');
        fallbackUrl.searchParams.set('image_sizes', '500,1000,2400');

        response = await fetch(fallbackUrl.toString(), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36',
            'Accept': 'application/json',
          },
        });
      }

      if (!response.ok) {
        return res.status(response.status).json({ error: `Audible API error ${response.status}`, products: [] });
      }

      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      console.error('Audible search proxy error:', err);
      return res.status(500).json({ error: err.message || 'Internal error', products: [] });
    }
  });

  // 2. Audible Product Details Proxy Endpoint
  app.get('/api/audible/products/:asin', async (req, res) => {
    try {
      const { asin } = req.params;
      const countryCode = ((req.query.country || req.query.marketplace || 'us') as string).toLowerCase();
      const domain = getDomain(countryCode);

      const audibleUrl = new URL(`https://api.audible.${domain}/1.0/catalog/products/${asin}`);
      audibleUrl.searchParams.set('response_groups', 'contributors,rating,media,product_attrs');
      audibleUrl.searchParams.set('image_sizes', '500,1000,2400');

      const response = await fetch(audibleUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Audible API error ${response.status}` });
      }

      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      console.error('Audible details proxy error:', err);
      return res.status(500).json({ error: err.message || 'Internal error' });
    }
  });

  // Mount Vite or static dist
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
