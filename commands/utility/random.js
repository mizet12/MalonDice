const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('Losuje liczbę od 1 do 6 i wybiera postać na podstawie jej id z pliku postacie.json'),
  async execute(interaction) {
    const dataPath = path.join(__dirname, '../../postacie.json');

    let jsonData;
    if (fs.existsSync(dataPath)) {
      jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } else {
      return interaction.reply('Nie znaleziono pliku postacie.json.');
    }

    const rollValue = Math.floor(Math.random() * 6) + 1;
    const character = jsonData.find(char => char.id === rollValue);
    if (!character) {
      return interaction.reply(`Nie znaleziono postaci z ID ${rollValue}.`);
    }

    const characterInfo = `
      **Imię:** ${character.Imię}`;

    await interaction.reply({
      content: `Wylosowano liczbę **${rollValue}**. Wylosowana postać to:\n${characterInfo}`,
      fetchReply: true
    });
  },
};
