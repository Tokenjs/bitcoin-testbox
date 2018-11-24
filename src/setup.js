/* eslint-disable no-console */
const http = require('http');
const { docker, untilFinished, getImageName } = require('./utils/dockerUtils');
const bitcoin = require('./index');

async function generateBootstrapConfirmations({
  host, port, username, password,
}) {
  return new Promise((resolve, reject) => {
    const data = '{"jsonrpc":"1.0","id":"1","method":"generate","params":[100]}';

    const req = http.request({
      hostname: host,
      auth: `${username}:${password}`,
      port,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      if (res.statusCode === 200) {
        resolve();
      } else {
        reject();
      }
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  const imageName = await getImageName({ create: true });

  const stream = await docker.buildImage({
    context: __dirname,
    src: ['../Dockerfile'],
  }, { t: imageName });

  const logs = await untilFinished(stream);
  console.log(logs);

  const credentials = await bitcoin.start();
  await generateBootstrapConfirmations(credentials);
  await bitcoin.stop();
}

run()
  .catch((error) => {
    console.error('Could not finish setting up bitcoin-testbox', error.stack);
    process.exit(1);
  });
