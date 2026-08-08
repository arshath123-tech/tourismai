import express from "express";
import apiRouter from "./routes/index";

export function createBackendApp() {
  const app = express();
  app.use(express.json());

  // Mount central API Router
  app.use("/api", apiRouter);

  return app;
}
