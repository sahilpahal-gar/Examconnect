# ExamConnect

> Find the government exams you are eligible for.

ExamConnect is a college minor-project portal that combines a profile-based eligibility engine with an automated notification-ingestion architecture. The frontend is deliberately framework-free; the backend is Node.js + Express, and the starter dataset is JSON so the project works immediately.

## Features

- Responsive dashboard for desktop, tablet and mobile.
- Profile-based matching for qualification, age, category, gender, domicile, degree, stream and technical qualifications.
- Search and status filtering without page reloads.
- Official notification/application links.
- Normalized exam schema ready for a future MongoDB repository layer.
- Adapter-based parsers for different government sites.
- Resilient fetcher with timeouts and graceful source failures.
- Confidence-aware ingestion that marks extracted records `needs-review` rather than inventing uncertain data.
- Daily GitHub Actions update workflow.
- Automated eligibility-engine tests.

## Architecture

```text
Official Government Website
          ↓
Notification Fetcher
          ↓
Parser / Source Adapter
          ↓
Normalizer + Validation
          ↓
Deduplication
          ↓
exams.json (future MongoDB)
          ↓
REST API
          ↓
Eligibility Engine
          ↓
Responsive Frontend
```

The project does **not** make manual data entry the primary update mechanism. A human review layer is still appropriate because government websites change structure and extraction can be uncertain.

## Project structure

```text
Examconnect/
├── client/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── server/
│   ├── index.js
│   ├── routes/
│   │   ├── exams.js
│   │   └── eligibility.js
│   ├── services/
│   │   ├── eligibilityEngine.js
│   │   ├── notificationFetcher.js
│   │   ├── parser.js
│   │   └── normalizer.js
│   ├── data/exams.json
│   └── config/sources.json
├── scripts/update-exams.js
├── tests/eligibility.test.js
├── .github/workflows/update-exams.yml
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Installation

```bash
git clone https://github.com/sahilpahal-gar/Examconnect.git
cd Examconnect
npm install
npm start
```

Open `http://localhost:3000`.

## Development

```bash
npm run dev
```

## Testing

```bash
npm test
```

Tests cover graduate/12th qualification, age bounds, category, gender, degree and stream restrictions.

## Automatic updates

The `update-exams.yml` workflow runs daily and can also be triggered manually. It installs dependencies, runs `npm run update-exams`, checks whether `server/data/exams.json` changed, and commits changes using the GitHub Actions bot. No secrets are stored in the repository.

Run the updater locally with:

```bash
npm run update-exams
```

Each configured source is fetched independently. A timeout, HTTP error, invalid page or parser problem is reported without crashing the complete update job. The generic and source-specific parsers only extract candidate notification records; uncertain records are flagged for review.

## REST API

- `GET /api/health`
- `GET /api/exams`
- `GET /api/exams?q=ssc`
- `GET /api/exams?status=open`
- `GET /api/exams/:id`
- `POST /api/eligibility`

Example eligibility payload:

```json
{
  "age": 21,
  "qualification": "graduate",
  "degree": "B.Voc Software Development",
  "stream": "computer science",
  "category": "EWS",
  "gender": "female",
  "domicile": "Haryana"
}
```

## Data accuracy

Starter records intentionally use `null` for live dates/vacancies that have not been verified by the ingestion pipeline. They are labeled `starter-data` and the UI warns users to verify the latest official notice. The application must never be treated as a replacement for an official notification.

## Official sources

The initial source registry contains official sites for SSC, UPSC, IBPS, SBI Careers, Indian Railways, NTA and HSSC. Source URLs are maintained in `server/config/sources.json`. Third-party exam aggregators are not used as authoritative sources.

## Future improvements

- MongoDB repository adapter without changing eligibility logic.
- Authentication and saved exams.
- Email/push reminders for deadlines.
- More robust source-specific parsers and PDF extraction.
- AI-assisted extraction with mandatory confidence/review controls.
- Admin verification dashboard.
- Personalized ranking/recommendations.
- Notification history and change detection.
