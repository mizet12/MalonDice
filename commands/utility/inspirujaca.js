const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inspirujaca')
        .setDescription('Zwiększa lub zmniejsza atrybuty wszystkich postaci o 6')
        .addStringOption(option =>
            option.setName('operacja')
                .setDescription('Operacja do wykonania: + lub -')
                .setRequired(true)),
    async execute(interaction) {
        const operacja = interaction.options.getString('operacja');
        const filePath = path.join(__dirname, '../../', 'postacie.json');
        const tempFilePath = path.join(__dirname, '../../', 'postacie_temp.json');

        try {
            // Sprawdź, czy istnieje tymczasowy plik, jeśli tak - odczytaj z niego
            const sourceFile = fs.existsSync(tempFilePath) ? tempFilePath : filePath;
            const data = fs.readFileSync(sourceFile, 'utf8');
            const postacie = JSON.parse(data);

            // Zwiększenie lub zmniejszenie atrybutów wszystkich postaci o 6
            const zmiana = operacja === '+' ? 6 : -6;
            const updatedPostacie = postacie.map(postac => {
                postac.Atrybuty.WW += zmiana;
                postac.Atrybuty.US += zmiana;
                postac.Atrybuty.SW += zmiana;
                return postac;
            });

            // Zapis zaktualizowanych danych do pliku tymczasowego
            fs.writeFileSync(tempFilePath, JSON.stringify(updatedPostacie, null, 2), 'utf8');
            await interaction.reply(`Atrybuty wszystkich postaci zostały ${operacja === '+' ? 'zwiększone' : 'zmniejszone'} o 6.`);
        } catch (error) {
            console.error('Błąd podczas operacji:', error);
            await interaction.reply({ content: 'Wystąpił błąd podczas aktualizacji atrybutów.', ephemeral: true });
        }
    },
};
