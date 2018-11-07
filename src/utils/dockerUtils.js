const Docker = require('dockerode');
const uuidv4 = require('uuid/v4');
const { readData, storeData } = require('./dataUtils');

const docker = new Docker();

async function untilFinished(stream) {
  return new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, res) => (err ? reject(err) : resolve(res)));
  });
}

async function killContainer(id) {
  try {
    const container = await docker.getContainer(id);
    await container.remove({ force: true });
  } catch (error) {
    // ignore error
  }
}


async function getImageName({ create } = {}) {
  const instanceData = await readData();
  if (create && !instanceData.imageName) {
    instanceData.imageName = `bitcoin-testbox-${uuidv4().split('-')[0]}`;
    await storeData(instanceData);
  }
  return instanceData.imageName;
}

module.exports = {
  untilFinished,
  getImageName,
  docker,
  killContainer,
};
