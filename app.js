const path = require("path");
const cors = require("cors");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "/controllers/images/"));
    // cb(null, "images");
    // cb(null, __dirname);
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  cors({
    origin: "*",
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
  // if (req.method === "OPTIONS") {
  //   return req.text("", 200);
  // } else {
  //   return next();
  // }
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    // "mongodb+srv://IrfanAsgher:1jVH2A6PqVcCmC3O@cluster0.odflidq.mongodb.net/laverage?retryWrites=true&w=majority"
    "mongodb://IrfanAsgher:1jVH2A6PqVcCmC3O@ac-7bk8cua-shard-00-00.odflidq.mongodb.net:27017,ac-7bk8cua-shard-00-01.odflidq.mongodb.net:27017,ac-7bk8cua-shard-00-02.odflidq.mongodb.net:27017/laverage?ssl=true&replicaSet=atlas-8adlfw-shard-0&authSource=admin&retryWrites=true&w=majority"
  )
  .then((result) => {
    const server = app.listen(8080);
    console.log("Connected!...");
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client connected");
    });
  })
  .catch((err) => console.log(err));
