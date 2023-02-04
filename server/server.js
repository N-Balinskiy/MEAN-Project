const app = require("./app");
const http = require("http");
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const port = process.env.PORT || "3000";
app.set("port", port);

const server = http.createServer(app);
const socketIOServer = new Server(server, {
  cors: {
    origin: "http://localhost:4200"  // TODO should be removed - added for local testing
  }
});

const start = async () => {
  try {
    server.listen(port, () => console.log(`Server started on PORT = ${ port }`));
    await mongoose.set('strictQuery', true);
    await mongoose.connect("mongodb+srv://Desonancen:" + process.env.MONGO_ATLAS_PW + "@cluster0.zsqfhdp.mongodb.net/node-angular?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
        .then(() => {
          console.log('Connected to db');
        })
        .catch((e) => {
          console.log(e, 'Connection blocked');
        })
  }
  catch (e) {
    console.log(e)
  }
}
start();

socketIOServer.sockets.on('connection', (socket) => {
  console.log('Socket connected');

  socket.on('createPost', (post) => {
    socketIOServer.emit('createPost', post);
    console.log('Create Post socket emitted');
  });

  socket.on('updatePost', (post) => {
    socketIOServer.emit('updatePost', post);
    console.log('Update Post socket emitted');
  });

  socket.on('deletePost', (post) => {
    socketIOServer.emit('deletePost', post);
    console.log('Delete Post socket emitted');
  });
});
