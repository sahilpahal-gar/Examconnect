const fs = require('node:fs/promises');
const path = require('node:path');
const { fetchAllSources } = require('../server/services/notificationFetcher');
const { deduplicate } = require('../server/services/normalizer');

async function main() {
  const root = path.join(__dirname, '..');
  const sourcePath = path.join(root, 'server/config/sources.json');
  const dataPath = path.join(root, 'server/data/exams.json');
  const sources = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
  const existing = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  const { records, results } = await fetchAllSources(sources);
  const merged = deduplicate([...existing, ...records]);
  await fs.writeFile(dataPath, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`Sources checked: ${results.length}; extracted: ${records.length}; dataset: ${merged.length}`);
  for (const result of results) console.log(`${result.source.organization}: ${result.error ? `FAILED (${result.error})` : `OK (${result.records.length} records)`}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
