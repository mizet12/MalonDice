const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coin_flip')
		.setDescription('Flips a coin.'),
	async execute(interaction) {
		const rollValue = Math.floor(Math.random() * 2) + 1;
        let replyContent
        if(rollValue == 1){
            replyContent = `***Orzeł***`;
        }else{
            replyContent = `***Reszka***`;
        }

        const reply = await interaction.reply({
            content: replyContent,
            fetchReply: true
          });
	},
};
