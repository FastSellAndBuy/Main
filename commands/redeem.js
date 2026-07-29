const { SlashCommandBuilder } = require('discord.js');
const { redeemKey } = require('../utils/keystore');

module.exports = {
  // Deliberately NOT gated by requiresAccess/adminOnly — this is how
  // someone without access gets it in the first place.
  data: new SlashCommandBuilder()
    .setName('redeem')
    .setDescription('Redeem an access key to unlock /serverfinder and /userfinder')
    .addStringOption((opt) =>
      opt.setName('key').setDescription('The key you were given').setRequired(true)
    ),

  async execute(interaction) {
    const key = interaction.options.getString('key', true).trim();
    const result = redeemKey(key, interaction.user.id);

    if (result.ok) {
      await interaction.reply({
        content: 'Key accepted — you now have access to /serverfinder and /userfinder.',
        ephemeral: true,
      });
      return;
    }

    const message =
      result.reason === 'already_redeemed'
        ? 'That key has already been redeemed by someone else.'
        : "That key doesn't exist. Double-check it and try again.";

    await interaction.reply({ content: message, ephemeral: true });
  },
};
