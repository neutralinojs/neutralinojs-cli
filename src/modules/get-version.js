const https = require('https');
const semver = require('semver');

module.exports = (client = false) => {
	return new Promise((resolve, reject) => {
		let body = ''
		https.get({
			host: 'api.github.com',
			path: client ? '/repos/neutralinojs/neutralino.js/tags' : '/repos/neutralinojs/neutralinojs/tags',
			headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246' }
		}, response => {
			response.on("data", chunk => body += chunk)
			response.on("end", () => {
				try {
					let releaseData = JSON.parse(body.toString())
					let version = releaseData[0]?.name?.substring(1);
					if (!semver.valid(version)) {
						reject(null)
					} else {
						resolve(version)
					}
				} catch (err) {
					reject(null);
				}
			})
		});
	});
}
