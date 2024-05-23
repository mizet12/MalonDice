// skip.js

const { SlashCommandBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice'); // Dodajemy import AudioPlayerStatus
const musicPlayer = require('../../musicPlayer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the current song'),
  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      return interaction.reply('You need to be in a voice channel to use this command.');
    }

    const player = musicPlayer.getPlayer();
    const connection = musicPlayer.getConnection();

    if (!player || !connection) {
      return interaction.reply('No song is currently being played.');
    }

    await interaction.deferReply();

    if (player.state.status !== AudioPlayerStatus.Idle) { // Tutaj korzystamy z AudioPlayerStatus
      player.stop();
      await interaction.followUp('Skipped the current song.');
    } else {
      await interaction.followUp('No song is currently being played.');
    }
  },
};
