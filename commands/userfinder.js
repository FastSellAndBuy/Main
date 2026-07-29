const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { searchUsers } = require('../utils/disdex');

module.exports = {
  requiresAccess: true,
  data: new SlashCommandBuilder()
    .setName('userfinder')
    .setDescription('Search Discord users/bots indexed by disdex.io')
    .addStringOption((opt) =>
      opt.setName('query').setDescription('Username or display name prefix')
    )
    .addStringOption((opt) =>
      opt
        .setName('type')
        .setDescription('Filter by account type')
        .addChoices(
          { name: 'User', value: 'user' },
          { name: 'Bot', value: 'bot' }
        )
    )
    .addStringOption((opt) =>
      opt
        .setName('sort')
        .setDescription('Sort order')
        .addChoices(
          { name: 'Invites', value: 'invites' },
          { name: 'Servers', value: 'servers' },
          { name: 'Username', value: 'username' },
          { name: 'Newest seen', value: 'newest' },
          { name: 'Oldest seen', value: 'oldest' }
        )
    )
    .addIntegerOption((opt) =>
      opt
        .setName('limit')
        .setDescription('How many results to show (1-10, default 5)')
        .setMinValue(1)
        .setMaxValue(10)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const params = {
      q: interaction.options.getString('query'),
      type: interaction.options.getString('type'),
      sort: interaction.options.getString('sort'),
      limit: interaction.options.getInteger('limit') ?? 5,
    };

    let result;
    try {
      result = await searchUsers(params);
    } catch (err) {
      await interaction.editReply(`disdex lookup failed: ${err.message}`);
      return;
    }

    if (!result.data || result.data.length === 0) {
      await interaction.editReply('No users matched that search.');
      return;
    }

    const embeds = result.data.slice(0, 10).map((user) => {
      const embed = new EmbedBuilder()
        .setTitle(user.global_name || user.username)
        .setURL(user.url)
        .setDescription(`@${user.username}${user.is_bot ? ' · BOT' : ''}`)
        .addFields(
          { name: 'Servers seen in', value: String(user.server_count ?? 0), inline: true },
          { name: 'Invites', value: String(user.invite_count ?? 0), inline: true }
        )
        .setColor(0x7289da);

      if (user.avatar_url) embed.setThumbnail(user.avatar_url);

      return embed;
    });

    const footerNote =
      result.total != null
        ? `Showing ${result.data.length} of ${result.total} matches`
        : `Showing ${result.data.length} matches${result.has_more ? ' (more available)' : ''}`;

    await interaction.editReply({ content: footerNote, embeds });
  },
};
