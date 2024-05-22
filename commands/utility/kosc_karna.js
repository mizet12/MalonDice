const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kosc_karna')
    .setDescription('Rolls two dice and uses the higher value to check against a character attribute')
    .addIntegerOption(option =>
      option.setName('id')
        .setDescription('The ID of the character')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('attribute')
        .setDescription('The name of the attribute')
        .setRequired(true)),
  async execute(interaction) {
    const characterId = interaction.options.getInteger('id');
    const attributeName = interaction.options.getString('attribute').toUpperCase();

    const dataPath = path.join(__dirname, '../../postacie.json');
    const tempPath = path.join(__dirname, '../../temp.json');
    
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

    // Roll two random values between 1 and 100 and choose the lower one
    const roll1 = Math.floor(Math.random() * 100) + 1;
    const roll2 = Math.floor(Math.random() * 100) + 1;
    const rollValue = Math.max(roll1, roll2);
    const result = rollValue <= attributeValue ? 'Zmieścił się' : 'Nie zmieścił się';

    let replyContent = `**${character.Imię}** rollował na statystyke **${attributeName}**. Wylosował **${rollValue}** (kości: ${roll1}, ${roll2}). ***${result}***.`;

      if(result === 'Nie zmieścił się' && (rollValue - attributeValue) <= character.Atrybuty['SZCZ']){
        const difference = rollValue - attributeValue;
        replyContent += `Możesz użyć ${difference} punktów szczęścia, aby podołać.`;
      }

      const reply = await interaction.reply({
        content: replyContent,
        fetchReply: true
      });

      if(result === 'Nie zmieścił się' && rollValue < 95){
        await reply.react('🫸');
      }

      if(result === 'Nie zmieścił się' && (rollValue - attributeValue) <= character.Atrybuty['SZCZ']) {
        await reply.react('🍀');
  
        const luckFilter = (reaction, user) => {
          return reaction.emoji.name === '🍀' && !user.bot;
        };
  
        const luckCollector = reply.createReactionCollector({ filter: luckFilter, time: 60000 });
  
        luckCollector.on('collect', (reaction, user) => {
          console.log(`${user.tag} reacted with 🍀`);
          const difference = rollValue - attributeValue;
          character.Atrybuty['SZCZ'] -= difference;
  
          // Zapisz zaktualizowane dane
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
  
        const newRoll1 = Math.floor(Math.random() * 100) + 1;
        const newRoll2 = Math.floor(Math.random() * 100) + 1;
        const newRollValue = Math.max(newRoll1, newRoll2);
        const newResult = rollValue <= attributeValue ? 'Zmieścił się' : 'Nie zmieścił się';
  
        const followUp = await interaction.followUp({
          content: `**${character.Imię}** forcował na statystyke **${attributeName}**. Wylosował **${newRollValue}** (kości: ${newRoll1}, ${newRoll2}). ***${newResult}***.`,
          fetchReply: true
        });
      });
  },
};
