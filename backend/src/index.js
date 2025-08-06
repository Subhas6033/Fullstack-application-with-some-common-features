import express from "express";
import connectDB from "./db/db.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

// Connect to DB and then run the server
connectDB()
  .then(() => {
    app.get("/", (req, res) => {
      res.send("Welcome to our Server");
    });

    app.on("ERROR", (err) =>
      console.log(`Issue to connect with server ${err}`)
    );

    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `Your server is running on : http://localhost:${process.env.PORT || 8000}`
      );
    });
  })
  .catch((err) => console.log(`MongoDB connection Failed :: ${err}`));
