const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('id')
    .setDescription('Rolls a random value and checks against a character attribute')
    .addIntegerOption(option => 
      option.setName('id')
        .setDescription('The ID of the character')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('attribute')
        .setDescription('The name of the attribute')
        .setRequired(true)),
  async execute(interaction) {
    const characterId = interaction.options.getInteger('id');
    const attributeName = interaction.options.getString('attribute').toUpperCase();

    const dataPath = path.join(__dirname, '../../postacie.json');
    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const character = jsonData.characters.find(char => char.id === characterId);
    if (!character) {
      return interaction.reply(`Character with ID ${characterId} not found.`);
    }

    const attributeValue = character.Atrybuty[attributeName];
    if (attributeValue === undefined) {
      return interaction.reply(`Attribute ${attributeName} not found for character ${character.Imię}.`);
    }

    const rollValue = Math.floor(Math.random() * 100) + 1;
    const result = rollValue <= attributeValue ? 'Zmieścił się' : 'Nie zmieścił się';

    return interaction.reply(`**${character.Imię}** rollował na statystyke **${attributeName}**. Wylosował **${rollValue}**. ***${result}***.`);
  },
};
