const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bard')
        .setDescription('Plays a song from YouTube')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The URL of the YouTube video or the name of the song')
                .setRequired(true)),
    async execute(interaction) {
        const url = interaction.options.getString('input');
        
        if (!interaction.member.voice.channel) {
            return interaction.reply('You need to be in a voice channel to use this command.');
        }
        
        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        
        const stream = ytdl(url, { filter: 'audioonly' });
        const resource = createAudioResource(stream);
        const player = createAudioPlayer();
        
        player.play(resource);
        connection.subscribe(player);
        
        await interaction.reply(`Playing: ${url}`);
    },
};
