const Discord = require('discord.js')
const moment = require('moment')
const { BigNumber } = require('ethers')
const log = require('../util/logger')
const openseaApi = require('../util/openseaApi')
const { formatEther, formatEtherDollar } = require('../util/format')

const CARD_CHECK_INTERVAL = 30 * 1000 // 30 sec
let cardSalesInterval
let lastChecked

const checkCardSales = async (bot, channel) => {
	log.debug('Running check card sales')

	const newNow = moment()
	const orders = await openseaApi.getCardOrders(lastChecked)
	if (orders && orders.asset_events) {
		log.debug(`Got ${orders.asset_events.length} orders`)
		if (orders.asset_events.length > 0) {

			// Sort by date
			orders.asset_events.sort((a, b) => moment(a.created_date).diff(moment(b.created_date)))

			for (const event of orders.asset_events){
				const { asset, payment_token, seller, winner_account } = event
				const usdPriceCents = Number.parseInt(Number.parseFloat(payment_token.usd_price) * 100)
				const totalGwei = BigNumber.from(event.total_price)
				const totalEther = totalGwei.mul(Number.parseFloat(payment_token.eth_price))
				const totalDollar = totalGwei.mul(usdPriceCents).div(100)
				const quantity = Number.parseInt(event.quantity)
				const s = quantity > 1 ? "s" : ""
				const were = quantity > 1 ? "were" : "was"

				// Embed
				const embed = new Discord.MessageEmbed()
					.setTitle(`${asset.name}`)
					.setColor(0x1890dc)
					.setImage(asset.image_url)

				embed.addField('Description', `${quantity} ${asset.name}${s} ${were} purchased`, false)

				// Amounts
				if (quantity > 1) {
					// Each
					embed.addField('Ethereum', `Ξ${formatEther(totalEther)} (Ξ${formatEther(totalEther.div(quantity))} each)`, true)
					embed.addField('USD', `${formatEtherDollar(totalDollar)} (${formatEtherDollar(totalDollar / quantity)} each)`, true)
				} else {
					embed.addField('Ethereum', `Ξ${formatEther(totalEther)}`, true)
					embed.addField('USD', `${formatEtherDollar(totalDollar)}`, true)
				}
				embed.addField('Sale Token', payment_token.symbol, true)

				// Addresses
				const sellerName = !seller.user?.username ? '' : ` (${seller.user.username})`
				const winnerName = !winner_account.user?.username ? '' : ` (${winner_account.user.username})`
				embed.addField('From', `${seller.address}${sellerName}`)
				embed.addField('To', `${winner_account.address}${winnerName}`)

				embed.addField('Links', `View on [OpenSea](${asset.permalink})`, false)
				embed.setFooter('Data provided by OpenSea', bot.user.displayAvatarURL())

				channel.send({ embed })
			}
			lastChecked = newNow
		}
	}
}

const initSchedules = async (bot, channel) => {
	lastChecked = moment()
	if (cardSalesInterval) {
		clearInterval(cardSalesInterval)
	}
	cardSalesInterval = setInterval(() => checkCardSales(bot, channel), CARD_CHECK_INTERVAL)

	log.info('Configured schedules')
}

module.exports = {
	initSchedules,
}
