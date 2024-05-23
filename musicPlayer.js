// musicPlayer.js

let player = null;
let connection = null;

module.exports = {
    getPlayer: () => player,
    setPlayer: (newPlayer) => { player = newPlayer; },
    getConnection: () => connection,
    setConnection: (newConnection) => { connection = newConnection; },
};
