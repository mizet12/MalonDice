const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('troska')
    .setDescription('Próba rzutu na umiejętność Azirbesta'),
  async execute(interaction) {
    let result
    const rollValue = Math.floor(Math.random() * 100) + 1;
    if(rollValue % 2 == 0){
        result = "Zmieścił się"
    }else{
        result = "Nie zmieścił się"
    }

    let replyContent = `Rzut na umięjętność troska: **${rollValue}**, **${result}**`;
    const reply = await interaction.reply({
        content: replyContent,
        fetchReply: true
      });
    
  },
};