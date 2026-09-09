const express = require('express');
const { evaluateEligibility } = require('../services/eligibilityEngine');
const router = express.Router();

module.exports = (getExams) => {
  router.post('/', (req, res) => {
    const profile = req.body || {};
    if (!profile.qualification || profile.age == null) return res.status(400).json({ error: 'Age and qualification are required.' });
    const evaluated = getExams().map((exam) => ({ exam, result: evaluateEligibility(profile, exam) }));
    const eligible = evaluated.filter((x) => x.result.eligible);
    const notEligible = evaluated.filter((x) => !x.result.eligible);
    res.json({
      eligible: eligible.map(({ exam, result }) => ({ ...exam, eligibility: result })),
      notEligible: notEligible.map(({ exam, result }) => ({ id: exam.id, examName: exam.examName, reasons: result.reasons })),
      totalEligible: eligible.length
    });
  });
  return router;
};
