const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));

const commandNames = new Set(); // Set do śledzenia nazw komend

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        
        // Sprawdzanie, czy komenda ma unikalną nazwę
        if (commandNames.has(command.data.name)) {
            console.error(`Błąd: Duplikat komendy "${command.data.name}" w pliku ${file}. Nazwa komendy musi być unikalna.`);
            continue; // Pomijamy tę komendę
        }
        
        commands.push(command.data.toJSON());
        commandNames.add(command.data.name); // Dodajemy nazwę do zbioru
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
        console.log(data);
    } catch (error) {
        console.error(error);
    }
})();
