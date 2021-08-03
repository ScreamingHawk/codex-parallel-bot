require('dotenv').config()
const { transports, createLogger, format } = require('winston')

const { ADMIN_OVERRIDE } = process.env

const log = createLogger({
	level: 'debug',
	format: format.combine(
		format.timestamp(),
		format.printf(
			info => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`,
		),
	),
	transports: [new transports.Console()],
})

module.exports = log

module.exports.sendErr = async (bot, err) => {
	log.error(err)
	if (bot && ADMIN_OVERRIDE) {
		const user = await bot.users.fetch(ADMIN_OVERRIDE)
		if (user) {
			user.send(err)
		}
	}
}
