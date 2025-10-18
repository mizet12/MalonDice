const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mapa')
    .setDescription('Wysyła plik New_map_1.jpg jako wiadomość na czacie'),
  async execute(interaction) {
    await interaction.deferReply(); // Odpowiada natychmiast, żeby Discord nie wygasił interakcji

    const filePath = path.join(__dirname, '../../New_map.jpg');
    
    try {
      await interaction.editReply({ files: [filePath] }); // Edytuje odpowiedź, zamiast używać `reply`
    } catch (error) {
      console.error('Error sending the map:', error);
      await interaction.editReply('Wystąpił błąd podczas wysyłania mapy.');
    }
  },
};
