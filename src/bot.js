require('dotenv').config()
const log = require('./util/logger')
const Discord = require('discord.js')
const { initSchedules } = require('./events/schedule')
const { initPresence } = require('./events/presence')

// Get token
const TOKEN = process.env.DISCORD_TOKEN
if (!TOKEN) {
	for (let i = 0; i < 5; i++) {
		log.error('NO DISCORD TOKEN!!!')
	}
	process.exit(1)
}

// Prepare env vars
const {
	CHANNEL_ID,
} = process.env
if (!CHANNEL_ID) {
	log.error('No channel ID. Exiting')
	process.exit(1)
}

// Spin up bot
const bot = new Discord.Client()
bot.on('ready', async () => {
	log.info('Discord login successful!')

	const channel = await bot.channels.fetch(CHANNEL_ID)

	// Initialise discord presence
	initPresence(bot)
	// Initialise listeners
	initSchedules(channel)
	log.info('Codex initialised')

	channel.send("Codex initialised")
})

bot.on('message', message => {
	// Ignore bots
	if (message.author.bot) {
		return
	}
	// Listen only to channel
	if (!message.channel || message.channel.id !== CHANNEL_ID) {
		return
	}

	if (message.content === "ping") {
		message.channel.send("pong")
	}
})

bot.login(TOKEN)
