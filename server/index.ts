import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { authEnv } from '../features/auth/back/src/config/auth.env';
import authRoutes from '../features/auth/back/src/api/api.routes';
import profileRoutes from '../features/profile/back/src/api/api.routes';
import relationshipsRoutes from '../features/relationships/back/src/api/api.routes';
import iapreguntasRoutes from '../features/IApreguntas/back/src/api/api.routes';
import iaNoticiasRoutes from '../features/iaNoticiasEducativas/back/src/api/api.routes';
import { startQuizScheduler } from '../features/iaNoticiasEducativas/back/src/config/quiz-scheduler';
import investmentsRoutes from '../features/investments/back/src/api/api.routes';
import marketChartRoutes from '../features/market-chart/back/src/api/api.routes';
import {
  marketRouter,
  startPriceCacheWarmup,
} from '../features/market/back/src';

const app = express();

// --- Safety nets a nivel de proceso ---
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ [Server] unhandledRejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('🔴 [Server] uncaughtException — cerrando proceso:', err);
  process.exit(1);
});

// --- Middleware ---
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());

// --- Rutas ---
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/relationships', relationshipsRoutes);
app.use('/api/iapreguntas', iapreguntasRoutes);
app.use('/api/ia-noticias', iaNoticiasRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/market-chart', marketChartRoutes);
app.use('/api/market', marketRouter);

// --- Health-check (Railway / balanceadores) ---
app.get('/health', (_req, res) => {
  const mongoOk = mongoose.connection.readyState === 1;
  res.status(mongoOk ? 200 : 503).json({ ok: mongoOk });
});

// --- Error handler global: captura errores de async handlers y devuelve 500 ---
// Express solo lo invoca si tiene 4 parámetros (err, req, res, next).
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message =
    err instanceof Error ? err.message : 'Error interno del servidor';
  console.error('🔴 [Express] Error no capturado en handler:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: message });
  }
});

// --- Inicialización ---
const startServer = async () => {
  // A) Conexión a MongoDB
  console.log('⏳ Conectando a MongoDB...');
  try {
    await mongoose.connect(authEnv.dbUri);
    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    console.error('❌ Fallo al conectar MongoDB — proceso terminado:', error);
    process.exit(1);
  }

  // Listeners de Mongoose para desconexiones en runtime
  mongoose.connection.on('disconnected', () => {
    console.warn(
      '⚠️ [Mongoose] Desconectado de MongoDB — se intentará reconectar automáticamente',
    );
  });
  mongoose.connection.on('reconnected', () => {
    console.log('✅ [Mongoose] Reconexión a MongoDB exitosa');
  });
  mongoose.connection.on('error', (err) => {
    console.error('🔴 [Mongoose] Error de conexión en runtime:', err);
  });

  // B) Levantar servidor HTTP
  const PORT = Number(process.env.PORT) || 3000;
  console.log(`⏳ Intentando escuchar en puerto ${PORT}...`);

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    console.log(`📡 NODE_ENV=${process.env.NODE_ENV}`);
  });

  server.on('error', (err) => {
    console.error('❌ Error en app.listen():', err);
    process.exit(1);
  });

  // C) Schedulers en background (no deben tumbar el servidor si fallan)
  try {
    startPriceCacheWarmup();
  } catch (e) {
    console.error('⚠️ PriceCache warmup error:', e);
  }
  try {
    startQuizScheduler();
  } catch (e) {
    console.error('⚠️ QuizScheduler error:', e);
  }
};

startServer();
