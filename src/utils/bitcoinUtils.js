const crypto = require('crypto');
const util = require('util');
const { readData, storeData } = require('./dataUtils');

const randomBytes = util.promisify(crypto.randomBytes);

async function generateSalt() {
  const bytes = await randomBytes(16);
  return bytes.toString('hex');
}

function hmac(key, msg) {
  return crypto.createHmac('sha256', key)
    .update(msg)
    .digest('hex');
}

async function generatePassword() {
  const bytes = await randomBytes(32);
  return bytes.toString('base64');
}

async function generateRpcAuthCredentials() {
  const username = 'bitcoin-testbox';
  const [salt, password] = await Promise.all([
    generateSalt(),
    generatePassword(),
  ]);

  return {
    rpcauth: `${username}:${salt}$${hmac(salt, password)}`,
    username,
    password,
  };
}

async function getRpcAuthCredentials() {
  const instanceData = await readData();
  if (!instanceData.rpcAuthCredentials) {
    instanceData.rpcAuthCredentials = await generateRpcAuthCredentials();
    await storeData(instanceData);
  }

  return instanceData.rpcAuthCredentials;
}

module.exports = {
  getRpcAuthCredentials,
};
