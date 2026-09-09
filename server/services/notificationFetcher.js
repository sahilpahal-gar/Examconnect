const { parserFor } = require('./parser');
const { normalizeNotification, deduplicate } = require('./normalizer');

async function fetchSource(source, { timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(source.url, { signal: controller.signal, headers: { 'user-agent': 'ExamConnect/1.0 (+official-source-ingestion)' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const raw = parserFor(source.organization).parse(html, source);
    return { source, records: raw.map((item) => normalizeNotification(item, source)).filter(Boolean), error: null };
  } catch (error) {
    return { source, records: [], error: error.message };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchAllSources(sources) {
  const results = await Promise.all(sources.filter((s) => s.enabled).map((s) => fetchSource(s)));
  return { records: deduplicate(results.flatMap((r) => r.records)), results };
}

module.exports = { fetchSource, fetchAllSources };
