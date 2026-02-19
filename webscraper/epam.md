# EPAM Scraper Prompt

## IMPORTANT - SCRAPE ALL JOBS
**This instruction applies to ALL companies**: When scraping jobs, you MUST extract and push ALL available jobs to Solr - not just a sample. The total number of jobs is shown on the page. Do not stop until you have scraped all jobs.

## Company Info
- **Name**: EPAM
- **Legal Name**: EPAM SYSTEMS INTERNATIONAL SRL
- **CUI**: 33159615
- **Website**: https://www.epam.com
- **Careers Page**: https://careers.epam.com

## Romania Jobs URL
```
https://careers.epam.com/en/jobs?country=8150000000000001155
```
This URL already filters for Romania. Use this as the base URL for pagination.

## Pagination
- Base URL: `https://careers.epam.com/en/jobs?country=8150000000000001155`
- Add `&page=N` for subsequent pages (e.g., `&page=2`, `&page=3`)
- Total: 9 pages with 88 jobs
- Last page shows "Viewing 81-88 out of 88 jobs found"

## Total Jobs
- **88 Romania jobs** (as of Feb 2026)
- 9 pages, 10 jobs per page (last page has 8 jobs)

## Work Mode Detection
From the job listing text:
- "HYBRID IN" → workmode: "hybrid"
- "REMOTE IN" → workmode: "remote"
- "OFFICE IN" → workmode: "on-site"

## Location Detection
From the job listing text:
- "ROMANIA: BUCHAREST" → location: ["Bucharest"]
- "ROMANIA" (without city) → location: ["Romania"]

Note: Some jobs have relocation options (Cyprus, Malta) but the primary location is still Romania - include these jobs.

## Job URL Format
```
https://careers.epam.com/en/vacancy/{JOB_SLUG}
```

Example: `https://careers.epam.com/en/vacancy/senior-full-stack-abap-ui5-developer-blt0362ababb3b04a7c_en`

## Scraping Steps

1. **Navigate to EPAM careers with Romania filter**:
   `https://careers.epam.com/en/jobs?country=8150000000000001155`

2. **Check total results**: Look for "Viewing X-Y out of Z jobs found" in the status element

3. **For each page (1-9)**:
   a. Extract all job links from the page groups
   b. Each job has: title link, work mode text, location text
   c. Parse work mode: "HYBRID IN" / "REMOTE IN" / "OFFICE IN"
   d. Parse location: "ROMANIA: BUCHAREST" or "ROMANIA"
   e. **OPTIONAL - For more detailed data**: Click each job to extract tags

4. **For page navigation**: Click page number button or add `&page=N` to URL

5. **Repeat** until all 9 pages are exhausted

6. **Update websites.md**: Set "Last Scraped" to today's date (format: YYYY-MM-DD)

## Job Data Fields

| Field | Source | Example |
|-------|--------|---------|
| url | Job link href | `https://careers.epam.com/en/vacancy/senior-full-stack-abap-ui5-developer-blt0362ababb3b04a7c_en` |
| title | Job link text | "Senior Full Stack ABAP/UI5 Developer" |
| company | Fixed value | "EPAM SYSTEMS INTERNATIONAL SRL" |
| cif | Fixed value | "33159615" |
| location | Parse from text | ["Romania"] or ["Bucharest"] |
| workmode | Parse from text | "hybrid", "on-site", "remote" |
| date | Current date | "2026-02-17T10:00:00Z" |
| status | Fixed value | "scraped" |
| tags | Extract from job detail | See below |

## TAG EXTRACTION (IMPORTANT)

The `tags` field is an array of lowercase strings (NO DIACRITICS). Extract these from the job detail page:

### 1. Seniority Level (experience)
Extract from job TITLE and job DESCRIPTION:

| Keyword in Title | Description | Tag Value |
|-----------------|-------------|------------|
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
| Default (no prefix) | Mid level | "mid" |

**Note**: Current EPAM Romania jobs are mostly Senior/Lead/Manager - few entry-level positions.

### 2. Student/Graduate Detection
Look for keywords in TITLE or DESCRIPTION:
- "intern" → add "student" to tags
- "graduate" → add "graduate" to tags  
- "student" → add "student" to tags
- "no experience" → add "entry-level" to tags
- "fresh graduate" → add "graduate" to tags
- "entry level" → add "entry-level" to tags
- "student program" → add "student" to tags

### 3. Faculty/Field Targeting
Extract from job SKILLS and JOB CATEGORY text:

