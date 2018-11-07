/* eslint-disable no-console */
const { docker, untilFinished, getImageName } = require('./utils/dockerUtils');

async function run() {
  const imageName = await getImageName({ create: true });

  const stream = await docker.buildImage({
    context: __dirname,
    src: ['../Dockerfile'],
  }, { t: imageName });

  const logs = await untilFinished(stream);
  console.log(logs);
}

run()
  .catch((error) => {
    console.error('Could not finish setting up bitcoin-testbox', error.stack);
    process.exit(1);
  });
