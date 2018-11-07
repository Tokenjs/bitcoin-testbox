const BitcoinClient = require('bitcoin-core');
const ipRegex = require('ip-regex');
const bitcoinTestbox = require('./index');

const {
  objectContaining, arrayContaining, stringMatching, any,
} = expect;

describe('bitcoin-testbox', () => {
  afterEach(async () => {
    await bitcoinTestbox.stop();
  });

  it('should allow connecting', async () => {
    const credentials = await bitcoinTestbox.start();

    const client = new BitcoinClient({ ...credentials });

    const blockChainInfo = await client.getNetworkInfo();
    expect(blockChainInfo).toEqual(objectContaining({
      networkactive: true,
    }));
  });

  it('should allow generating blocks', async () => {
    const credentials = await bitcoinTestbox.start();

    const client = new BitcoinClient({ ...credentials });

    expect(await client.generate(1)).toEqual(arrayContaining([
      any(String),
    ]));
  });

  describe('start()', () => {
    it('should return credentials', async () => {
      const credentials = await bitcoinTestbox.start();
      expect(credentials).toEqual(objectContaining({
        host: stringMatching(ipRegex()),
        port: any(Number),
        username: any(String),
        password: any(String),
      }));
    });
  });
});
