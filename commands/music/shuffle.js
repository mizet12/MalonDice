const { SlashCommandBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const musicPlayer = require('../../musicPlayer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffles the current queue of songs'),
  async execute(interaction) {
    try {
      const queue = musicPlayer.getQueue();

      if (queue.length === 0) {
        await interaction.reply('The queue is empty.');
        return;
      }

      // Fisher-Yates shuffle algorithm
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }

      await interaction.reply('Queue shuffled.');

      const player = musicPlayer.getPlayer();
      if (player && player.state.status !== AudioPlayerStatus.Playing) {
        playNextTrack(interaction);
      }
    } catch (error) {
      console.error('Error in shuffle command:', error);
      try {
        await interaction.reply('An error occurred while shuffling the queue.');
      } catch (replyError) {
        console.error('Error sending reply message:', replyError);
      }
    }
  },
};

async function playNextTrack(interaction) {
  try {
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

    await interaction.editReply(`Now playing: ${ytInfo[0].title}`);

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

