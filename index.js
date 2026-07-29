const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, MessageFlags } = require('discord.js');
const { TOKEN } = require('./config');
const { hasAccess, isAdmin, isBanned } = require('./utils/keystore');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const userId = interaction.user.id;

  if (command.adminOnly && !isAdmin(userId)) {
    await interaction.reply({
      content: 'This command is admin-only.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (command.requiresAccess) {
    if (isBanned(userId) && !isAdmin(userId)) {
      await interaction.reply({
        content: 'You are banned from using this bot.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    if (!hasAccess(userId)) {
      await interaction.reply({
        content:
          "You need an access key to use this command. Get one from an admin, then run `/redeem key:<your key>`.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Error running /${interaction.commandName}:`, err);
    const payload = { content: 'Something went wrong running that command.', flags: MessageFlags.Ephemeral };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(payload);
    } else {
      await interaction.reply(payload);
    }
  }
});

client.login(TOKEN);
