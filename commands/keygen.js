const { SlashCommandBuilder } = require('discord.js');
const { createKey } = require('../utils/keystore');

module.exports = {
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('keygen')
    .setDescription('[Admin] Generate a bot access key')
    .addUserOption((opt) =>
      opt
        .setName('user')
        .setDescription('Grant this user access immediately (optional)')
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const key = createKey(interaction.user.id, target?.id ?? null);

    if (target) {
      await interaction.reply({
        content:
          `Generated key and granted access to ${target}.\n` +
          `Key (for your records): \`${key}\``,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content:
          `Generated an unassigned key:\n\`${key}\`\n\n` +
          `Give it to whoever should have access — they redeem it with \`/redeem key:${key}\`.`,
        ephemeral: true,
      });
    }
  },
};
