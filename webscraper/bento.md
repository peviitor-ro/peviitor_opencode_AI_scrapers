# 2B INTELLIGENT SOFT (Bento) Scraper Prompt

## Company Info
- **Name**: Bento
- **Legal Name**: 2B INTELLIGENT SOFT S.A.
- **CUI**: 16558004
- **Website**: https://www.bento.ro
- **Careers Page**: https://www.bento.ro/en/careers/

## Jobs URL
```
https://www.bento.ro/en/careers/
```

## Platform
- Uses HRMS platform: `https://bento.normahr.ro/careers-site/`
- Jobs are loaded in an iframe

## Total Jobs
- **3 jobs** (as of Feb 2026)
- All located in Bucharest

## Work Mode Detection
From job details:
- "Full-time hybrid" or "work from anywhere + 1-2 days/week office" → workmode: "hybrid"
- "Full-time" (office only) → workmode: "on-site"
- "Remote" → workmode: "remote"

## Location Detection
- "Bucharest" → location: ["București"]
- "Bucuresti" → location: ["București"]
- Note: All jobs are in Bucharest

## Job URL Format
```
https://bento.normahr.ro/careers-site/branch/{BRANCH_ID}/jobs/{JOB_ID}/{JOB_SLUG}
```

Example: `https://bento.normahr.ro/careers-site/branch/c33e7207-eb18-4ac1-b01c-19276c41e562/jobs/6522e2fd-23d1-4d26-9196-fea12b08a169/android-developer-mdm`

## Scraping Steps

1. **Navigate to Bento careers page**:
   `https://www.bento.ro/en/careers/`

2. **Accept cookies** (if shown):
   Click "Permitere toate" or "Accept All"

3. **Find jobs in iframe**:
   - Jobs are displayed in an iframe pointing to `https://bento.normahr.ro/careers-site/branch/{branch_id}`
   - Look for "X Job Opportunities" heading

4. **Extract job list**:
   Each job shows:
   - Role (title)
   - Experience level (e.g., "5+ years", "1 year")
   - Location (e.g., "Bucharest")
   - "Apply" button

5. **Click on job** to get full details:
   - Click "Apply" button to expand job details in the iframe
   - Or click on job title if available

6. **Extract job data**:
   - title: From heading
   - location: From location field → convert to Romanian (Bucharest → București)
   - workmode: From job type ("Full-time hybrid" → "hybrid")
   - experience: From "Experience: min X years" → use for seniority tag

7. **Push to Solr** after each job or in batches

## Solr Schema
Push to Solr at `http://localhost:8983/solr/job/update` with credentials `solr:SolrRocks`:
```json
{
  "add": {
    "doc": {
      "url": "{JOB_URL}",
      "title": "{TITLE}",
      "company": "2B INTELLIGENT SOFT S.A.",
      "cif": "16558004",
      "location": ["{CITY}"],
      "workmode": "{hybrid|remote|on-site}",
      "date": "{ISO8601_DATE}",
      "status": "scraped",
      "tags": ["{SENIORITY_TAG}", "{FIELD_TAG}"]
    }
  }
}
```

## TAG EXTRACTION (IMPORTANT)

The `tags` field is an array of lowercase strings (NO DIACRITICS). Extract these from the job detail page:

### 1. Seniority Level (experience)
Extract from job TITLE and experience field:

| Keyword in Title / Experience | Description | Tag Value |
|-------------------------------|-------------|------------|
| "Junior" | Entry level position | "junior" |
| "Intern" | Student/Intern | "intern" |
| "Trainee" | Trainee program | "trainee" |
| "Entry" | Entry level | "entry-level" |
| "Graduate" | Graduate program | "graduate" |
| "Senior" | Senior level | "senior" |
| "Lead" | Team lead | "senior" |
| "Manager" | Management | "senior" |
| "Chief" | Chief/Director | "consultant" |
| "Principal" | Principal engineer | "consultant" |
| "Director" | Director level | "consultant" |
| "5+ years" experience | Senior level | "senior" |
| "3-5 years" experience | Mid level | "mid" |
| "1-3 years" experience | Mid level | "mid" |
| "1 year" experience | Junior/Mid | "mid" |
| Default (no prefix) | Mid level | "mid" |

### 2. Faculty/Field Targeting
Extract from job TITLE and tech skills:

| Skill/Category Found | Faculty/Field Tag | Notes |
|---------------------|------------------|-------|
| Android, Mobile, MDM | "it" | IT/Mobile |
| Java, Kotlin, Swift | "it" | Programming |
| Project Manager, PM | "project-management" | PM |
| Sales, Pre-sales | "sales" | Sales |
| DevOps, Cloud | "devops" | DevOps |
| Data, Analytics | "data-science" | Data field |
| AI, ML, Machine Learning | "ai" | AI/ML |
| QA, Testing | "qa" | Quality Assurance |
| Security | "security" | Security |

### Example Tags Extraction

**Job**: "Senior Sales Infrastructure Solutions"
- From title: "Senior" → "senior"
- Skills: "Sales", "Infrastructure" → "sales"
- Tags: `["senior", "sales"]`

**Job**: "Project Manager"
- From experience: "5+ years" → "senior"
- Skills: "Project Management" → "project-management"
- Tags: `["senior", "project-management"]`

**Job**: "Android Developer (MDM)"
- From experience: "1 year" → "mid"
- Skills: "Android", "MDM" → "it"
- Tags: `["mid", "it"]`

### Tags Field Rules (per SCHEMAS.md)
- **lowercase only** - NO UPPERCASE
- **no diacritics** - use "it" not "IT"
- **max 20 entries** - don't exceed
- **array format** - ["tag1", "tag2"]
- **standardized values only** - use consistent naming

## Important Notes
- **Follow Job Model exactly** - See SCHEMAS.md for required fields. DO NOT include "description" field - it doesn't exist in the Job model!
- All jobs are in Bucharest (București)
- Work mode is typically "hybrid" (work from anywhere + 1-2 days/week office)
- Location field may show "Bucuresti" - convert to "București" with diacritics
- Company name must be exactly: "2B INTELLIGENT SOFT S.A."
- Commit to Solr after each job or in batches
- Verify count in Solr matches expected ~3 jobs
