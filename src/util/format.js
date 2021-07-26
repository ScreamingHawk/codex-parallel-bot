const { ethers } = require('ethers')

const { formatEther } = ethers.utils

const formatDollar = num => `$${Number.parseFloat(num).toFixed(2)}`

module.exports = {
	formatNumber: num => Number.parseFloat(num).toPrecision(4),
	formatEther, // Expects BigNumber
	formatEtherDollar: num => formatDollar(formatEther(num)), // Expects BigNumber
	formatDollar,
}
