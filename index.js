const express = require("express");
const app = express();
const cors = require("cors");
const paymentRoute = require("./routes/payment");
const helmet = require("helmet");
const compression = require("compression");
//given access to dotenv variable
require("dotenv").config();
// const process = require("process");
// if (process.env.NODE_ENV !== "production") {
const PORT = process.env.PORT || 3006;
// }

// Connect to MongoDB
const mongoose = require("mongoose");
const db = process.env.MONGODB_URI;

// const db = process.env.OffLineMongoURI;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true,
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
  })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));
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
