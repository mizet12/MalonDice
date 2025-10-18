const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../postacie.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aura')
        .setDescription('Nakłada efekt aury na jedną lub więcej postaci.')
        .addStringOption(option =>
            option.setName('typ')
                .setDescription('Czy aura dodaje (+) czy odejmuje (-) statystyki.')
                .setRequired(true)
                .addChoices(
                    { name: '+', value: '+' },
                    { name: '-', value: '-' }
                ))
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID graczy oddzielone spacją (np. 1 2 5)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('statystyki')
                .setDescription('Statystyki, które mają być zmienione (oddziel spacją).')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('wartosc')
                .setDescription('Ile punktów dodać/odjąć.')
                .setRequired(true)),

    async execute(interaction) {
        const typ = interaction.options.getString('typ');
        const idString = interaction.options.getString('id');
        const statyString = interaction.options.getString('statystyki');
        const wartosc = interaction.options.getInteger('wartosc');

        const ids = idString.split(' ').map(Number);
        const staty = statyString.toUpperCase().split(' ');

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let odpowiedz = '';

        for (const id of ids) {
            const postac = data.find(p => p.id === id);
            if (!postac) {
                odpowiedz += `❌ Nie znaleziono postaci o ID ${id}.\n`;
                continue;
            }

            for (const stat of staty) {
                if (postac.Atrybuty.hasOwnProperty(stat)) {
                    const zmiana = typ === '+' ? wartosc : -wartosc;
                    postac.Atrybuty[stat] += zmiana;
                    odpowiedz += ` ${postac.Imię}: ${stat} ${typ}${wartosc} ➝ ${postac.Atrybuty[stat]}\n`;
                } else {
                    odpowiedz += `⚠️ ${postac.Imię} nie ma statystyki ${stat}.\n`;
                }
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        await interaction.reply(odpowiedz || 'Brak zmian.');
    }
};
