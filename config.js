require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || null;
const ADMIN_IDS = (process.env.ADMIN_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (!TOKEN || !CLIENT_ID) {
  console.warn(
    '[config] DISCORD_TOKEN or CLIENT_ID missing from .env — the bot will not be able to log in.'
  );
}

if (ADMIN_IDS.length === 0) {
  console.warn(
    '[config] No ADMIN_IDS set — nobody will be able to run /keygen, /ban, or /unban.'
  );
}

const DISDEX_BASE = 'https://disdex.io/api/v1';

module.exports = { TOKEN, CLIENT_ID, GUILD_ID, ADMIN_IDS, DISDEX_BASE };
