const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const play = require('play-dl');
const musicPlayer = require('../../musicPlayer');

// Ustaw dane uwierzytelniające Spotify
play.setToken({
  spotify: {
    client_id: '2bebfbc8162d46608ed8cb91a0d58f32',
    client_secret: '5d1990e586e94dc987925c5c888e463e',
    refresh_token: 'AQASohg6wrcFRGtxpIbDuU53sSEDndus9igIL9qPqpsPenHaqyuXITvE9z9o8oqAaV1Dv-_GUh68pS2xfAKhrxyGfnlWhNSfgtPRVdgVkOWMyS1yhuHfr1TEOWr8ynvR13A', // opcjonalnie, ale zalecane
    market: 'US' // np. 'US'
  }
});

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

    if (url.includes('spotify.com/track')) {
      const spotifyTrack = await play.spotify(url);
      tracks.push(spotifyTrack.name + ' ' + spotifyTrack.artists[0].name);
    } else if (url.includes('spotify.com/playlist')) {
      const spotifyPlaylist = await play.spotify_playlist(url);
      for (const track of spotifyPlaylist.tracks) {
        tracks.push(track.name + ' ' + track.artists[0].name);
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
  },
};

async function playNextTrack(interaction) {
  const track = musicPlayer.skipTrack();
  if (!track) {
    return;
  }

  const ytInfo = await play.search(track, { limit: 1 });
  if (ytInfo.length === 0) {
    await interaction.followUp(`Could not find a YouTube equivalent for ${track}`);
    return;
  }

  const stream = await play.stream(ytInfo[0].url);
  const resource = createAudioResource(stream.stream, {
    inputType: stream.type,
  });

  const player = musicPlayer.getPlayer();
  player.play(resource);

  await interaction.followUp(`Now playing: ${ytInfo[0].title}`);

  player.once(AudioPlayerStatus.Idle, () => {
    playNextTrack(interaction);
  });
}



//AQASohg6wrcFRGtxpIbDuU53sSEDndus9igIL9qPqpsPenHaqyuXITvE9z9o8oqAaV1Dv-_GUh68pS2xfAKhrxyGfnlWhNSfgtPRVdgVkOWMyS1yhuHfr1TEOWr8ynvR13A
//2bebfbc8162d46608ed8cb91a0d58f32
//5d1990e586e94dc987925c5c888e463e