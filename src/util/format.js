const { ethers } = require('ethers')

module.exports = {
	formatNumber: num => Number.parseFloat(num).toPrecision(4),
	formatEther: ethers.utils.formatEther, // Expects BigNumber
	formatDollar: num => `$${Number.parseFloat(num).toFixed(2)}`,
}
