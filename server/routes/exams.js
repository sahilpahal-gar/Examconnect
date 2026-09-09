const express = require('express');
const router = express.Router();

function statusOf(exam) {
  if (exam.status) return exam.status;
  if (!exam.applicationEnd) return 'upcoming';
  return new Date(exam.applicationEnd) >= new Date() ? 'open' : 'closed';
}

module.exports = (getExams) => {
  router.get('/', (req, res) => {
    let exams = getExams().map((e) => ({ ...e, status: statusOf(e) }));
    const q = String(req.query.q || '').toLowerCase().trim();
    if (q) exams = exams.filter((e) => `${e.examName} ${e.shortName} ${e.organization}`.toLowerCase().includes(q));
    if (req.query.status) exams = exams.filter((e) => e.status === req.query.status);
    res.json(exams);
  });

  router.get('/:id', (req, res) => {
    const exam = getExams().find((e) => e.id === req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    return res.json({ ...exam, status: statusOf(exam) });
  });
  return router;
};