| Skill/Category Found | Faculty/Field Tag | Notes |
|---------------------|------------------|-------|
| SAP, ABAP, UI5, Fiori, MM, SD, FICO, PP, MDG, HANA | "sap" | SAP ecosystem |
| Java, Kotlin, Python, .NET, Go, Node.js | "it" | Programming |
| JavaScript, React, Angular, Frontend, UI | "it" | IT/Frontend |
| Data, Analytics, Big Data, ETL | "data-science" | Data field |
| Machine Learning, ML, AI, MLOps | "ai" | AI/ML |
| DevOps, CI/CD, Kubernetes, Docker | "devops" | DevOps |
| Cloud, Azure, AWS, GCP | "cloud" | Cloud computing |
| Business Analysis, BA | "business" | Business |
| Finance, Treasury, Banking | "finance" | Finance |
| Project Management, PM | "project-management" | PM |
| QA, Testing, Automation | "qa" | Quality Assurance |
| Security, Compliance | "security" | Security |
| Sales, Pre-sales, Consulting | "sales" | Sales |

### Example Tags Extraction

**Job**: "Senior Full Stack ABAP/UI5 Developer"
- From title: "Senior" → "senior"
- Skills shown: "SAP SAPUI5" → "sap", "it"
- Work mode: "HYBRID IN" → "hybrid"
- Location: "ROMANIA" → ["Romania"]

**Final tags**: `["senior", "sap", "it", "hybrid"]`

**Job**: "Data Science Consultant"
- From title: "Consultant" → "consultant"
- Skills: "Data Science" → "data-science", "ai"
- Tags: `["consultant", "data-science", "ai"]`

### Tags Field Rules (per SCHEMAS.md)
- **lowercase only** - NO UPPERCASE
- **no diacritics** - use "it" not "IT"
- **max 20 entries** - don't exceed
- **array format** - ["tag1", "tag2"]
- **standardized values only** - use consistent naming

## Solr Format

Push to Solr using curl:
```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  "http://localhost:8983/solr/job/update?commit=true" \
  -d '[{"url":"{JOB_URL}","title":"{TITLE}","company":"EPAM SYSTEMS INTERNATIONAL SRL","cif":"33159615","location":["{LOCATION}"],"workmode":"{workmode}","tags":["{tag1}","{tag2}"],"date":"{ISO8601_DATE}","status":"scraped"}]'
```

Example with tags:
```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  "http://localhost:8983/solr/job/update?commit=true" \
  -d '[{"url":"https://careers.epam.com/en/vacancy/senior-full-stack-abap-ui5-developer-blt0362ababb3b04a7c_en","title":"Senior Full Stack ABAP/UI5 Developer","company":"EPAM SYSTEMS INTERNATIONAL SRL","cif":"33159615","location":["Romania"],"workmode":"hybrid","tags":["senior","sap","it"],"date":"2026-02-17T10:00:00Z","status":"scraped"}]'
```

## Important Notes

- All jobs on the Romania-filtered page are Romania jobs - no need to filter further
- Work mode text appears as: "HYBRID IN", "REMOTE IN", "OFFICE IN" (all caps with IN suffix)
- Location text appears as: "ROMANIA" or "ROMANIA: BUCHAREST"
- Some jobs show "relocation" tags (Cyprus, Malta) but location is still Romania - include them
- EPAM uses their own careers platform (not SmartRecruiters)
- Push all 88 jobs to Solr (9 pages)
- workmode values must be exactly: "remote", "on-site", or "hybrid"
- tags must be lowercase, no diacritics, max 20 entries
- Commit to Solr after each batch (10 jobs) or at the end
- Verify with: `curl -s -u solr:SolrRocks "http://localhost:8983/solr/job/select?q=company:%22EPAM%20SYSTEMS%20INTERNATIONAL%20SRL%22&rows=1"`

## Current Job Distribution (Feb 2026)

- **By Seniority** (from filter counts):
  - Senior: 48 jobs
  - Lead: 14 jobs
  - Middle: 7 jobs
  - Senior Management: 7 jobs
  - Middle Management: 6 jobs

- **By Specialization**:
  - Developer: 39 jobs
  - Other: 32 jobs
  - Software Architect: 5 jobs
  - DevOps: 5 jobs
  - Delivery Manager: 2 jobs

- **Top Skills**:
  - SAP FICO: 10 jobs
  - SAP Logistics (SCM): 8 jobs
  - Microsoft Azure: 8 jobs
  - Java: 6 jobs
  - CI/CD: 6 jobs

- **Note**: No "Junior" or "Intern" positions visible in current Romania listings - all are Senior/Lead level
