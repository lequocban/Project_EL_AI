const express = require("express");
const v1Routes = require("./api/v1/routes");
const { errorHandler } = require("./utils/errorHandler");

const app = express();

app.use(express.json());
app.use("/api/v1", v1Routes);
app.use(errorHandler);

module.exports = app;
