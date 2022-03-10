const https = require('https');
const fs = require('fs');
const qs = require('querystring');
const path = require('path');

const parseQS = (url, p) => qs.parse(url.replace(p, '').replace('?', ''));

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length) {
	var result           = '';
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() *
			charactersLength));
	}
	return result;
}

let name = '';
let id = 'testid';
let filename = 'data/test.file';

function checkHttpMethod(method1, method2) {
	if ( method1.toLowerCase() !== method2.toLowerCase() ) {
		throw 'Request method is not GET';
	}
}

function checkKey(req) {
	const key = req.headers['t-key'];
	if ( key === undefined ) {
		throw 'There is not have `t-key` header parameter';
	}

	if ( key !== id ) {
		throw 'Mismatch `t-key` header parameter';
	}
}

const TEST_STEPS = {
	'/step1/'(req, res) {
		console.log('1. Http request for GET method');

		checkHttpMethod(req.method, 'GET');

		const query = parseQS(req.url, '/step1/');
		if ( !query.name ) {
			throw 'Ther is no `name` parameter.';
		}

		name = query.name;
		id = makeid(32);

		res.end(id + '\n');
	},
	'/step2/'(req, res) {
		console.log('2. Http request for POST method');
		checkHttpMethod(req.method, 'POST');
		checkKey(req);

		if ( !req.body ) {
			throw 'There is not have HTTP Body contents';
		}


		let json = null;
		try {
			json = JSON.parse(req.body.toString('utf8'));
		} catch {
			throw 'HTTP Body is can not parse JSON type.';
		}

		const target = path.join(__dirname, 'data', json.filename || '');
		if ( !json.filename || fs.existsSync(target) ) {
			res.end(JSON.stringify({
				error: true,
				msg: 'Can not create your file.',
			}) + '\n');
			return;
		}

		filename = target;

		res.end(JSON.stringify({
			error: false,
			msg: `You can create [${json.filename}] file.`,
		}) + '\n');
	},
	'/step3/'(req, res) {
		console.log('3. Http request for PUT method');
		checkHttpMethod(req.method, 'PUT');
		checkKey(req);

		const oriBuf = fs.readFileSync('./a.out');
		if ( Buffer.compare(oriBuf, req.body) !== 0 ) {
			throw 'The uploaded data is not the desired data.';
		}

		fs.writeFileSync(filename, req.body);

		res.end();
	},
	'/step4/'(req, res) {
		console.log('4. Http request for DELETE method');
		checkHttpMethod(req.method, 'DELETE');
		checkKey(req);

		fs.unlinkSync(filename);
		res.end();
	},
};

https.createServer({
	key: fs.readFileSync('./ssl/private.key'),
	cert: fs.readFileSync('./ssl/private.crt'),
}, async (req, res) => {
	const buffers = [];

	for await (const chunk of req) {
		buffers.push(chunk);
	}

	req.body = Buffer.concat(buffers);
	const url = req.url.split('?')[0];
	if ( TEST_STEPS[url] ) {
		try {
			TEST_STEPS[url](req, res);
			console.log('  -> success');
		} catch(err) {
			if ( typeof err === 'string' ) {
				console.error('FAIL:', err);
			} else {
				console.error(err);
			}
			res.writeHead(500);
			res.end('fail\n');
		}
	} else {
		throw Error(`Wrong request url. [${req.url}]`);
	}
}).listen(8443);
