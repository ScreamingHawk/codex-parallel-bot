const fetch = require('node-fetch')
const log = require('./logger')
const { CARD_CONTRACT } = require('./constants')

const OPENSEA_URL = 'https://opensea.io/assets'
const OPENSEA_API = 'https://api.opensea.io/api/v1'

const API_LIMIT = 5

const getCardUrl = id => `${OPENSEA_URL}/${CARD_CONTRACT}/${id}`

const getCard = async id => {
	const api = `${OPENSEA_API}/asset/${CARD_CONTRACT}/${id}`
	log.debug(`Requesting ${api}`)
	const res = await fetch(api)
	return await res.json()
}

const getCardOrders = async after => {
	let api = `${OPENSEA_API}/events?asset_contract_address=${CARD_CONTRACT}&event_type=successful&limit=${API_LIMIT}`
	if (after) {
		// Add unix timestamp
		api += `&occurred_after=${after.unix()}`
	}
	log.debug(`Requesting ${api}`)
	const res = await fetch(api)
	return await res.json()
}

module.exports = {
	getCardUrl,
	getCard,
	getCardOrders,
}
