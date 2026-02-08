import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { authEnv } from '../features/auth/back/src/config/auth.env';
import authRoutes from '../features/auth/back/src/api/api.routes';
import profileRoutes from '../features/profile/back/src/api/api.routes';
import relationshipsRoutes from '../features/relationships/back/src/api/api.routes';
import iapreguntasRoutes from '../features/IApreguntas/back/src/api/api.routes';
import iaNoticiasRoutes from '../features/iaNoticiasEducativas/back/src/api/api.routes';
import investmentsRoutes from '../features/investments/back/src/api/api.routes';
import marketChartRoutes from '../features/market-chart/back/src/api/api.routes';
import { startQuizScheduler } from '../features/iaNoticiasEducativas/back/src/config/quiz-scheduler';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/relationships', relationshipsRoutes);
app.use('/api/iapreguntas', iapreguntasRoutes);
app.use('/api/ia-noticias', iaNoticiasRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/market-chart', marketChartRoutes);

// --- 3. Inicialización (Base de Datos + Servidor) ---
const startServer = async () => {
  try {
    // A) Conexión a Mongo
    console.log('⏳ Conectando a MongoDB...');
    await mongoose.connect(authEnv.dbUri);
    console.log('✅ MongoDB Conectado exitosamente');

    // B) Levantar Servidor Express
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(
        `📡 Endpoint de Auth listo en http://localhost:${PORT}/api/auth/login`,
      );
      console.log(
        `📋 Quiz listo en POST http://localhost:${PORT}/api/ia-noticias/quiz`,
      );
      startQuizScheduler();
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
