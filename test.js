const fs = require('fs');
const path = require('path');

const URL = 'https://localhost:8443';

const args = process.argv.splice(2);

if ( !fs.existsSync(args[0]) ) {
	Exception(`${args[0]} is not exists.`);
}


const HttpRequest = require(args[0]);
const NAME = path.dirname(args[0]);

function Exception(msg) {
	console.error('FAIL:', msg);
	process.exit(0);
}

(async () => {
	console.log('1. Http request for GET method');
	const code = await (async () => {
		const res = await (new HttpRequest()
			.Url(URL + `/step1/?name=${NAME}`)
			.Method('GET')
			.Send());

		if ( res.code !== 200 ) {
			Exception('HTTP response status is not 200');
		}

		return res.data;
	})();

	console.log('2. Http request for POST method');
	await (async () => {
		const res = await (new HttpRequest()
			.Url(URL + '/step2/')
			.Method('POST')
			.Header('t-key', code)
			.Header('content-type', 'application/json')
			.Body(Buffer.from(JSON.stringify({
				filename: 'tmp.file',
			}), 'utf8'))
			.Send());


		const body = JSON.parse(res.data);
		if ( res.code !== 200 ) {
			Exception('HTTP response status is not 200');
		}

		if ( !body.error ) {
			Exception('Originally there should be an body.error.');
		}
	})();

	console.log('2. Http request for POST method');
	await (async () => {
		const res = await (new HttpRequest()
			.Url(URL + '/step2/')
			.Method('POST')
			.Header('t-key', code)
			.Header('content-type', 'application/json')
			.Body(Buffer.from(JSON.stringify({
				filename: NAME,
			}), 'utf8'))
			.Send());


		const body = JSON.parse(res.data);
		if ( res.code !== 200 ) {
			Exception('HTTP response status is not 200');
		}

		if ( body.error ) {
			Exception(body.msg);
		}
	})();

	console.log('3. Http request for PUT method');
	await (async () => {
		const res = await (new HttpRequest()
			.Url(URL + '/step3/')
			.Method('PUT')
			.Header('t-key', code)
			.Header('content-type', 'application/octet-stream')
			.Body(fs.readFileSync('./a.out'))
			.Send());


		if ( res.code !== 200 ) {
			Exception('HTTP response status is not 200');
		}
	})();

	console.log('4. Http request for DELETE method');
	await (async () => {
		const res = await (new HttpRequest()
			.Url(URL + '/step4/')
			.Method('DELETE')
			.Header('t-key', code)
			.Send());


		if ( res.code !== 200 ) {
			Exception('HTTP response status is not 200');
		}
	})();

	console.log('5. Http request for error status code');
	await (async () => {
		try {
			const res = await (new HttpRequest()
				.Url(URL + '/step2/')
				.Method('POST')
				.Send());
		} catch(res) {


			if ( res.code !== 500 ) {
				Exception('HTTP response status is not 500');
			}
		}
	})();

	console.log('PASS');

})();
