const cheerio = require('cheerio');

function textDate(text) {
  const match = text.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}\b/);
  return match ? match[0] : null;
}

class GenericParser {
  parse(html, source) {
    const $ = cheerio.load(html);
    const records = [];
    $('a').each((_, el) => {
      const title = $(el).text().replace(/\s+/g, ' ').trim();
      const href = $(el).attr('href');
      if (!title || title.length < 12 || !href) return;
      const context = $(el).parent().text().replace(/\s+/g, ' ').trim();
      if (!/(exam|recruit|vacanc|notification|advertisement|apply)/i.test(`${title} ${context}`)) return;
      records.push({ title, officialNotificationUrl: new URL(href, source.url).href, notificationDate: textDate(context), confidence: 0.45 });
    });
    return records.slice(0, 100);
  }
}

class SSCParser extends GenericParser {
  parse(html, source) { return super.parse(html, source).map((r) => ({ ...r, confidence: Math.max(r.confidence, 0.55) })); }
}
class UPSCParser extends GenericParser {
  parse(html, source) { return super.parse(html, source).map((r) => ({ ...r, confidence: Math.max(r.confidence, 0.55) })); }
}
class IBPSParser extends GenericParser {
  parse(html, source) { return super.parse(html, source).map((r) => ({ ...r, confidence: Math.max(r.confidence, 0.55) })); }
}
class RailwayParser extends GenericParser {}

function parserFor(organization) {
  const name = String(organization).toLowerCase();
  if (name.includes('ssc')) return new SSCParser();
  if (name.includes('upsc')) return new UPSCParser();
  if (name.includes('ibps')) return new IBPSParser();
  if (name.includes('rail')) return new RailwayParser();
  return new GenericParser();
}

module.exports = { GenericParser, SSCParser, UPSCParser, IBPSParser, RailwayParser, parserFor };
