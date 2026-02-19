const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
dotenv.config();



const app = express();
const PORT = process.env.PORT
const BASE_URL = process.env.BASE_URL
const MONGO_URI = process.env.MONGO_URI

app.use(
    cors({
        origin: [BASE_URL, "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
        credentials: true,
    })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

const userRouter = require("./routers/user.Route");
app.use("/api/v1/user", userRouter);





app.get("/", (req, res) => {
    res.send("Client is running MERN-CHAT API ");
});


if (!MONGO_URI) {
    console.error("DB_URL is missing. Please set it in your .env file");
} else {
    mongoose
        .connect(MONGO_URI)
        .then(() => {
            console.log("MongoDB connected successfully");
        })
        .catch((error) => {
            console.error("MongoDB connection error:", error.message);
        });
}

// Start server
app.listen(PORT, () => {
    console.log("Server is running on " + BASE_URL);
});


