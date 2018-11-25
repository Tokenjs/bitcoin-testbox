const {
  docker, getImageName, killContainer, untilMultiplexFinished,
} = require('./utils/dockerUtils');
const { getRpcAuthCredentials } = require('./utils/bitcoinUtils');

let imageName;

const CONTAINER_PORT = 18443;

async function start({ verbose, port = CONTAINER_PORT } = {}) {
  imageName = imageName || await getImageName();

  await killContainer(imageName);

  const { rpcauth, username, password } = await getRpcAuthCredentials();

  const container = await docker.createContainer({
    Image: imageName,
    name: imageName,
    Cmd: [
      '-server=1',
      '-regtest=1',
      '-rpcallowip=0.0.0.0/0',
      `-rpcauth=${rpcauth}`,
      ...(verbose ? ['-printtoconsole', '-debug=http'] : []),
    ],
    HostConfig: {
      PublishAllPorts: true,
      PortBindings: {
        [`${CONTAINER_PORT}/tcp`]: [
          { HostPort: port.toString() },
        ],
      },
    },
  });

  await container.start();
  await new Promise((resolve, reject) => {
    container.attach({ stream: true, stdout: true, stderr: true }, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }

      stream.on('data', (data) => {
        const message = data.toString();
        if (verbose) {
          console.log(message); // eslint-disable-line no-console
        }

        if (message.includes('init message: Done loading')) {
          if (!verbose) {
            stream.destroy();
          }
          resolve();
        }
      });
    });
  });

  return {
    host: '127.0.0.1',
    port,
    username,
    password,
  };
}

async function bitcoinCli(command) {
  const container = docker.getContainer(imageName);
  const execution = await container.exec({
    Cmd: ['bitcoin-cli', '-regtest', ...command],
    user: 'bitcoin',
    AttachStdin: false,
    AttachStdout: true,
    AttachStderr: true,
  });
  return new Promise((resolve, reject) => {
    execution.start((err, stream) => {
      if (err) {
        reject(err);
        return;
      }

      untilMultiplexFinished(stream)
        .then(resolve)
        .catch(reject);
    });
  });
}

async function stop() {
  await killContainer(imageName);
}

module.exports = {
  start,
  bitcoinCli,
  stop,
};
