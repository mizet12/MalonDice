const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kosc_karna')
    .setDescription('Rolls dice and uses the higher value to check against a character attribute')
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
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('bonus')
        .setDescription('Number of dice to roll')
        .setRequired(false)),
  async execute(interaction) {
    const characterId = interaction.options.getInteger('id');
    const attributeName = interaction.options.getString('attribute').toUpperCase();
    const niePelny = interaction.options.getInteger('nie_pelny');
    const bonus = interaction.options.getInteger('bonus') || 2; // Default to 2 if no bonus is provided

    const dataPath = path.join(__dirname, '../../postacie.json');
    const tempPath = path.join(__dirname, '../../postacie_temp.json');
    
    let jsonData;

    // Check if the temporary file exists, if so use it, otherwise use the original file
    if (fs.existsSync(tempPath)) {
      jsonData = JSON.parse(fs.readFileSync(tempPath, 'utf8'));
    } else {
      jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }

    // Find the character by ID
    const character = jsonData.find(char => char.id === characterId);
    if (!character) {
      return interaction.reply(`Character with ID ${characterId} not found.`);
    }

    // Check if the attribute exists
    const attributeValue = character.Atrybuty[attributeName];
    if (attributeValue === undefined) {
      return interaction.reply(`Attribute ${attributeName} not found for character ${character.Imię}.`);
    }

    // Calculate the effective attribute value if nie_pelny is provided
    let effectiveAttributeValue = attributeValue;
    if (niePelny) {
      effectiveAttributeValue = Math.floor(attributeValue / niePelny);
    }

    // Roll the dice and choose the highest one
    const rollCount = bonus; // Use the bonus value directly to set the number of dice
    const rolls = [];
    for (let i = 0; i < rollCount; i++) {
      rolls.push(Math.floor(Math.random() * 100) + 1);
    }
    const rollValue = Math.max(...rolls);
    const result = rollValue <= effectiveAttributeValue ? 'Zmieścił się' : 'Nie zmieścił się';

    let replyContent = `**${character.Imię}** rollował na statystyke **${attributeName}**. Wylosował **${rollValue}** (kości: ${rolls.join(', ')}). ***${result}***.`;

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

        // Save the updated data
        if (fs.existsSync(tempPath)) {
          fs.writeFileSync(tempPath, JSON.stringify(jsonData, null, 2));
        } else {
          fs.writeFileSync(dataPath, JSON.stringify(jsonData, null, 2));
        }

        interaction.followUp(`Atrybut SZCZ postaci **${character.Imię}** został zmniejszony o ${difference}. **Nowa wartość SZCZ: ${character.Atrybuty['SZCZ']}**.`);
        luckCollector.stop();
      });
    }

    const filter = (reaction, user) => {
      return reaction.emoji.name === '🫸' && !user.bot;
    };

    const collector = reply.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async (reaction, user) => {
      console.log(`${user.tag} reacted with 🫸`);

      const newRolls = [];
      for (let i = 0; i < rollCount; i++) {
        newRolls.push(Math.floor(Math.random() * 100) + 1);
      }
      const newRollValue = Math.max(...newRolls);
      const newResult = newRollValue <= effectiveAttributeValue ? 'Zmieścił się' : 'Nie zmieścił się';

      const followUp = await interaction.followUp({
        content: `**${character.Imię}** force'ował na statystyke **${attributeName}**. Wylosował **${newRollValue}** (kości: ${newRolls.join(', ')}). ***${newResult}***.`,
        fetchReply: true
      });
    });
  },
};
