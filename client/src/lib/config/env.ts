import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') }); // Carga las variables de entorno desde el archivo .env

/**
 * Objeto que contiene las variables de entorno de la aplicación.
 * Es una buena práctica centralizar el acceso a process.env para
 * tener un único punto de verdad y facilitar el tipado.
 */
export const env = {
  // Puerto para el servidor. Si no está definido, se usa el 3001 por defecto.
  PORT: process.env.PORT || '3001',

  // URI de la base de datos MongoDB.
  // Es crucial que esta variable esté definida en el archivo .env.
  MONGODB_URI: process.env.MONGODB_URI || '',

  // Secreto para firmar los JSON Web Tokens (JWT).
  // ¡IMPORTANTE! Este valor DEBE ser largo, aleatorio y guardado de forma segura.
  // No se recomienda tener un valor por defecto quemado en el código.
  JWT_SECRET: process.env.JWT_SECRET || '',

  // Orígenes permitidos para CORS. Para desarrollo puede ser '*'.
  // En producción, debería ser una lista de dominios permitidos.
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Entorno de la aplicación (ej. 'development', 'production', 'test').
  NODE_ENV: process.env.NODE_ENV || 'development',

  // --- Configuración de Stripe ---
  // ¡IMPORTANTE! Usar claves de prueba para desarrollo.
  STRIPE_SECRET: process.env.STRIPE_SECRET || '',
  STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/home/donaciones/success',
  STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/home/donaciones/cancel',

  //--- COnfiguración Coudinary
  // precarga: petconnect-pc
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_NAME || 'do1efktan',
  CLOUDINARY_API_KEY: process.env.API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.API_SECRET || '',
};
