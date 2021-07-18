const moment = require('moment')
const { ethers, BigNumber } = require('ethers')
const log = require('../util/logger')
const openseaApi = require('../util/openseaApi')
const { formatEther, formatDollar } = require('../util/format')

const CARD_CHECK_INTERVAL = 30 * 1000 // 30 sec
let lastChecked = moment().add(-30, "minutes")

const checkCardSales = async channel => {
	log.debug('Running check card sales')

	const newNow = moment()
	const orders = await openseaApi.getCardOrders(lastChecked)
	if (orders && orders.asset_events) {
		log.debug(`Got ${orders.asset_events.length} orders`)
		if (orders.asset_events.length > 0) {
			for (const event of orders.asset_events){
				const { asset, payment_token } = event
				const totalGwei = BigNumber.from(event.total_price)
				const totalEther = formatEther(totalGwei)
				const totalDollar = Number.parseFloat(totalEther) * payment_token.usd_price
				const msg = `${asset.name} sold for Ξ${totalEther} (${formatDollar(totalDollar)})`
				channel.send(msg)
			}
			lastChecked = newNow
		}
	}
}

const initSchedules = async channel => {
	setInterval(() => checkCardSales(channel), CARD_CHECK_INTERVAL)

	log.info('Configured schedules')
}

module.exports = {
	initSchedules,
}
