const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mapa')
    .setDescription('Wysyła plik New_map_1.jpg jako wiadomość na czacie'),
  async execute(interaction) {
    const filePath = path.join(__dirname, '../../New_map_1.jpg');
    
    try {
      await interaction.reply({ files: [filePath] });
    } catch (error) {
      console.error('Error sending the map:', error);
      await interaction.reply('Wystąpił błąd podczas wysyłania mapy.');
    }
  },
};
