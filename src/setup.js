/* eslint-disable no-console */
const { docker, untilFinished, getImageName } = require('./utils/dockerUtils');
const bitcoin = require('./index');

async function run() {
  const imageName = await getImageName({ create: true });

  const stream = await docker.buildImage({
    context: __dirname,
    src: ['../Dockerfile'],
  }, { t: imageName });

  const logs = await untilFinished(stream);
  console.log(logs);

  await bitcoin.start();
  process.stdout.write('Generating 100 bootstrap blocks... ');
  await bitcoin.bitcoinCli(['generate', '100']);
  process.stdout.write('Done!\n');
  await bitcoin.stop();
}

run()
  .catch((error) => {
    console.error('Could not finish setting up bitcoin-testbox', error.stack);
    process.exit(1);
  });
