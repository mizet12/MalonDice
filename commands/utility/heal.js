const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../', 'postacie.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('heal')
    .setDescription('Leczy jednego lub więcej graczy o daną ilość HP')
    .addStringOption(option =>
      option.setName('gracze')
        .setDescription('ID graczy oddzielone spacją (np. 1 2 5)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('hp')
        .setDescription('Ilość punktów HP do leczenia')
        .setRequired(true)),

  async execute(interaction) {
    const idTekst = interaction.options.getString('gracze');
    const leczHp = interaction.options.getInteger('hp');

    if (leczHp <= 0) {
      await interaction.reply({ content: `🔴 Wartość leczenia musi być większa niż 0!`, ephemeral: true });
      return;
    }

    const ids = idTekst.split(/\s+/).map(id => id.trim()).filter(Boolean);
    let postacieData;

    try {
      postacieData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Nie udało się wczytać danych z pliku.', ephemeral: true });
      return;
    }

    const postacie = Array.isArray(postacieData) ? postacieData : [postacieData];
    const odpowiedzi = [];

    ids.forEach(idStr => {
      const id = parseInt(idStr);
      const postac = postacie.find(p => p.id === id);

      if (!postac) {
        odpowiedzi.push(`❌ Postać o ID ${id} nie istnieje.`);
        return;
      }

      const atrybuty = postac.Atrybuty;
      const przed = atrybuty.HP;
      atrybuty.HP = Math.min(atrybuty.HP + leczHp, atrybuty.HPMAX);
      const po = atrybuty.HP;

      const shildBar = '🟦'.repeat(atrybuty.SHILD || 0);
      const hpBar = '🟩'.repeat(atrybuty.HP);
      const puste = '🟥'.repeat(atrybuty.HPMAX - atrybuty.HP);
      var pasek;
      if(atrybuty.SHILD > 0){
        pasek = `${atrybuty.HP} + ${atrybuty.SHILD} [${hpBar}${puste}${shildBar}] ${atrybuty.HPMAX}`;
      }else{
        pasek = `${atrybuty.HP} [${hpBar}${puste}${shildBar}] ${atrybuty.HPMAX}`;
      }

      if (po === atrybuty.HPMAX) {
        odpowiedzi.push(`# **${postac.Imię}** (ID ${id}) został całkowicie wyleczony do **${po}/${atrybuty.HPMAX} HP**!\n${pasek}`);
      } else {
        odpowiedzi.push(`# **${postac.Imię}** (ID ${id}) wyleczony z **${przed}** do **${po}** HP.\n${pasek}`);
      }
    });

    try {
      fs.writeFileSync(filePath, JSON.stringify(postacie, null, 2), 'utf8');
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Błąd podczas zapisu danych.', ephemeral: true });
      return;
    }

    await interaction.reply({ content: odpowiedzi.join('\n'), ephemeral: false });
  },
};
