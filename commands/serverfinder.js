const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { searchServers } = require('../utils/disdex');

module.exports = {
  requiresAccess: true,
  data: new SlashCommandBuilder()
    .setName('serverfinder')
    .setDescription('Search Discord servers indexed by disdex.io')
    .addStringOption((opt) =>
      opt.setName('query').setDescription('Name or vanity to search for')
    )
    .addStringOption((opt) =>
      opt
        .setName('sort')
        .setDescription('Sort order')
        .addChoices(
          { name: 'Members', value: 'members' },
          { name: 'Online now', value: 'online' },
          { name: 'Boosts', value: 'boosts' },
          { name: 'Newest indexed', value: 'newest' },
          { name: 'Oldest indexed', value: 'oldest' }
        )
    )
    .addStringOption((opt) =>
      opt.setName('tag').setDescription('Guild tag, e.g. SAB (case-insensitive exact match)')
    )
    .addStringOption((opt) =>
      opt
        .setName('tag_status')
        .setDescription('Whether the tag must be actively displayed')
        .addChoices(
          { name: 'Any', value: 'any' },
          { name: 'Active', value: 'active' },
          { name: 'Inactive', value: 'inactive' }
        )
    )
    .addStringOption((opt) =>
      opt
        .setName('nsfw')
        .setDescription('NSFW filter')
        .addChoices(
          { name: 'Include', value: 'include' },
          { name: 'Exclude', value: 'exclude' },
          { name: 'Only NSFW', value: 'only' }
        )
    )
    .addStringOption((opt) =>
      opt
        .setName('vanity')
        .setDescription('Vanity URL filter')
        .addChoices(
          { name: 'Any', value: 'any' },
          { name: 'Has vanity', value: 'has' },
          { name: 'No vanity', value: 'no' },
          { name: 'Vanity only (dead permanent invite)', value: 'only' }
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
      sort: interaction.options.getString('sort'),
      tag: interaction.options.getString('tag'),
      tag_status: interaction.options.getString('tag_status'),
      nsfw: interaction.options.getString('nsfw'),
      vanity: interaction.options.getString('vanity'),
      limit: interaction.options.getInteger('limit') ?? 5,
    };

    let result;
    try {
      result = await searchServers(params);
    } catch (err) {
      await interaction.editReply(`disdex lookup failed: ${err.message}`);
      return;
    }

    if (!result.data || result.data.length === 0) {
      await interaction.editReply('No servers matched that search.');
      return;
    }

    const embeds = result.data.slice(0, 10).map((server) => {
      const embed = new EmbedBuilder()
        .setTitle(server.name)
        .setURL(server.url)
        .setDescription(server.description ? server.description.slice(0, 300) : 'No description')
        .addFields(
          { name: 'Members', value: server.members?.toLocaleString() ?? '—', inline: true },
          { name: 'Online', value: server.online?.toLocaleString() ?? '—', inline: true },
          { name: 'Boosts', value: String(server.boosts ?? 0), inline: true }
        )
        .setColor(0x7289da);

      if (server.icon_url) embed.setThumbnail(server.icon_url);
      if (server.invite_url) embed.addFields({ name: 'Invite', value: server.invite_url });
      if (server.tag?.name) {
        embed.addFields({
          name: 'Tag',
          value: `${server.tag.name}${server.tag.active ? '' : ' (inactive)'}`,
          inline: true,
        });
      }

      return embed;
    });

    const footerNote =
      result.total != null
        ? `Showing ${result.data.length} of ${result.total} matches`
        : `Showing ${result.data.length} matches${result.has_more ? ' (more available)' : ''}`;

    await interaction.editReply({ content: footerNote, embeds });
  },
};
