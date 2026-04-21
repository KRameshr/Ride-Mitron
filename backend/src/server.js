import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import logger from "./utils/logger.js";

const startServer = async () => {
  try {
    // Database connection
    await connectDB();

    app.listen(env.port, () => {
      logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
