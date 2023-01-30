import {
  initBridge,
  handler,
  onError,
  StatusCode,
  httpError,
  apply,
  method,
} from "bridge";
import express from "express";
// You can also use Yup or Superstruct for data validation
import z from "zod";
import dotenv from "dotenv";
import path from "path";
const mysql = require("mysql2");

if (!process.env.PORT) dotenv.config({ path: path.join(".env") });

const api = {
  port: process.env.PORT,
  projectName: process.env.projectName,
  serverUrl: process.env.SERVER_URL,
};

const pool = mysql.createPool({
  host: "sql926.main-hosting.eu",
  user: "u432861292_zehralouis",
  password: "Lamia2612",
  database: "u432861292_loura",
});

const promisePool = pool.promise();

const test = handler({
  resolve: async (p) => {
    const [rows] = await promisePool.query("SELECT * FROM `chat`");
    return rows;
  },
});

// You can have multiple endpoints for the same route with different methods with the method function
const routes = {
  test: method({ GET: test }),
};

// It is also possible to use HTTP Server
const app = express();

app.get("/", (req, res) => res.send(`Welcome on ${api.projectName}`));

app.use("", initBridge({ routes, url: api.serverUrl }).expressMiddleware());

app.listen(api.port, async () => {
  console.log(`Listening on port ${api.port}`);
});
