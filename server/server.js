const app = require("./app");
const debug = require("debug")("node-angular");
const http = require("http");
const { Server } = require('socket.io');

const normalizePort = val => {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const onError = error => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  server.address();
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);
const socketIOServer = new Server(server, {
  cors: {
    origin: "http://localhost:4200"  // TODO should be removed - added for local testing
  }
});
server.on("error", onError);
server.on("listening", onListening);
server.listen(port);

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
