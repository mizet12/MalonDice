const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = './postacie.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('split')
    .setDescription('Tworzy klona postaci z podzielonymi statystykami')
    .addIntegerOption(option =>
      option.setName('id')
        .setDescription('ID postaci do podziału')
        .setRequired(true)),

  async execute(interaction) {
    const id = interaction.options.getInteger('id');
    const cloneId = -id;

    // Wczytaj dane
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (err) {
      return interaction.reply('❌ Błąd podczas wczytywania pliku postacie.json.');
    }

    // Sprawdź czy klon już istnieje
    if (data.find(p => p.id === cloneId)) {
      return interaction.reply(`⚠️ Klon o ID ${cloneId} już istnieje.`);
    }

    // Znajdź postać do sklonowania
    const original = data.find(p => p.id === id);
    if (!original) {
      return interaction.reply(`❌ Postać o ID ${id} nie istnieje.`);
    }

    // Stwórz głęboką kopię postaci
    const clone = JSON.parse(JSON.stringify(original));
    clone.id = cloneId;
    clone.Imię = `${clone.Imię} (Klon)`;
    clone.Atrybuty.SHILD = 0;

    // Podziel wszystkie liczby w Atrybutach przez 2
    for (const key in clone.Atrybuty) {
      if (typeof clone.Atrybuty[key] === 'number') {
        clone.Atrybuty[key] = Math.floor(clone.Atrybuty[key] / 2);
      }
    }
    clone.Atrybuty.HP = clone.Atrybuty.HPMAX;

    // Dodaj klona do danych i zapisz
    data.push(clone);

    try {
      fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
      return interaction.reply(`✅ Klon postaci o ID ${id} został utworzony jako ID ${cloneId}.`);
    } catch (err) {
      return interaction.reply('❌ Błąd podczas zapisywania do pliku postacie.json.');
    }
  }
};
