/* Author: raravel (개발자 윤군)
 *
 * Never use http, https or npm modules. !!!
 * Create your own folder by copying the current file.
 * When you enter a command and finally `PASS` is displayed, it is a success.
 *
 * Server run command: `node server.js`
 * Test run command: `node test.js ./[your name]/http-request.js`
 *
 * The test must be in the running state of the server.
 * You can input code anywere but you can't remove any default code.
 */

const fs = require('fs');
const path = require('path');


// You can use this cert for https request.
const CERT = fs.readFileSync(path.join(__dirname, '../ssl/ca.pem'), 'utf8');

class HttpResponse {

	// type number
	get status() {
		// http status code
	}

	// type string
	get data() {
		// response http body
	}

}

class HttpRequest {

	url = '';
	options = {
		method: '',
		headers: {},
	};
	body = '';

	constructor() {
	}

	Url(url) {
		this.url = url;
		return this;
	}

	Method(method) {
		this.options.method = method;
		return this;
	}

	Header(key, value) {
		this.options.headers[key.toLowerCase()] = value;
		return this;
	}

	Body(value) {
		this.body = value;
		return this;
	}

	Send() {
		return new Promise((resolve, reject) => {
			if ( /* When status 200 */ ) {
				resolve(/* HttpResponse */);
			} else {
				reject(/* HttpResponse */);
			}
		});
	}

}

module.exports = HttpRequest;
