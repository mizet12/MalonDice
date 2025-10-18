const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
var hpZabrane;
const filePath = path.join(__dirname, '../../', 'postacie.json');
const egzekucjaPath = path.join(__dirname, '../../egzekucja.json');

if (!fs.existsSync(egzekucjaPath)) {
    fs.writeFileSync(egzekucjaPath, JSON.stringify({ licznik: 0 }, null, 2), 'utf8');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('damage')
    .setDescription('Zadaje obrażenia jednemu lub więcej graczom')
    .addStringOption(option =>
      option.setName('gracze')
        .setDescription('ID graczy oddzielone spacją (np. 1 2 5)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('hp')
        .setDescription('Ilość punktów obrażeń')
        .setRequired(true)),

async execute(interaction) {
  const idTekst = interaction.options.getString('gracze');
  const dmg = interaction.options.getInteger('hp');
  const egzekucja = JSON.parse(fs.readFileSync(egzekucjaPath, 'utf8'));

  if (dmg <= 0) {
    await interaction.reply({ content: `🔴 Obrażenia muszą być większe niż 0!`, ephemeral: true });
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
  let laczneObrazenia = 0;

  ids.forEach(idStr => {
    const id = parseInt(idStr);
    const postacIndex = postacie.findIndex(p => p.id === id);
    if (postacIndex === -1) {
      odpowiedzi.push(`❌ Postać o ID ${id} nie istnieje.`);
      return;
    }

    const postac = postacie[postacIndex];
    const atrybuty = postac.Atrybuty;

    const dramatyczneWiadomosci = [
      "Uważaj na siebie", "O rany", "ZARAZ ZGINISZ", "Jesteś na granicy", "A teraz największa z prób",
      "Koniec jest bliski", "Więcej szans nie będzie", "Zbliża się czas twej śmierci", "Czas tyka",
      "Czy to już koniec?", "Czujesz na sobie dotyk kostuchy", 'A wiec to dlatego mówią na to "Kościej"',
      "To tyle?", "Zaraz do nich dołączysz", ". . ."
    ];
    const losowa = dramatyczneWiadomosci[Math.floor(Math.random() * dramatyczneWiadomosci.length)];

    let obrazenia = dmg;
    let zadane = 0;

    if (atrybuty.SHILD && atrybuty.SHILD > 0) {
      const shildZabrane = Math.min(atrybuty.SHILD, obrazenia);
      atrybuty.SHILD -= shildZabrane;
      obrazenia -= shildZabrane;
      zadane += shildZabrane;
    }

    const przed = atrybuty.HP;
    hpZabrane = Math.min(atrybuty.HP, obrazenia);
    atrybuty.HP = Math.max(przed - obrazenia, 0);
    const po = atrybuty.HP;
    zadane += hpZabrane;

    const shildBar = '🟦'.repeat(atrybuty.SHILD || 0);
    const hpBar = '🟩'.repeat(atrybuty.HP);
    const puste = '🟥'.repeat((atrybuty.HPMAX || 0) - atrybuty.HP);
    const pasek = `${atrybuty.HP} [${hpBar}${puste}${shildBar}] ${atrybuty.HPMAX}`;

    if (po === 0) {
      odpowiedzi.push(`# **${postac.Imię}** (ID ${id}) otrzymał **${dmg} obrażeń** i ma **(0 HP)**! \n\n# ***${losowa}*** \n\n${pasek}`);
    } else if (po < atrybuty.HPMAX / 2 && przed >= atrybuty.HPMAX / 2) {
      odpowiedzi.push(`# **${postac.Imię}** (ID ${id}) spadł poniżej 50% HP po otrzymaniu **${dmg} obrażeń**.\n${pasek}`);
    } else {
      odpowiedzi.push(`# **${postac.Imię}** (ID ${id}) otrzymał **${dmg} obrażeń**, teraz ma **${po} HP**.\n${pasek}`);
    }

    laczneObrazenia += zadane;

    if (id < 0 && po === 0) {
      const oryginalId = -id;
      const oryginal = postacie.find(p => p.id === oryginalId);
      if (oryginal && oryginal.Atrybuty) {
        const obrazeniaZKlonu = atrybuty.HPMAX;
        const hpPrzed = oryginal.Atrybuty.HP;
        oryginal.Atrybuty.HP = Math.max(oryginal.Atrybuty.HP - obrazeniaZKlonu, 0);
        const hpPo = oryginal.Atrybuty.HP;

        odpowiedzi.push(`💥 Klon **${postac.Imię}** (ID ${id}) został zniszczony! Oryginał (ID ${oryginalId}) otrzymuje **${obrazeniaZKlonu} obrażeń** i ma teraz **${hpPo} HP**.`);

        postacie.splice(postacIndex, 1);
      }
    }
  });

  egzekucja.licznik += hpZabrane;
  const pozostalo = Math.max(75 - egzekucja.licznik, 0);
  let info = `#  Licznik Egzekucji: ${egzekucja.licznik}/75`;
  info += pozostalo > 0 ? ` – pozostało ${pozostalo} do Egzekucji.\n` : ` –  Umiejętność *Egzekucja* jest dostępna!\n`;
  odpowiedzi.push(info);

  try {
    fs.writeFileSync(filePath, JSON.stringify(postacie, null, 2), 'utf8');
    fs.writeFileSync(egzekucjaPath, JSON.stringify(egzekucja, null, 2), 'utf8');
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ Błąd podczas zapisu danych.', ephemeral: true });
    return;
  }

  await interaction.reply({ content: odpowiedzi.join('\n'), ephemeral: false });
},
};