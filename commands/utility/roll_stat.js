const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll_stat')
    .setDescription('Rolls a random value and checks against a character attribute')
    .addIntegerOption(option =>
      option.setName('id')
        .setDescription('The ID of the character')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('attribute')
        .setDescription('The name of the attribute')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('nie_pelny')
        .setDescription('Optional modifier to adjust the attribute value')
        .setRequired(false)),
  async execute(interaction) {
    const characterId = interaction.options.getInteger('id');
    const attributeName = interaction.options.getString('attribute').toUpperCase();
    const niePelny = interaction.options.getInteger('nie_pelny');

    const dataPath = path.join(__dirname, '../../postacie.json');

    let jsonData;

    
      jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    

    const character = jsonData.find(char => char.id === characterId);
    if (!character) {
      return interaction.reply(`Character with ID ${characterId} not found.`);
    }

    const attributeValue = character.Atrybuty[attributeName];
    if (attributeValue === undefined) {
      return interaction.reply(`Attribute ${attributeName} not found for character ${character.Imię}.`);
    }

    let effectiveAttributeValue = attributeValue;
    if (niePelny) {
      effectiveAttributeValue = Math.floor(attributeValue / niePelny);
    }

    const rollValue = Math.floor(Math.random() * 100) + 1;
    const result = rollValue <= effectiveAttributeValue ? 'Zmieścił się' : 'Nie zmieścił się';

    let replyContent = `# **${character.Imię}** rollował na statystyke **${attributeName}**. Wylosował **${rollValue}**. ***${result}***.`;

    if (result === 'Nie zmieścił się' && (rollValue - effectiveAttributeValue) <= character.Atrybuty['SZCZ']) {
      const difference = rollValue - effectiveAttributeValue;
      replyContent += ` Możesz użyć ${difference} punktów szczęścia, aby podołać.`;
    }

    const reply = await interaction.reply({
      content: replyContent,
      fetchReply: true
    });

    if (result === 'Nie zmieścił się' && rollValue < 95) {
      await reply.react('🫸');
    }

    if (result === 'Nie zmieścił się' && (rollValue - effectiveAttributeValue) <= character.Atrybuty['SZCZ']) {
      await reply.react('🍀');

      const luckFilter = (reaction, user) => {
        return reaction.emoji.name === '🍀' && !user.bot;
      };

      const luckCollector = reply.createReactionCollector({ filter: luckFilter, time: 60000 });

      luckCollector.on('collect', (reaction, user) => {
        console.log(`${user.tag} reacted with 🍀`);
        const difference = rollValue - effectiveAttributeValue;
        character.Atrybuty['SZCZ'] -= difference;

        // Zapisz zaktualizowane dane
        
          fs.writeFileSync(dataPath, JSON.stringify(jsonData, null, 2));
        

        interaction.followUp(`# Atrybut SZCZ postaci **${character.Imię}** został zmniejszony o ${difference}. Nowa wartość SZCZ: ${character.Atrybuty['SZCZ']}.`);
        luckCollector.stop();
      });
    }

    const filter = (reaction, user) => {
      return reaction.emoji.name === '🫸' && !user.bot;
    };

    const collector = reply.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async (reaction, user) => {
      console.log(`${user.tag} reacted with 🫸`);

      const newRollValue = Math.floor(Math.random() * 100) + 1;
      const newResult = newRollValue <= effectiveAttributeValue ? 'Zmieścił się' : 'Nie zmieścił się';

      const followUp = await interaction.followUp({
        content: `# **${character.Imię}** force'ował na statystyke **${attributeName}**. Wylosował **${newRollValue}**. ***${newResult}***.`,
        fetchReply: true
      });
    });
  },
};
