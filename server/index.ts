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
  dbPassword: process.env.PASSWORD,
};

const pool = mysql.createPool({
  host: "sql926.main-hosting.eu",
  user: "u432861292_zehralouis",
  password: api.dbPassword,
  database: "u432861292_loura",
});

const promisePool = pool.promise();

const users = handler({
  resolve: async (p) => {
    const [rows] = await promisePool.query("SELECT * FROM `users`");
    return rows;
  },
});

const chat = handler({
  resolve: async (p) => {
    const [rows] = await promisePool.query("SELECT * FROM `chat2`");
    return rows;
  },
});

const addUser = handler({
  body: z.object({
    username: z.string().min(3),
    password: z.string().min(8),
  }),
  resolve: async ({ body }) => {
    const [insert] = await promisePool.query(
      "INSERT INTO `users` (username, password) VALUES('" +
        body.username +
        "','" +
        body.password +
        "')"
    );
    return { success: "Account Successfully Created!" };
  },
});

const sendMessage = handler({
  body: z.object({
    message: z.string(),
    author_id: z.number(),
  }),
  resolve: async ({ body }) => {
    const [insert] = await promisePool.query(
      "INSERT INTO `chat2` (message, author_id) VALUES('" +
        body.message +
        "','" +
        body.author_id +
        "')"
    );
    return { success: "Message Successfully Sent!" };
  },
});

const privateChat = handler({
  resolve: async (p) => {
    const [rows] = await promisePool.query("SELECT * FROM `bizimchat`");
    return rows;
  },
});

const sendPrivateMessage = handler({
  body: z.object({
    content: z.string(),
    author: z.number(),
  }),
  resolve: async (data) => {
    const [insert] = await promisePool.query(
      "INSERT INTO `bizimchat` (content, author) VALUES('" +
        data.body.content +
        "','" +
        data.body.author +
        "')"
    );
    return { success: "Message Successfully Sent!" };
  },
});

const tests = handler({
  resolve: async (p) => {
    const [rows] = await promisePool.query("SELECT * FROM `tests`");
    return rows;
  },
});

const exercices = handler({
  body: z.object({
    id: z.number(),
  }),
  resolve: async (data) => {
    const [rows] = await promisePool.query(
      "SELECT * FROM `exercices` WHERE ex_id =" + data.body.id
    );
    return rows;
  },
});

const allExercices = handler({
  body: z.object({
    offset: z.number(),
    limit: z.number(),
  }),
  resolve: async (data) => {
    const [rows] = await promisePool.query(
      "SELECT * FROM `exercices` LIMIT " +
        data.body.limit +
        " OFFSET " +
        data.body.offset
    );
    return rows;
  },
});

const addExercice = handler({
  body: z.object({
    turkish: z.string(),
    english: z.string(),
    french: z.string(),
    romanian: z.string(),
  }),
  resolve: async ({ body }) => {
    const [insert] = await promisePool.query(
      "INSERT INTO `exercices` (turkish, english, french, romanian) VALUES('" +
        body.turkish +
        "','" +
        body.english +
        "','" +
        body.french +
        "','" +
        body.romanian +
        "')"
    );
    return { success: "Exercice Added Successfully!" };
  },
});

const addTest = handler({
  body: z.object({
    start: z.number(),
    end: z.number(),
    author: z.string(),
    name: z.string(),
  }),
  resolve: async ({ body }) => {
    const [insert] = await promisePool.query(
      "INSERT INTO `tests` (start, end, author, name) VALUES('" +
        body.start +
        "','" +
        body.end +
        "','" +
        body.author +
        "','" +
        body.name +
        "')"
    );
    return { success: "Test Added Successfully!" };
  },
});

const lastId = handler({
  resolve: async (p) => {
    const [rows] = await promisePool.query(
      "SELECT MAX(ex_id) as last_id FROM `exercices`"
    );
    return rows;
  },
});

const lastUserId = handler({
  resolve: async (p) => {
    const [rows] = await promisePool.query(
      "SELECT MAX(users_id) as lastUserId FROM `users`"
    );
    return rows;
  },
});

// You can have multiple endpoints for the same route with different methods with the method function
const routes = {
  users: method({ GET: users }),
  chat: method({ GET: chat }),
  adduser: method({ POST: addUser }),
  sendmessage: method({ POST: sendMessage }),
  privatechat: method({ GET: privateChat }),
  sendprivatemessage: method({ POST: sendPrivateMessage }),
  tests: method({ GET: tests }),
  exercices: method({ POST: exercices }),
  allexercices: method({ POST: allExercices }),
  addexercice: method({ POST: addExercice }),
  addtest: method({ POST: addTest }),
  lastid: method({ GET: lastId }),
  lastuserid: method({ GET: lastUserId }),
};

// It is also possible to use HTTP Server
const app = express();

app.get("/", (req, res) => res.send(`Welcome on ${api.projectName}`));

app.use("", initBridge({ routes }).expressMiddleware());

app.listen(api.port, async () => {
  console.log(`Listening on port ${api.port}`);
});
