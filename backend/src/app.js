import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Enable CORS with specific origin and credentials support
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Parse incoming JSON requests with a size limit of 20kb
app.use(
  express.json({
    limit: "20kb",
  })
);

// Parse URL-encoded data with a size limit of 20kb
app.use(
  express.urlencoded({
    extended: true,
    limit: "20kb",
  })
);

// Serve static files from the "public" directory
app.use(express.static("public"));

// Parse cookies attached to client requests
app.use(cookieParser());


// Routes
import userRouter from './routes/user.routes.js'

// Routes Declaration
app.use("/api/v1/users", userRouter)

export { app };
