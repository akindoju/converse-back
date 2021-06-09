const users = [];

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.name === name && user.room === room
  );

  if (existingUser) {
    return { error: 'User already exists' };
  }

  const user = { id: id, name: name, room: room };

  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id); //returns first user with given id ese returns '-1'

  if (index !== -1) {
    return users.splice(index, 1)[0]; //at selected index, remove 1 item hence the '1' and returns the removed user in a seperate array hence '[0]'
  }
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
