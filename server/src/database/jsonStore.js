const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");

/**
 * A very small JSON-file storage, for development only.
 * Each collection is one file, for example: server/data/users.json
 *
 * Only repositories use this file.
 * TODO (backend team): replace it with a real database (MongoDB / PostgreSQL).
 */
function createStore(collectionName) {
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);

  // Changes run one after another, so two requests can't overwrite each other
  let queue = Promise.resolve();

  async function readAll() {
    try {
      const text = await fs.readFile(filePath, "utf8");
      return JSON.parse(text);
    } catch (err) {
      if (err.code === "ENOENT") return []; // the file doesn't exist yet
      throw err;
    }
  }

  /**
   * Read → change → save, safely.
   * changeFn receives the current items and must return { items, result }.
   */
  function update(changeFn) {
    const job = queue.then(async () => {
      const items = await readAll();
      const { items: nextItems, result } = await changeFn(items);

      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(nextItems, null, 2));

      return result;
    });

    queue = job.catch(() => {}); // keep the queue working after an error
    return job;
  }

  return { readAll, update };
}

module.exports = { createStore };