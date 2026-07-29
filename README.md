# disdex finder bot

A Discord bot with `/serverfinder` and `/userfinder`, backed by the free
[disdex.io](https://disdex.io/api) API, gated behind an access-key system.

## Important: about the filters

Your screenshots show the full disdex.io **website** filter panel (member
range, online range, created/added dates, boosts range, badges, etc.). The
disdex **API** doesn't expose all of those — it only documents:

- **Servers**: `q`, `tag`, `tag_status`, `sort` (members/online/boosts/newest/oldest),
  `nsfw`, `vanity`
- **Users**: `q`, `type` (user/bot), `sort` (invites/servers/username/newest/oldest)

Those are the options wired into the two commands below. If disdex adds range
filters to the API later, they're easy to bolt on in
`commands/serverfinder.js` / `commands/userfinder.js`.

## Access model

disdex API keys don't gate bot usage — on disdex they only credit invite
submissions to your profile. So this bot has its **own** access-key system,
separate from disdex:

- `/keygen [user]` (admin) — generates a key. Pass a user to grant them
  access immediately, or omit it to get a shareable code.
- `/redeem key:<key>` (anyone) — claims an unassigned key.
- `/ban user:<user>` (admin) — blocks a user from the finder commands, even
  if they hold a valid key.
- `/unban user:<user>` (admin) — lifts a ban (they still need a redeemed key).

Admins (listed in `ADMIN_IDS`) always have access and can't be banned.

## Setup

1. Create an application at the
   [Discord Developer Portal](https://discord.com/developers/applications),
   add a bot to it, and copy the **token** and **application (client) ID**.
2. Invite the bot to your server with the `applications.commands` and `bot`
   scopes (no special permissions needed beyond sending messages/embeds).
3. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN`, `CLIENT_ID`,
   and `ADMIN_IDS` (your own Discord user ID at minimum). Set `GUILD_ID`
   too while testing, so commands register instantly instead of waiting up
   to an hour for the global rollout.
4. Install dependencies and register commands:

   ```
   npm install
   npm run deploy
   ```

5. Start the bot:

   ```
   npm start
   ```

Requires Node.js 18+ (uses the built-in `fetch`).

## Storage

Keys, authorized users, and bans live in `data/store.json`, a plain JSON
file created automatically on first run. Fine for a single bot process; swap
`utils/keystore.js` for a real database if you need concurrency or multiple
shards.
