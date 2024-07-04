const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../musicPlayer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Toggles looping the queue'),
  async execute(interaction) {
    const isLooping = musicPlayer.toggleLoop();
    await interaction.reply(`Looping is now ${isLooping ? 'enabled' : 'disabled'}.`);
  },
};
