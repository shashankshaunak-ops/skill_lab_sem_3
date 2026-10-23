import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function start(): Promise<void> {
  await connectDatabase();
  app.listen(env.port, () => {
    console.info(`CampusConnect API listening on http://localhost:${env.port}`);
  });
}

start().catch((error: unknown) => {
  console.error("The API could not start.", error);
  process.exitCode = 1;
});
