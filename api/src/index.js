import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import { router } from './routes.js';

const required = ['MONGODB_URI', 'SESSION_SECRET', 'WEB_ORIGIN'];
for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);

await mongoose.connect(process.env.MONGODB_URI);
const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(session({
  name: 'mi.sid',
  secret: process.env.SESSION_SECRET,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI, collectionName: 'httpSessions' }),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true', maxAge: 1000 * 60 * 60 * 24 * 14 },
}));
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('origin') !== process.env.WEB_ORIGIN) return res.status(403).json({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'This request origin is not allowed.' } });
  return next();
});
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', router);
app.use((error, _req, res, _next) => {
  console.error('API request failed:', error.message);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed.' } });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`Mock interview API listening on ${port}`));
