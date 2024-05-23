const { SlashCommandBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const musicPlayer = require('../../musicPlayer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the current track'),
  async execute(interaction) {
    const player = musicPlayer.getPlayer();

    if (!player) {
      return interaction.reply('There is no track currently playing.');
    }

    if (player.state.status === AudioPlayerStatus.Playing) {
      player.stop(true); // Zatrzymuje bieżący utwór i przechodzi do następnego w kolejce
      await interaction.reply('Skipped the current track.');
    } else {
      await interaction.reply('There is no track currently playing.');
    }
  },
};
