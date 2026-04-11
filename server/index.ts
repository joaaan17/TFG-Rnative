import express from 'express';
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

// Evitar que promesas no capturadas o excepciones inesperadas maten el proceso
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ [Server] unhandledRejection (ignorado):', reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️ [Server] uncaughtException (ignorado):', err);
});

app.use(
  cors({
    origin: true, // Refleja el origen del request — permite todos los orígenes
    credentials: true,
  }),
);
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/relationships', relationshipsRoutes);
app.use('/api/iapreguntas', iapreguntasRoutes);
app.use('/api/ia-noticias', iaNoticiasRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/market-chart', marketChartRoutes);
app.use('/api/market', marketRouter);

// --- 3. Inicialización (Base de Datos + Servidor) ---
const startServer = async () => {
  try {
    // A) Conexión a Mongo
    console.log('⏳ Conectando a MongoDB...');
    await mongoose.connect(authEnv.dbUri);
    console.log('✅ MongoDB Conectado exitosamente');

    // B) Levantar Servidor Express ANTES de los schedulers
    const PORT = Number(process.env.PORT) || 3000;
    console.log(`⏳ Intentando escuchar en puerto ${PORT}...`);

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
      console.log(`📡 NODE_ENV=${process.env.NODE_ENV}`);
    });

    server.on('error', (err) => {
      console.error('❌ Error en app.listen():', err);
      process.exit(1); // Forzar reinicio de Railway si el puerto falla
    });

    // C) Schedulers en background (después de que el servidor ya escucha)
    try { startPriceCacheWarmup(); } catch (e) { console.error('⚠️ PriceCache warmup error:', e); }
    try { startQuizScheduler(); } catch (e) { console.error('⚠️ QuizScheduler error:', e); }

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    // NO process.exit() — dejamos que Railway reinicie si es necesario
  }
};

startServer();
