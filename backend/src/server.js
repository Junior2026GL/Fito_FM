import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { testDatabaseConnection } from "./infrastructure/database/connection.js";

const startServer = async () => {
  try {
    await testDatabaseConnection();

    const app = createApp();

    app.listen(env.PORT, () => {
      console.log(`Servidor fito_fm ejecutándose en http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
