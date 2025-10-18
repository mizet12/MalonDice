const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
    const postacieFilePath = path.join(__dirname, '../../postacie.json');

    let postacie;
    try {
      postacie = JSON.parse(fs.readFileSync(postacieFilePath, 'utf8'));
    } catch (err) {
      console.error(err);
      return interaction.reply('❌ Błąd przy wczytywaniu danych postaci.');
    }

    const postac = postacie.find(p => p.id === id);

    if (!postac) {
      return interaction.reply(`❌ Nie znaleziono postaci o ID ${id}.`);
    }

    const hp = postac.Atrybuty.HP;
    const hpmax = postac.Atrybuty.HPMAX;
    const shild = postac.Atrybuty.SHILD;
    const pelne = '🟩'.repeat(hp);
    const puste = '🟥'.repeat(hpmax - hp);
    const shil = '🟦'.repeat(shild);
    var pasekHP;
    if(shild > 0){
      pasekHP = `# ${hp} + ${shild} [${pelne}${puste}${shil}] ${hpmax}`;
    }else{
      pasekHP = `# ${hp} [${pelne}${puste}${shil}] ${hpmax}`;
    }
  

    const embed = new EmbedBuilder()
      .setTitle(postac.Imię)
      .setDescription(` Rasa: ${postac.Rasa}\n Klasa: ${postac.Klasa}\n Wiek: ${postac.Wiek}`)
      .setColor('#0099ff')
      .addFields(
        { name: ' HP', value: pasekHP, inline: false },
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
