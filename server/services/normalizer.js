const crypto = require('node:crypto');

function clean(value) {
  if (value == null || value === '') return null;
  return String(value).trim();
}

function normalizeNotification(raw, source) {
  const title = clean(raw.title);
  if (!title) return null;
  const id = raw.id || crypto.createHash('sha1').update(`${source.organization}:${title}`).digest('hex').slice(0, 12);
  const confidence = Number(raw.confidence ?? 0);
  return {
    id,
    organization: source.organization,
    examName: title,
    shortName: clean(raw.shortName) || title,
    qualification: raw.qualification || { minimumLevel: '12th', degrees: [], streams: [] },
    age: raw.age || { minimum: null, maximum: null },
    category: raw.category || ['UR', 'OBC', 'SC', 'ST', 'EWS'],
    gender: raw.gender || ['male', 'female', 'other'],
    domicile: raw.domicile || [],
    status: raw.status || 'upcoming',
    notificationDate: clean(raw.notificationDate),
    applicationStart: clean(raw.applicationStart),
    applicationEnd: clean(raw.applicationEnd),
    examDate: clean(raw.examDate),
    vacancies: raw.vacancies ?? null,
    officialNotificationUrl: clean(raw.officialNotificationUrl) || source.url,
    officialApplicationUrl: clean(raw.officialApplicationUrl),
    sourceUrl: source.url,
    lastUpdated: new Date().toISOString().slice(0, 10),
    sourceType: 'official',
    verificationStatus: confidence >= 0.85 ? 'needs-review' : 'needs-review'
  };
}

function deduplicate(exams) {
  const map = new Map();
  for (const exam of exams) map.set(exam.id, exam);
  return [...map.values()];
}

module.exports = { normalizeNotification, deduplicate };
