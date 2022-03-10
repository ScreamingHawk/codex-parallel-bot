require('dotenv').config()
const Discord = require('discord.js')
const moment = require('moment')
const { BigNumber } = require('ethers')
const log = require('../util/logger')
const openseaApi = require('../util/openseaApi')
const { formatEther, formatDollar } = require('../util/format')
const { PARALLEL_COLORS, PS15 } = require('../util/constants')

const { CHANNEL_ID, PS15_CHANNEL_ID } = process.env

const CARD_CHECK_INTERVAL = 30 * 1000 // 30 sec
let cardSalesInterval
let lastChecked

const checkCardSales = async (bot, channel, ps15Channel) => {
	log.debug('Running check card sales')

	const newNow = moment()
	const events = await openseaApi.getCardEvents(lastChecked)
	log.debug(`Got ${events.length} orders`)
	if (events.length > 0) {

		// Sort by date
		events.sort((a, b) => moment(a.created_date).diff(moment(b.created_date)))

		// Get extra card details
		let details = {}
		try {
			const cardIds = events?.map(event => event?.asset?.token_id)
			if (cardIds.length > 0) {
				// Trim details
				(await openseaApi.getCardDetails(cardIds))?.assets?.forEach(card => {
					let floor = null
					const { sell_orders, traits, token_id } = card
					if (sell_orders && sell_orders.length > 0) {
						const { current_price, quantity, payment_token_contract } = sell_orders[0]
						const floorGwei = BigNumber.from(current_price.split('.')[0])
						floor = floorGwei.div(Number.parseFloat(quantity)).mul(Number.parseFloat(payment_token_contract.eth_price))
					}
					details[token_id] = {
						floor,
						parallel: traits ? traits.find(t => t.trait_type === 'Parallel')?.value : null,
					}
				})
			}
		} catch (err) {
			// Log and continue
			log.sendErr(bot, `Unable to get card details: ${err}`)
		}

		for (const event of events){
			try {
				const { asset, asset_bundle, payment_token, seller, winner_account } = event

				const totalGwei = BigNumber.from(event.total_price)
				const totalEther = totalGwei.mul(Number.parseFloat(payment_token.eth_price))
				const totalDollar = Number.parseFloat(formatEther(totalGwei)) * payment_token.usd_price
				const quantity = Number.parseInt(event.quantity)
				const s = quantity > 1 ? "s" : ""
				const were = quantity > 1 ? "were" : "was"

				// Embed
				const embed = new Discord.MessageEmbed()
					.setColor(0x999999)

				if (asset != null) {
					embed.setTitle(`${asset.name}`)
						.setImage(asset.image_url)

						embed.addField('Description', `${quantity} ${asset.name}${s} ${were} purchased`, false)
				} else {
					embed.setTitle(`Bundle was purchased`)
					embed.addField('Items', asset_bundle.assets.map(ass => ass.name).join('\n'), false)
				}


				// Amounts
				if (quantity > 1) {
					// Each
					embed.addField('Ethereum', `Ξ${formatEther(totalEther)} (Ξ${formatEther(totalEther.div(quantity))} each)`, true)
					embed.addField('USD', `${formatDollar(totalDollar)} (${formatDollar(totalDollar / quantity)} each)`, true)
				} else {
					embed.addField('Ethereum', `Ξ${formatEther(totalEther)}`, true)
					embed.addField('USD', `${formatDollar(totalDollar)}`, true)
				}
				embed.addField('Sale Token', payment_token.symbol, true)

				if (asset && details[asset.token_id]) {
					const { floor, parallel } = details[asset.token_id]
					if (floor) {
						// Floor
						embed.addField('New Floor', `Ξ${formatEther(floor)}`, true)
					}
					if (parallel && PARALLEL_COLORS[parallel]) {
						// Color with parallel
						embed.setColor(PARALLEL_COLORS[parallel])
					}
				}

				// Addresses
				const sellerName = !seller.user?.username ? '' : ` (${seller.user.username})`
				const winnerName = !winner_account.user?.username ? '' : ` (${winner_account.user.username})`
				embed.addField('From', `${seller.address}${sellerName}`)
				embed.addField('To', `${winner_account.address}${winnerName}`)

				if (asset != null) {
					embed.addField('Links', `View on [OpenSea](${asset.permalink})`, false)
				}
				embed.setFooter('Data provided by OpenSea', bot.user.displayAvatarURL())

				if (PS15.indexOf(asset?.name) > -1) {
					ps15Channel.send({ embed })
				} else {
					channel.send({ embed })
				}
			} catch (err) {
				log.sendErr(bot, `Error reading sale: ${err}`)
			}
		}
		lastChecked = newNow
	}
}

const initSchedules = async bot => {

	const channel = await bot.channels.fetch(CHANNEL_ID)
	const ps15Channel = await bot.channels.fetch(PS15_CHANNEL_ID || CHANNEL_ID)
	log.sendInfo(bot, `Codex initialised for ${channel.guild?.name}'s ${channel.name}: ${CHANNEL_ID}`)
	log.sendInfo(bot, `Codex initialised for PS15 ${ps15Channel.guild?.name}'s ${ps15Channel.name}: ${PS15_CHANNEL_ID}`)

	lastChecked = moment()
	if (cardSalesInterval) {
		clearInterval(cardSalesInterval)
	}
	cardSalesInterval = setInterval(() => checkCardSales(bot, channel, ps15Channel), CARD_CHECK_INTERVAL)
	checkCardSales(bot, channel, ps15Channel) // Run it now

	log.info('Configured schedules')
}

module.exports = {
	initSchedules,
}
