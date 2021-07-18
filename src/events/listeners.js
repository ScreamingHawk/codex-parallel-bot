const log = require('../util/logger')

let bot

const initListeners = async botArg => {
	bot = botArg

	//TODO

	log.info('Listening for events')
}

module.exports = {
	initListeners,
}
