const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inspirujaca')
        .setDescription('Zwiększa lub zmniejsza atrybuty postaci o 5')
        .addStringOption(option =>
            option.setName('operacja')
                .setDescription('Operacja do wykonania: + lub -')
                .setRequired(true)),
    async execute(interaction) {
        const operacja = interaction.options.getString('operacja');
        const filePath = path.join(__dirname, '../../', 'postacie.json');

        if (operacja !== '+' && operacja !== '-') {
            await interaction.reply({ content: 'Błędny argument. Użyj "+" lub "-".', ephemeral: true });
            return;
        }

        const multiplier = operacja === '+' ? 5 : -5;

        try {
            // Odczytywanie pliku postacie.json
            const data = fs.readFileSync(filePath, 'utf8');
            const postacie = JSON.parse(data);

            // Sprawdzanie, czy dane w pliku to tablica
            if (!Array.isArray(postacie)) {
                throw new Error('Plik postacie.json nie zawiera tablicy postaci.');
            }

            // Aktualizacja wartości atrybutów dla każdej postaci
            postacie.forEach(postac => {
                postac.WW += multiplier;
                postac.US += multiplier;
                postac.SW += multiplier;
            });

            // Zapisywanie zaktualizowanych danych do pliku
            fs.writeFileSync(filePath, JSON.stringify(postacie, null, 2), 'utf8');
            await interaction.reply(`Atrybuty zostały ${operacja === '+' ? 'zwiększone' : 'zmniejszone'} o 5.`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Wystąpił błąd podczas aktualizacji atrybutów.', ephemeral: true });
        }
    },
};
