//Do pobrania:

//npm init -y
//npm i discord.js
//npm install ytdl-core @discordjs/voice @discordjs/opus
//npm install -g npm
//npm install -g node-gyp
//npm install discord.js@latest
//npm install @discordjs/voice ytdl-core
//npm install discord.js@latest
//npm install @discordjs/voice ytdl-core
//npm install prism-media
//npm install sodium
//npm install libsodium-wrappers
//npm install tweetnacl
//npm i ffmpeg-static
//npm install dotenv

//Jak uruchomić:

//node deploy-commands.js
//node index.js

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
    console.log('Interaction received:', interaction);
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



client.login(token);




//MTI0MjA2NTA0NTkxMTc2NTAxMg.G7vqT7.4nu3U9zytxd4t4DJ6uXgWZfDjbtCv6licuqtmg

//Todo List:
//Spotify
//playlisty spotify + yt
//1/2 1/5