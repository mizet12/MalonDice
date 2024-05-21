const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls a dice.')
		.addStringOption(option => 
            option.setName('dice')
                .setDescription('The dice to roll in format XdY (e.g., 2d100)')
                .setRequired(true)),
	async execute(interaction) {
		const dice = interaction.options.getString('dice');
		const match = dice.match(/^(\d*)d(\d+)$/);
		if (match) {
			const rolls = parseInt(match[1], 10) || 1;
			const max = parseInt(match[2], 10);
			const results = [];
			let total = 0;

			for (let i = 0; i < rolls; i++) {
				const roll = Math.floor(Math.random() * max) + 1;
				results.push(roll);
				total += roll;
			}

			const resultsStr = results.join(', ');
            if(rolls == 1){
                await interaction.reply(`${interaction.user.username} użył \`${rolls}d${max}\` i wyrollował: \`${resultsStr}\`.`);
            }else{
                await interaction.reply(`${interaction.user.username} użył \`${rolls}d${max}\` i wyrollował: \`${resultsStr}\`. Łączna wartość: ${total}`);
            }
		} else {
			await interaction.reply('Użyj formatu: /roll {liczba}d{liczba}');
		}
	},
};
