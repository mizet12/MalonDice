const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
const ytSearch = require('yt-search');
const musicPlayer = require('../../musicPlayer');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const spotifyCredentials = {
  client_id: '2bebfbc8162d46608ed8cb91a0d58f32',
  client_secret: '5d1990e586e94dc987925c5c888e463e',
  refresh_token: 'AQASohg6wrcFRGtxpIbDuU53sSEDndus9igIL9qPqpsPenHaqyuXITvE9z9o8oqAaV1Dv-_GUh68pS2xfAKhrxyGfnlWhNSfgtPRVdgVkOWMyS1yhuHfr1TEOWr8ynvR13A',
  market: 'US'
};

async function refreshSpotifyToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${spotifyCredentials.client_id}:${spotifyCredentials.client_secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'grant_type': 'refresh_token',
      'refresh_token': spotifyCredentials.refresh_token
    })
  });

  const data = await response.json();
  spotifyCredentials.access_token = data.access_token;
}

async function fetchSpotifyPlaylistTracks(playlistId) {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      'Authorization': `Bearer ${spotifyCredentials.access_token}`
    }
  });
  const data = await response.json();
  return data.items;
}

async function playNextTrack(interaction) {
  try {
    const track = musicPlayer.skipTrack();
    if (!track) {
      return;
    }

    const ytInfo = await ytSearch(track);
    const video = ytInfo.videos.length > 0 ? ytInfo.videos[0] : null;
    if (!video) {
      await interaction.followUp(`Could not find a YouTube equivalent for ${track}`);
      return;
    }

    const stream = await ytdl(video.url, { filter: 'audioonly', highWaterMark: 1 << 25 });
    const resource = createAudioResource(stream, { inputType: 'opus' });

    const player = musicPlayer.getPlayer();
    player.play(resource);

    await interaction.editReply(`Now playing: ${video.title}`);

    player.once(AudioPlayerStatus.Idle, () => {
      playNextTrack(interaction);
    });
  } catch (error) {
    console.error('Error in playNextTrack:', error);
    try {
      await interaction.followUp('An error occurred while playing the next track.');
    } catch (followUpError) {
      console.error('Error sending follow-up message:', followUpError);
    }
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bard')
    .setDescription('Plays a song from YouTube or Spotify')
    .addStringOption(option =>
      option.setName('input')
        .setDescription('The URL of the YouTube video or Spotify track/playlist')
        .setRequired(true)),
  async execute(interaction) {
    const url = interaction.options.getString('input');

    if (!interaction.member.voice.channel) {
      return interaction.reply('You need to be in a voice channel to use this command.');
    }

    await interaction.deferReply();

    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    let tracks = [];

    try {
      if (url.includes('spotify.com/track')) {
        await refreshSpotifyToken();
        const response = await fetch(`https://api.spotify.com/v1/tracks/${url.split('track/')[1].split('?')[0]}`, {
          headers: {
            'Authorization': `Bearer ${spotifyCredentials.access_token}`
          }
        });
        const spotifyTrack = await response.json();
        tracks.push(`${spotifyTrack.name} ${spotifyTrack.artists[0].name}`);
      } else if (url.includes('spotify.com/playlist')) {
        await refreshSpotifyToken();
        const playlistId = url.split('/playlist/')[1].split('?')[0];
        const spotifyPlaylistTracks = await fetchSpotifyPlaylistTracks(playlistId);

        for (const item of spotifyPlaylistTracks) {
          const track = item.track;
          tracks.push(`${track.name} ${track.artists[0].name}`);
        }
      } else {
        tracks.push(url);
      }

      if (!tracks.length) {
        return interaction.editReply('No tracks found to play.');
      }

      const player = musicPlayer.getPlayer() || createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play,
        },
      });

      musicPlayer.setPlayer(player);
      musicPlayer.setConnection(connection);
      connection.subscribe(player);

      for (const track of tracks) {
        musicPlayer.addToQueue(track);
      }

      if (player.state.status !== AudioPlayerStatus.Playing) {
        await playNextTrack(interaction);
      } else {
        await interaction.editReply(`Added ${tracks.length} track(s) to the queue.`);
      }
    } catch (error) {
      console.error('Error occurred while processing the Spotify URL:', error);
      await interaction.editReply('There was an error processing the Spotify URL.');
    }
  },
};





//AQC37qGxYZ_4tj9Yt6vRZBMAxovPGKP_zlHlDLVhT_9KM-n81Cgt8iv6Wvl7k7neudQH97RPfhDqBF8m5OSItthxRJLudpH7LAgJDQ_5rMPzZArxsPTmD5WRR0nRM-QcS3M
//2bebfbc8162d46608ed8cb91a0d58f32
//5d1990e586e94dc987925c5c888e463e