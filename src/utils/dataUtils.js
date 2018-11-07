const fs = require('fs');
const util = require('util');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', '..', 'instanceData.json');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);

async function readData() {
  try {
    return JSON.parse(await readFile(DATA_PATH));
  } catch (error) {
    return {};
  }
}

async function storeData(data) {
  return writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

async function clearData() {
  return unlink(DATA_PATH);
}

module.exports = {
  readData,
  storeData,
  clearData,
};
