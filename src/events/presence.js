const initPresence = bot => {
	bot.user.setActivity("MilkyTaste", { type: 'LISTENING' })
}

module.exports = {
	initPresence,
}
