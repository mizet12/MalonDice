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
        const tempFilePath = path.join(__dirname, '../../', 'postacie_temp.json');

        if (operacja !== '+' && operacja !== '-') {
            await interaction.reply({ content: 'Błędny argument. Użyj "+" lub "-".', ephemeral: true });
            return;
        }

        if (operacja === '+') {
            try {
                // Odczytywanie pliku postacie.json
                const data = fs.readFileSync(filePath, 'utf8');
                const postacie = JSON.parse(data);

                // Sprawdzanie, czy dane w pliku to tablica
                if (!Array.isArray(postacie)) {
                    throw new Error('Plik postacie.json nie zawiera tablicy postaci.');
                }

                // Tworzenie tymczasowej tablicy zaktualizowanych postaci
                const updatedPostacie = postacie.map(postac => ({
                    ...postac,
                    Atrybuty: {
                        ...postac.Atrybuty,
                        WW: postac.Atrybuty.WW + 5,
                        US: postac.Atrybuty.US + 5,
                        SW: postac.Atrybuty.SW + 5,
                    },
                }));

                // Zapisywanie zaktualizowanych danych do tymczasowego pliku
                fs.writeFileSync(tempFilePath, JSON.stringify(updatedPostacie, null, 2), 'utf8');
                await interaction.reply('Atrybuty zostały zwiększone o 5 i zapisane do tymczasowego pliku.');
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Wystąpił błąd podczas aktualizacji atrybutów.', ephemeral: true });
            }
        } else if (operacja === '-') {
            try {
                // Usuwanie tymczasowego pliku, jeśli istnieje
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
                await interaction.reply('Tymczasowe zmiany zostały cofnięte.');
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Wystąpił błąd podczas cofania zmian.', ephemeral: true });
            }
        }
    },
};
