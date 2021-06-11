const express = require('express');
const http = require('http');
const router = require('./router');
const cors = require('cors');
const socketio = require('socket.io');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    //allows you to emit custom events on the server and client.
    socket.emit('message', {
      user: 'admin',
      text: `Hello ${user.name}, welcome to ${user.room} `,
    });

    //sends message to everyone in the room except user that just joined
    socket.broadcast
      .to(user.room)
      .emit('message', { user: 'admin', text: `${user.name} joined the room` });

    socket.join(user.room); //adds user to specific room

    //getting users in particular room
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback(); //so that callback at clientside runs, but it takes no props so if there exists no error, it still runs but has no effect on the clientside
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', {
        user: 'admin',
        text: `${user.name} left the room`,
      });

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
