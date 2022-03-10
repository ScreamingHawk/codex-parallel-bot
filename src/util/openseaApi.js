require('dotenv').config()
const fetch = require('node-fetch')
const moment = require('moment')
const log = require('./logger')
const { CARD_CONTRACT, OPENSEA_SLUG } = require('./constants')

const OPENSEA_URL = 'https://opensea.io/assets'
const OPENSEA_API = 'https://api.opensea.io/api/v1'

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

const filterEvents = (results, after) => {
	let events = []
	if (results && results.asset_events) {
		if (after) {
			// Filter by time
			events = results.asset_events.filter(e => moment.utc(e.created_date) > after)
		}
	}
	return events
}

const getCardEvents = async after => {
	const api = `${OPENSEA_API}/events?collection_slug=${OPENSEA_SLUG}&event_type=successful`
	const results = await makeRequest(api)
	return filterEvents(results, after)
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
