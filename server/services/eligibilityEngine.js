const LEVELS = { '10th': 1, '12th': 2, diploma: 3, graduate: 4, postgraduate: 5 };

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function evaluateEligibility(profile, exam) {
  const reasons = [];
  const warnings = [];
  const userLevel = LEVELS[normalize(profile.qualification)];
  const requiredLevel = LEVELS[normalize(exam.qualification?.minimumLevel)];

  if (!userLevel || !requiredLevel) {
    return { eligible: false, reasons: ['Qualification information is incomplete or unsupported.'], warnings };
  }
  if (userLevel < requiredLevel) {
    reasons.push(`Minimum qualification required: ${exam.qualification.minimumLevel}`);
  } else {
    reasons.push('Your qualification meets the minimum requirement.');
  }

  const age = Number(profile.age);
  if (!Number.isFinite(age)) reasons.push('A valid age is required.');
  else if (exam.age?.minimum != null && age < exam.age.minimum) reasons.push(`Minimum age required: ${exam.age.minimum}`);
  else if (exam.age?.maximum != null && age > exam.age.maximum) reasons.push(`Maximum age allowed: ${exam.age.maximum}`);
  else reasons.push('Your age falls within the required range.');

  const category = normalize(profile.category);
  if (Array.isArray(exam.category) && exam.category.length && !exam.category.map(normalize).includes(category)) reasons.push('Your category is not listed for this examination.');

  const gender = normalize(profile.gender);
  if (Array.isArray(exam.gender) && exam.gender.length && !exam.gender.map(normalize).includes(gender)) reasons.push('Your gender is not listed for this examination.');

  const domicile = normalize(profile.domicile);
  if (Array.isArray(exam.domicile) && exam.domicile.length && domicile && !exam.domicile.map(normalize).includes(domicile)) reasons.push('Your domicile does not match the stated domicile requirement.');

  const degrees = (exam.qualification?.degrees || []).map(normalize).filter(Boolean);
  if (degrees.length && !degrees.some((d) => normalize(profile.degree).includes(d))) reasons.push(`Required degree: ${exam.qualification.degrees.join(', ')}`);

  const streams = (exam.qualification?.streams || []).map(normalize).filter(Boolean);
  if (streams.length && !streams.includes('any') && !streams.includes(normalize(profile.stream))) reasons.push(`Required stream: ${exam.qualification.streams.join(', ')}`);

  const technical = (exam.qualification?.technicalQualifications || []).map(normalize).filter(Boolean);
  if (technical.length && !technical.some((t) => normalize(profile.technicalQualification).includes(t))) reasons.push(`Required technical qualification: ${exam.qualification.technicalQualifications.join(', ')}`);

  if (exam.verificationStatus !== 'verified') warnings.push('This starter record should be verified against the latest official notification.');

  const failed = reasons.some((reason) => /required:|allowed:|not listed|does not match|incomplete|unsupported/i.test(reason));
  return { eligible: !failed, reasons: failed ? reasons : reasons.slice(0, 2), warnings };
}

function getEligibleExams(profile, exams) {
  return exams.map((exam) => ({ exam, result: evaluateEligibility(profile, exam) })).filter(({ result }) => result.eligible);
}

module.exports = { LEVELS, evaluateEligibility, getEligibleExams };
