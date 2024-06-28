const { SlashCommandBuilder, EmbedBuilder  } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Wyświetla statystyki postaci na podstawie id.')
    .addIntegerOption(option => 
      option.setName('id')
        .setDescription('ID postaci')
        .setRequired(true)),
  async execute(interaction) {
    const id = interaction.options.getInteger('id');

    // Sprawdź czy plik temp istnieje
    const tempFilePath = path.join(__dirname, '../../postacie_temp.json');
    const postacieFilePath = path.join(__dirname, '../../postacie.json');
    let postacie;

    if (fs.existsSync(tempFilePath)) {
      postacie = JSON.parse(fs.readFileSync(tempFilePath, 'utf8'));
    } else {
      postacie = JSON.parse(fs.readFileSync(postacieFilePath, 'utf8'));
    }

    // Znajdź postać o podanym ID
    const postac = postacie.find(p => p.id === id);

    if (!postac) {
      return interaction.reply(`Nie znaleziono postaci o ID ${id}.`);
    }

    // Przygotuj wiadomość z informacjami o postaci w formie osadzenia (embed)
    const embed = new EmbedBuilder()
      .setTitle(postac.Imię)
      .setDescription(`Rasa: ${postac.Rasa}\nKlasa: ${postac.Klasa}\nWiek: ${postac.Wiek}`)
      .setColor('#0099ff')
      .addFields(
        { name: 'WW', value: `${postac.Atrybuty.WW}`, inline: true },
        { name: 'US', value: `${postac.Atrybuty.US}`, inline: true },
        { name: 'SW', value: `${postac.Atrybuty.SW}`, inline: true },
        { name: 'INT', value: `${postac.Atrybuty.INT}`, inline: true },
        { name: 'S', value: `${postac.Atrybuty.S}`, inline: true },
        { name: 'ZR', value: `${postac.Atrybuty.ZR}`, inline: true },
        { name: 'ZW', value: `${postac.Atrybuty.ZW}`, inline: true },
        { name: 'SPO', value: `${postac.Atrybuty.SPO}`, inline: true },
        { name: 'ODP', value: `${postac.Atrybuty.ODP}`, inline: true },
        { name: 'CHAR', value: `${postac.Atrybuty.CHAR}`, inline: true },
        { name: 'SZCZ', value: `${postac.Atrybuty.SZCZ}`, inline: true },
      )
      .setFooter({ text: `Hej tu malonDice 8==B` });

    return interaction.reply({ embeds: [embed] });
  },
};
