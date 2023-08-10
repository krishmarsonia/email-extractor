const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const emailRoutes = require("./routes/emailRoutes");

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(emailRoutes);

app.listen(5000, () => {
  console.log("Server Running");
});
