require('dotenv').config()
const fetch = require('node-fetch')
const log = require('./logger')
const { CARD_CONTRACT } = require('./constants')

const OPENSEA_URL = 'https://opensea.io/assets'
const OPENSEA_API = 'https://api.opensea.io/api/v1'

const API_LIMIT = 15

const { OPENSEA_API_KEY } = process.env
const headers = OPENSEA_API_KEY ? {"X-API-KEY": OPENSEA_API_KEY } : {}

const getCardUrl = id => `${OPENSEA_URL}/${CARD_CONTRACT}/${id}`

const makeRequest = async api => {
	log.debug(`Requesting ${api}`)
	const res = await fetch(api, {method: 'GET', headers})
	return await res.json()
}

const getCard = async id => {
	const api = `${OPENSEA_API}/asset/${CARD_CONTRACT}/${id}`
	return await makeRequest(api)
}

const getCardEvents = async after => {
	let api = `${OPENSEA_API}/events?asset_contract_address=${CARD_CONTRACT}&event_type=successful&limit=${API_LIMIT}`
	if (after) {
		// Add unix timestamp
		api += `&occurred_after=${after.unix()}`
	}
	return await makeRequest(api)
}

const getCardDetails = async cardIds => {
	let api = `${OPENSEA_API}/assets?asset_contract_address=${CARD_CONTRACT}&token_ids=${cardIds.join('&token_ids=')}`
	return await makeRequest(api)
}

module.exports = {
	getCardUrl,
	getCard,
	getCardEvents,
	getCardDetails,
}
