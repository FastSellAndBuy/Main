const { SlashCommandBuilder } = require('discord.js');
const { unbanUser } = require('../utils/keystore');

module.exports = {
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('[Admin] Lift a ban so the user can access the bot again')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('User to unban').setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const wasBanned = unbanUser(target.id);

    await interaction.reply({
      content: wasBanned
        ? `${target} has been unbanned. Note: they still need an authorized/redeemed key to use the bot.`
        : `${target} wasn't banned.`,
      ephemeral: true,
    });
  },
};
