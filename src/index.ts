import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import MemoryStoreFactory from 'memorystore';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { checkDB } from './databaseMiddleware/mySqlConnection';
import { verifyClient } from './JWT/jwtMiddleware';
import { logger } from './utils/winstonLogger';
import initializeDatabase from './databaseMiddleware/createSchema';

import {
  adminRoutes,
  authorRoutes,
  bookRoutes,
  bookPropsRoutes,
  giftshopRoutes,
  imageRoutes,
  infoRoutes,
  linksRoutes,
  messagesRoutes,
  newsRoutes,
  ordersRoutes,
  productDimRoutes,
  publicRoutes,
  reviewsRoutes,
  sysRoutes
} from './routes';

const port = process.env.PORT || 3001;
const MemoryStore = MemoryStoreFactory(session);
const app = express();

const allowlist = (process.env.CORS_ALLOWLIST ||
  'http://localhost:3000/,http://localhost:3001/')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function corsOptionsDelegate(req: express.Request, callback: (err: Error | null, options: cors.CorsOptions) => void) {
  let corsOptions: cors.CorsOptions;
  if (allowlist.indexOf(req.header('Origin') || '') !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
}

initializeDatabase();

app.use((req, res, next) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    allowlist[0] || 'http://localhost:3000/'
  );
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.resolve(__dirname, './client')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || ''));

app.use(
  session({
    key: process.env.COOKIE_KEY,
    secret: process.env.COOKIE_SECRET || '',
    store: new MemoryStore({
      checkPeriod: 86400000
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      maxAge: 1000 * 60 * 60 * 24 * 3
    }
  } as session.SessionOptions)
);

app.use('/api/books', checkDB, verifyClient, bookRoutes);
app.use('/api/authors', checkDB, verifyClient, authorRoutes);
app.use('/api/giftshop', checkDB, verifyClient, giftshopRoutes);
app.use('/api/reviews', checkDB, verifyClient, reviewsRoutes);
app.use('/api/news', checkDB, verifyClient, newsRoutes);
app.use('/api/infopages', checkDB, verifyClient, infoRoutes);
app.use('/api/links', checkDB, verifyClient, linksRoutes);
app.use('/api/public', checkDB, verifyClient, publicRoutes);
app.use('/api/orders', checkDB, verifyClient, ordersRoutes);
app.use('/api/system', checkDB, sysRoutes);
app.use('/api/messages', checkDB, verifyClient, messagesRoutes);
app.use('/api/admin', verifyClient, adminRoutes);
app.use('/api/images', checkDB, verifyClient, imageRoutes);
app.use('/api/productdimensions', checkDB, verifyClient, productDimRoutes);
app.use('/api/bookprops', checkDB, verifyClient, bookPropsRoutes);

app.get('*', checkDB, (req, res) => {
  res.sendFile(path.resolve(__dirname, './client', 'index.html'));
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { status = 500, message = 'Unknown internal error' } = err;
  logger.error(`status: ${status}; message: ${message}`);
  res.status(status).send(err);
  next();
});

app.listen(port, () => {
  logger.info(`Crisinus server application is listening on port; ${port}, with start on: ${new Date()}`);
});
