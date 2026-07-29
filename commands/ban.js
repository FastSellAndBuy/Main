const { SlashCommandBuilder } = require('discord.js');
const { banUser, isAdmin } = require('../utils/keystore');

module.exports = {
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('[Admin] Revoke a user\'s bot access, regardless of any key they hold')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('User to ban from the bot').setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user', true);

    if (isAdmin(target.id)) {
      await interaction.reply({
        content: "Can't ban another admin. Remove them from ADMIN_IDS first.",
        ephemeral: true,
      });
      return;
    }

    banUser(target.id);
    await interaction.reply({
      content: `${target} is now banned from using this bot.`,
      ephemeral: true,
    });
  },
};
