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
	PS15_CHANNEL_ID,
	ADMIN_OVERRIDE,
} = process.env
if (!CHANNEL_ID) {
	log.error('No channel ID. Exiting')
	process.exit(1)
}

// Spin up bot
const bot = new Discord.Client()
bot.on('ready', async () => {
	log.info('Discord login successful!')

	// Initialise discord presence
	initPresence(bot)
	// Initialise listeners
	initSchedules(bot)

	log.info(`Initialisation complete`)
})

bot.on('message', async message => {
	// Ignore bots
	if (message.author.bot) {
		return
	}
	// Listen only to channel
	if (!message.channel || 
			(message.channel.id !== CHANNEL_ID && message.channel.id !== PS15_CHANNEL_ID)) {
		return
	}

	// Listen only to admins
	const { member } = message
	if (!member || (!member.hasPermission('ADMINISTRATOR') && member.id !== ADMIN_OVERRIDE)){
		return
	}

	if (message.content === "ping") {
		message.channel.send("🏓 pong")
	} else if (message.content === "restart" || message.content === "reboot") {
		log.info("Rebooting...")
		message.channel.send("🔌 Rebooting...")
		initSchedules(bot)
		message.channel.send("🤖 Codex is now operational")
	}
})

bot.login(TOKEN)
