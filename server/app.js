const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error.middleware");

const postsRoutes = require("./routes/posts.router");
const userRoutes = require("./routes/user.router");
const commentRoutes = require("./routes/comment.router");

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization']
}));

app.use('/images', express.static(path.join('images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/comment', commentRoutes);

app.use(errorMiddleware);

module.exports = app;