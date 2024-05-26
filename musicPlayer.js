let player = null;
let connection = null;
let queue = [];
let savedQueue = []; // Dodajemy zmienną do przechowywania zapisanej kolejki

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
  },
  shuffleQueue: () => {
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
  },
  saveQueue: () => {
    savedQueue = [...queue]; // Zapisuje bieżącą kolejkę
  },
  restoreQueue: () => {
    queue = [...savedQueue]; // Przywraca zapisaną kolejkę
  }
};
