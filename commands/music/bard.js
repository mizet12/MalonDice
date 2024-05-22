const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bard')
        .setDescription('Plays a song or playlist from YouTube or Spotify')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The URL of the YouTube video, Spotify track/playlist/album, or YouTube playlist')
                .setRequired(true)),
    async execute(interaction) {
        const input = interaction.options.getString('input');
        
        if (!interaction.member.voice.channel) {
            return interaction.reply('You need to be in a voice channel to use this command.');
        }
        
        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        let tracks = [];

        // Authenticate with Spotify
        if (!play.is_expired()) {
            await play.refreshToken();
        } else {
            await play.setToken({
                spotify: {
                    client_id: '2bebfbc8162d46608ed8cb91a0d58f32',
                    client_secret: '5d1990e586e94dc987925c5c888e463e',
                    refresh_token: 'AQASohg6wrcFRGtxpIbDuU53sSEDndus9igIL9qPqpsPenHaqyuXITvE9z9o8oqAaV1Dv-_GUh68pS2xfAKhrxyGfnlWhNSfgtPRVdgVkOWMyS1yhuHfr1TEOWr8ynvR13A'
                }
            });
        }

        if (play.yt_validate(input) === 'video') {
            // YouTube video
            const stream = await play.stream(input);
            tracks.push({ url: input, stream });
        } else if (play.yt_validate(input) === 'playlist') {
            // YouTube playlist
            const playlist = await play.playlist_info(input, { incomplete: true });
            for (const video of playlist.videos) {
                const stream = await play.stream(video.url);
                tracks.push({ url: video.url, stream });
            }
        } else if (play.sp_validate(input)) {
            // Spotify URL
            const spotifyData = await play.spotify(input);
            if (spotifyData.type === 'track') {
                const ytSearch = await play.search(`${spotifyData.name} ${spotifyData.artists[0].name}`, { limit: 1 });
                if (ytSearch.length > 0) {
                    const stream = await play.stream(ytSearch[0].url);
                    tracks.push({ url: ytSearch[0].url, stream });
                }
            } else if (spotifyData.type === 'playlist' || spotifyData.type === 'album') {
                for (const track of spotifyData.tracks) {
                    const ytSearch = await play.search(`${track.name} ${track.artists[0].name}`, { limit: 1 });
                    if (ytSearch.length > 0) {
                        const stream = await play.stream(ytSearch[0].url);
                        tracks.push({ url: ytSearch[0].url, stream });
                    }
                }
            }
        } else {
            return interaction.reply('Invalid URL or unsupported platform.');
        }

        if (tracks.length === 0) {
            return interaction.reply('No valid tracks found.');
        }

        const player = createAudioPlayer();

        const playTrack = async (index) => {
            if (index >= tracks.length) {
                connection.destroy();
                return;
            }
            const track = tracks[index];
            const resource = createAudioResource(track.stream.stream, { inputType: track.stream.type });
            player.play(resource);
            await interaction.followUp(`Playing: ${track.url}`);
        };

        player.on(AudioPlayerStatus.Idle, () => {
            playTrack(player.index + 1);
        });

        player.index = 0;
        playTrack(0);

        connection.subscribe(player);

        await interaction.reply(`Starting playlist with ${tracks.length} track(s).`);
    },
};



//AQASohg6wrcFRGtxpIbDuU53sSEDndus9igIL9qPqpsPenHaqyuXITvE9z9o8oqAaV1Dv-_GUh68pS2xfAKhrxyGfnlWhNSfgtPRVdgVkOWMyS1yhuHfr1TEOWr8ynvR13A
//2bebfbc8162d46608ed8cb91a0d58f32
//5d1990e586e94dc987925c5c888e463e