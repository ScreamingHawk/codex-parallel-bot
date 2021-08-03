# Codex Bot

Codex is a discord bot that interfaces with [Parallel](https://www.parallel.life).

Join the [Parallel Discord](https://discord.gg/JwWkFAsmA6) to see Codex in action.

## Usage

Log in to [Discord](https://discord.com) and join the [Parallel Discord](https://discord.gg/JwWkFAsmA6).

Use the `+help` command to find out other features available.

## Development

If you would like to contribute to the project please check out the [Contributing documentation](https://github.com/ScreamingHawk/codex-parallel-bot/blob/main/CONTRIBUTING.md).

### Configuration

Copy the `.env.example` file to `.env` and populate the values as per below.

Create a bot as per the [Discord bot documentation](https://discord.com/developers/docs/intro).
Retrieve the bot token and set it as the value for `DISCORD_TOKEN`.

Set the `CHANNEL_ID` to the channel where notifications should appear.

Populate the `OPENSEA_API_KEY` with an API key [requested from OpenSea](https://docs.opensea.io/reference#request-an-api-key).
This is optional, but recommended to avoid rate limiting.

Populate the `ADMIN_OVERRIDE` value with a user id to allow a user to skip the admin check when interacting with the bot.
This is useful if you don't have admin rights in the server the bot is in.
This also sends logs to the user when an error occurs.

### Build

Install `node` and `yarn`.

Install dependencies:

```
yarn
```

### Run

Run the bot:

```
yarn start
```

Check, monitor, stop and remove the running instance:

```
yarn pm2 ls
yarn logs
yarn stop
yarn delete
```

You can also run the bot having it only respond to a single user.
Edit the `.env` file and include a parameter `TEST_USER=<username>` where `<username>` is the username that the bot will listen to. Then run the bot with `yarn start`.
**Note**: This feature is not secure as any user can change their username to match the configured username.

### Test

Run the unit tests with:

```
yarn test
```

## Credits

[Michael Standen](https://michael.standen.link)

This software is provided under the [MIT License](https://tldrlegal.com/license/mit-license) so it's free to use so long as you give me credit.

To support the project you can donate some ether to `0x455fef5aeCACcd3a43A4BCe2c303392E10f22C63`.
