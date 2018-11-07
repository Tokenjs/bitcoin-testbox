/* eslint-disable no-console */
const { clearData } = require('./utils/dataUtils');
const { docker, getImageName } = require('./utils/dockerUtils');

async function run() {
  const imageName = await getImageName();
  if (!imageName) {
    return;
  }

  const image = docker.getImage(imageName);
  await image.remove();
  await clearData();
}

run()
  .catch((error) => {
    console.error('Could not finish uninstalling bitcoin-testbox', error.stack);
    process.exit(1);
  });
