const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { TOKEN, CLIENT_ID, GUILD_ID } = require('./config');

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));

const commands = commandFiles.map((file) => {
  const command = require(path.join(commandsPath, file));
  return command.data.toJSON();
});

const rest = new REST().setToken(TOKEN);

(async () => {
  try {
    const target = GUILD_ID
      ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
      : Routes.applicationCommands(CLIENT_ID);

    console.log(
      `Deploying ${commands.length} command(s) ${GUILD_ID ? `to guild ${GUILD_ID}` : 'globally'}...`
    );

    await rest.put(target, { body: commands });

    console.log('Done. Guild commands show up instantly; global commands can take up to an hour.');
  } catch (err) {
    console.error('Failed to deploy commands:', err);
    process.exit(1);
  }
})();
