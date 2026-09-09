const $ = (s) => document.querySelector(s);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>\"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let allExams = [];

function examCard(exam) {
  const status = (exam.status || 'upcoming').toUpperCase();
  return `<article class="card"><span class="status">${escapeHtml(status)}</span><h3>${escapeHtml(exam.shortName || exam.examName)}</h3><div class="org">${escapeHtml(exam.organization)}</div><div class="meta"><div><b>Qualification</b><br>${escapeHtml(exam.qualification?.minimumLevel || '—')}</div><div><b>Age</b><br>${exam.age?.minimum ?? '—'}–${exam.age?.maximum ?? '—'}</div><div><b>Deadline</b><br>${escapeHtml(exam.applicationEnd || 'Not published')}</div><div><b>Vacancies</b><br>${exam.vacancies ?? 'Not published'}</div></div><div class="links"><a class="button secondary" href="${escapeHtml(exam.officialNotificationUrl || exam.sourceUrl)}" target="_blank" rel="noopener">Official Notification</a>${exam.officialApplicationUrl ? `<a class="button primary" href="${escapeHtml(exam.officialApplicationUrl)}" target="_blank" rel="noopener">Apply Now</a>` : ''}</div>${exam.verificationStatus !== 'verified' ? '<p class="org">Starter record — verify against the latest official notice.</p>' : ''}</article>`;
}

async function loadExams() {
  const grid = $('#examGrid');
  try {
    const response = await fetch('/api/exams');
    if (!response.ok) throw new Error('API error');
    allExams = await response.json();
    renderExams();
    $('#totalExams').textContent = allExams.length;
    $('#openExams').textContent = allExams.filter((e) => e.status === 'open').length;
    $('#upcomingExams').textContent = allExams.filter((e) => e.status === 'upcoming').length;
  } catch { grid.innerHTML = '<p>We couldn’t load the latest exam information. Please try again.</p>'; }
}
function renderExams() {
  const q = $('#search').value.toLowerCase().trim(); const status = $('#statusFilter').value;
  const exams = allExams.filter((e) => `${e.examName} ${e.shortName} ${e.organization}`.toLowerCase().includes(q) && (!status || e.status === status));
  $('#examGrid').innerHTML = exams.length ? exams.map(examCard).join('') : '<p>No matching exams found.</p>';
}

$('#search').addEventListener('input', renderExams); $('#statusFilter').addEventListener('change', renderExams);
$('#eligibilityForm').addEventListener('submit', async (event) => {
  event.preventDefault(); const form = new FormData(event.currentTarget); const payload = Object.fromEntries(form.entries()); payload.age = Number(payload.age);
  const box = $('#eligibilityResults'); box.innerHTML = '<p>Checking your profile…</p>';
  try {
    const response = await fetch('/api/eligibility', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Request failed');
    $('#eligibleExams').textContent = data.totalEligible;
    box.innerHTML = `<div class="success-box"><strong>${data.totalEligible} exam${data.totalEligible === 1 ? '' : 's'} matched your profile.</strong><p>Always verify age, category, qualification and other conditions in the latest official notification.</p></div><div class="grid" style="margin-top:18px">${data.eligible.length ? data.eligible.map(examCard).join('') : '<p>No eligible exams found in the current dataset.</p>'}</div>`;
  } catch (error) { box.innerHTML = `<p>${escapeHtml(error.message || 'We couldn’t check eligibility. Please try again.')}</p>`; }
});
loadExams();
