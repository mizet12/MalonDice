// musicPlayer.js
let player = null;
let connection = null;
let queue = [];

module.exports = {
  getPlayer: () => player,
  setPlayer: (newPlayer) => {
    player = newPlayer;
  },
  getConnection: () => connection,
  setConnection: (newConnection) => {
    connection = newConnection;
  },
  getQueue: () => queue,
  addToQueue: (track) => {
    queue.push(track);
  },
  clearQueue: () => {
    queue = [];
  },
  skipTrack: () => {
    if (queue.length > 0) {
      return queue.shift();
    } else {
      return null;
    }
  }
};
