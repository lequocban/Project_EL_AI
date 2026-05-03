require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const env = require("./src/config/env.config");

const server = http.createServer(app);

server.listen(env.port, () => {
  console.log(`API server listening on port ${env.port}`);
});
