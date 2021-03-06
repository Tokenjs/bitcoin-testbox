const { PassThrough } = require('stream');
const Docker = require('dockerode');
const uuidv4 = require('uuid/v4');
const { readData, storeData } = require('./dataUtils');

const docker = new Docker();

async function untilFinished(stream) {
  return new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, res) => (err ? reject(err) : resolve(res)));
  });
}

async function untilMultiplexFinished(stream) {
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  docker.modem.demuxStream(stream, stdout, stderr);

  return new Promise((resolve, reject) => {
    let result = '';
    let error = '';
    stdout.on('data', (data) => {
      result += data.toString();
    });
    stderr.on('data', (data) => {
      error += data.toString();
    });

    stream.on('end', () => (error ? reject(error) : resolve(result)));
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
  untilMultiplexFinished,
  getImageName,
  docker,
  killContainer,
};
