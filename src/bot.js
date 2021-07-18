require('dotenv').config()
const log = require('./util/logger')
const Discord = require('discord.js')
const ethers = require('ethers')
const { initListeners } = require('./events/listeners')
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
const PREFIX = process.env.PREFIX || '#'
log.info(`Prefix is ${PREFIX}`)
const {
	INFURA_PROJECT_ID,
	INFURA_PROJECT_SECRET,
	CHANNEL_ID,
} = process.env
if (!INFURA_PROJECT_ID || !INFURA_PROJECT_SECRET) {
	log.error(
		'Running without Infura API details. You will not be able to do anything on chain',
	)
}
if (!CHANNEL_ID) {
	log.error('Running without channel ID.')
}

// Spin up bot
const bot = new Discord.Client()
const provider = new ethers.providers.InfuraProvider(
	'homestead',
	INFURA_PROJECT_ID,
)
provider.ready.then(() => {
	log.info('Infura provider is ready')
})
bot.on('ready', async () => {
	log.info('Discord login successful!')

	// Initialise discord presence
	initPresence(bot)
	// Initialise listeners
	initListeners(bot)
	log.info('Codex initialised')

	const channel = await bot.channels.fetch(CHANNEL_ID)
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
		message.send("pong")
	}
})

bot.login(TOKEN)
