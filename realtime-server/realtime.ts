// This is a barebones realtime server for the activity.
// It is **not secure** and should not be used in production.

const { Server } = require('socket.io');

const io = new Server(3001);

const gameState = new Map();
const DEFAULT_STATE = {
  prompt: '',
  imageUrl: '',
  loadingPercentage: 0,
};

function getUserState(channelId, userId) {
  return gameState.get(channelId)?.[userId] || DEFAULT_STATE;
}

io.on('connection', (socket) => {
  console.log('New connection: ', socket.id);

  // Add a user to their channel's room
  socket.on('join', (channelId) => {
    console.log('User joined channel: ', channelId);

    socket.join(channelId);
    socket.emit('gameStateUpdate', gameState.get(channelId) || {});
  });

  // When a user updates their state
  socket.on('updateState', (channelId, userId, state) => {
    gameState.set(channelId, {
      ...gameState.get(channelId),
      [userId]: { ...getUserState(channelId, userId), ...state },
    });
    io.to(channelId).emit('gameStateUpdate', gameState.get(channelId));
  });
});

console.log('Websocket server is running on port 3001');
