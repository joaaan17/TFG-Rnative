import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { authEnv } from './config/auth.env';
import authRoutes from './api/api.routes';

const app = express();
app.use(cors()); // Permite peticiones desde otros dominios/puertos
app.use(express.json());
app.use('/api/auth', authRoutes);

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
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
