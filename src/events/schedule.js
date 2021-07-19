const Discord = require('discord.js')
const moment = require('moment')
const { BigNumber } = require('ethers')
const log = require('../util/logger')
const openseaApi = require('../util/openseaApi')
const { formatEther, formatDollar } = require('../util/format')

const CARD_CHECK_INTERVAL = 30 * 1000 // 30 sec
let lastChecked = moment()

const checkCardSales = async (bot, channel) => {
	log.debug('Running check card sales')

	const newNow = moment()
	const orders = await openseaApi.getCardOrders(lastChecked)
	if (orders && orders.asset_events) {
		log.debug(`Got ${orders.asset_events.length} orders`)
		if (orders.asset_events.length > 0) {
			//TODO Order by date
			for (const event of orders.asset_events){
				const { asset, payment_token } = event
				const totalGwei = BigNumber.from(event.total_price)
				const totalEther = formatEther(totalGwei)
				const totalDollar = Number.parseFloat(totalEther) * payment_token.usd_price

				// Embed
				const embed = new Discord.MessageEmbed()
					.setTitle(`${asset.name}`)
					.setColor(0x1890dc)
					.setImage(asset.image_url)

				embed.addField('Description', `${asset.name} was Purchased`, false)

				// Amounts
				embed.addField('Ethereum', `Ξ${totalEther}`, true)
				embed.addField('USD', `${formatDollar(totalDollar)}`, true)

				// Addresses
				embed.addField('From', event.seller.address)
				embed.addField('To', event.winner_account.address)

				embed.addField('Links', `View on [OpenSea](${asset.permalink})`, false)
				embed.setFooter('Data provided by OpenSea', bot.user.displayAvatarURL())

				channel.send({ embed })
			}
			lastChecked = newNow
		}
	}
}

const initSchedules = async (bot, channel) => {
	setInterval(() => checkCardSales(bot, channel), CARD_CHECK_INTERVAL)

	log.info('Configured schedules')
}

module.exports = {
	initSchedules,
}
