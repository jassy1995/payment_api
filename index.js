const express = require("express");
const app = express();
const cors = require("cors");
const paymentRoute = require("./routes/payment");
const helmet = require("helmet");
const compression = require("compression");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const PORT = process.env.PORT || 3006;
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/payment", paymentRoute);

app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/index.html");
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
