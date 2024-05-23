// In 'bard.js'

const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');
const SpotifyWebApi = require('spotify-web-api-node');
const musicPlayer = require('../../musicPlayer');

const spotifyApi = new SpotifyWebApi({
  clientId: '2bebfbc8162d46608ed8cb91a0d58f32',
  clientSecret: '5d1990e586e94dc987925c5c888e463e'
});

let musicQueue = [];
let currentTrackIndex = 0;

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

    await interaction.deferReply();

    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    musicPlayer.setConnection(connection);

    let tracks = [];

    try {
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body['access_token']);
    } catch (error) {
      console.error('Spotify authorization failed:', error);
      return interaction.followUp('Failed to authenticate with Spotify. Please check your credentials.');
    }

    const playTrack = async (index) => {
      if (index >= musicQueue.length) {
        connection.destroy();
        return;
      }
      const track = musicQueue[index];
      const resource = createAudioResource(track.url, { inputType: track.type });
      player.play(resource);
      player.index = index;
      if (index === 0) {
        await interaction.followUp(`Playing: ${track.title}`);
      } else {
        await interaction.followUp(`Now playing: ${track.title}`);
      }
    };

    const player = createAudioPlayer();
    musicPlayer.setPlayer(player);
    
    player.on(AudioPlayerStatus.Idle, () => {
      playTrack(player.index + 1);
    });
    connection.subscribe(player);

    try {
      if (play.yt_validate(input) === 'video') {
        const stream = await play.stream(input);
        tracks.push({ url: stream.url, type: stream.type, title: stream.title });
      } else if (play.yt_validate(input) === 'playlist') {
        const playlist = await play.playlist_info(input, { incomplete: true });
        for (const video of playlist.videos) {
          const stream = await play.stream(video.url);
          tracks.push({ url: stream.url, type: stream.type, title: video.title });
        }
      } else if (input.includes('spotify.com/track/')) {
        const trackId = input.split('track/')[1].split('?')[0];
        const track = await spotifyApi.getTrack(trackId);
        const query = `${track.body.name} ${track.body.artists[0].name}`;
        const searchResults = await play.search(query, { limit: 1 });
        if (searchResults.length > 0) {
          const stream = await play.stream(searchResults[0].url);
          tracks.push({ url: stream.url, type: stream.type, title: searchResults[0].title });
        } else {
          return interaction.followUp('No equivalent YouTube video found for this Spotify track.');
        }
      } else if (input.includes('spotify.com/playlist/')) {
        const playlistId = input.split('playlist/')[1].split('?')[0];
        const playlist = await spotifyApi.getPlaylist(playlistId);
        for (const item of playlist.body.tracks.items) {
          const track = item.track;
          const query = `${track.name} ${track.artists[0].name}`;
          const searchResults = await play.search(query, { limit: 1 });
          if (searchResults.length > 0) {
            const stream = await play.stream(searchResults[0].url);
            tracks.push({ url: stream.url, type: stream.type, title: searchResults[0].title });
          }
        }
      } else {
        return interaction.followUp('Invalid URL or unsupported platform.');
      }
    } catch (error) {
      console.error('Error processing URL:', error);
      return interaction.followUp('Failed to process the URL. Please check the URL and try again.');
    }

    if (tracks.length === 0) {
      return interaction.followUp('No valid tracks found.');
    }

    musicQueue.push(...tracks);
    await interaction.followUp(`Starting playlist with ${tracks.length} track(s).`);
    if (musicQueue.length === tracks.length) {
      playTrack(0);
    }
  },
};



//AQASohg6wrcFRGtxpIbDuU53sSEDndus9igIL9qPqpsPenHaqyuXITvE9z9o8oqAaV1Dv-_GUh68pS2xfAKhrxyGfnlWhNSfgtPRVdgVkOWMyS1yhuHfr1TEOWr8ynvR13A
//2bebfbc8162d46608ed8cb91a0d58f32
//5d1990e586e94dc987925c5c888e463e