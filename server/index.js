const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const exams = require('./data/exams.json');
const examsRouter = require('./routes/exams');
const eligibilityRouter = require('./routes/eligibility');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, '..', 'client')));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'ExamConnect API' }));
app.use('/api/exams', examsRouter(() => exams));
app.use('/api/eligibility', eligibilityRouter(() => exams));

app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'index.html')));

if (require.main === module) app.listen(PORT, () => console.log(`ExamConnect running at http://localhost:${PORT}`));
module.exports = app;
