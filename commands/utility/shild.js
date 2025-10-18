const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../', 'postacie.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shild')
    .setDescription('Dodaje SHILD do jednej lub więcej postaci')
    .addStringOption(option =>
      option.setName('gracze')
        .setDescription('ID graczy oddzielone spacją (np. 1 2 5)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('ilosc')
        .setDescription('Ilość SHILD do dodania')
        .setRequired(true)),

  async execute(interaction) {
    const idTekst = interaction.options.getString('gracze');
    const ile = interaction.options.getInteger('ilosc');

    if (ile <= 0) {
      await interaction.reply({ content: `🔴 Wartość SHILD musi być większa niż 0!`, ephemeral: true });
      return;
    }

    const ids = idTekst.split(/\s+/).map(id => parseInt(id.trim())).filter(Boolean);
    let postacie;

    try {
      postacie = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Nie udało się wczytać danych postaci.', ephemeral: true });
      return;
    }

    const odpowiedzi = [];

    ids.forEach(id => {
      const postac = postacie.find(p => p.id === id);

      if (!postac) {
        odpowiedzi.push(`❌ Postać o ID ${id} nie istnieje.`);
        return;
      }

      if (!postac.Atrybuty.SHILD) postac.Atrybuty.SHILD = 0;

      postac.Atrybuty.SHILD += ile;

      const hp = postac.Atrybuty.HP;
      const max = postac.Atrybuty.HPMAX;
      const shild = postac.Atrybuty.SHILD;

      const pelne = '🟩'.repeat(hp);
      const puste = '🟥'.repeat(max - hp);
      const tarcza = '🟦'.repeat(shild);
      const pasek = `${hp} + ${shild} [${pelne}${puste}${tarcza}] ${max}`;

      odpowiedzi.push(`# 🛡️ **${postac.Imię}** (ID ${id}) otrzymał **+${ile} SHILD**.
# ${pasek}`);
    });

    try {
      fs.writeFileSync(filePath, JSON.stringify(postacie, null, 2), 'utf8');
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Nie udało się zapisać danych postaci.', ephemeral: true });
      return;
    }

    await interaction.reply({ content: odpowiedzi.join('\n'), ephemeral: false });
  },
};