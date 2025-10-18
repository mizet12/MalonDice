
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.commands = new Collection();

const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
    }
}

client.once('ready', () => {
    console.log('Ready!');
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.log('Command not found:', interaction.commandName);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

const restoreCharacters = () => {
    const currentPath = path.join(__dirname, 'postacie.json');
    const defaultPath = path.join(__dirname, 'default_postacie.json');

    const currentData = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
    const defaultData = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));

    const updatedData = defaultData.map(defaultChar => {
        const currentChar = currentData.find(c => c.id === defaultChar.id);
        if (!currentChar) return defaultChar;

        
        const hp = currentChar?.Atrybuty?.HP ?? defaultChar.Atrybuty.HP;
        const hpmax = currentChar?.Atrybuty?.HPMAX ?? defaultChar.Atrybuty.HPMAX;
        const szcz = currentChar?.Atrybuty?.SZCZ ?? defaultChar.Atrybuty.SZCZ;
        const shild = currentChar?.Atrybuty?.SHILD ?? defaultChar.Atrybuty.SHILD;
        return {
            ...defaultChar,
            Atrybuty: {
                ...defaultChar.Atrybuty,
                HP: hp,
                HPMAX: hpmax,
                SHILD: shild,
                SZCZ: szcz
            }
        };
    });

    fs.writeFileSync(currentPath, JSON.stringify(updatedData, null, 2), 'utf8');
};

restoreCharacters(); 


client.login(token);
