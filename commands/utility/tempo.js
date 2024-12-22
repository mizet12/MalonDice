const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempo')
        .setDescription('Zwiększa lub zmniejsza atrybuty wybranej postaci o 5')
        .addStringOption(option =>
            option.setName('operacja')
                .setDescription('Operacja do wykonania: + lub -')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('ID postaci, na którą chcesz wpłynąć')
                .setRequired(true)),
    async execute(interaction) {
        const operacja = interaction.options.getString('operacja');
        const postacId = interaction.options.getInteger('id');
        const filePath = path.join(__dirname, '../../', 'postacie.json');
        const tempFilePath = path.join(__dirname, '../../', 'postacie_temp.json');

        try {
            // Sprawdź, czy istnieje tymczasowy plik, jeśli tak - odczytaj z niego
            const sourceFile = fs.existsSync(tempFilePath) ? tempFilePath : filePath;
            const data = fs.readFileSync(sourceFile, 'utf8');
            const postacie = JSON.parse(data);

            const postac = postacie.find(p => p.id === postacId);

            if (!postac) {
                await interaction.reply({ content: `Nie znaleziono postaci o ID ${postacId}.`, ephemeral: true });
                return;
            }

            // Zwiększenie lub zmniejszenie atrybutów wybranej postaci o 5
            const zmiana = operacja === '+' ? 5 : -5;
            postac.Atrybuty.ZW += zmiana;
            postac.Atrybuty.S += zmiana;
            postac.Atrybuty.ODP += zmiana;

            // Zapis zaktualizowanych danych do pliku tymczasowego
            fs.writeFileSync(tempFilePath, JSON.stringify(postacie, null, 2), 'utf8');
            await interaction.reply(`Atrybuty postaci ${postac.Imię} zostały zmodyfikowane o ${zmiana}.`);
        } catch (error) {
            console.error('Błąd podczas operacji:', error);
            await interaction.reply({ content: 'Wystąpił błąd podczas aktualizacji atrybutów.', ephemeral: true });
        }
    },
};
