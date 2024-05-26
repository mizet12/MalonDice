const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../musicPlayer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Displays the current queue of tracks')
    .addIntegerOption(option => 
      option.setName('page')
        .setDescription('The page number of the queue to display')
        .setRequired(false)),
  async execute(interaction) {
    const queue = musicPlayer.getQueue();
    const itemsPerPage = 10;
    const page = interaction.options.getInteger('page') || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const totalPages = Math.ceil(queue.length / itemsPerPage);

    if (!queue.length) {
      return interaction.reply('The queue is currently empty.');
    }

    if (page > totalPages || page < 1) {
      return interaction.reply(`Invalid page number. Please choose a page between 1 and ${totalPages}.`);
    }

    const queueDisplay = queue.slice(startIndex, endIndex).map((track, index) => `${startIndex + index + 1}. ${track}`).join('\n');

    const embed = {
      color: 0x0099ff,
      title: 'Current Queue',
      description: queueDisplay,
      footer: {
        text: `Page ${page} of ${totalPages}`,
      },
    };

    await interaction.reply({ embeds: [embed] });
  },
};
