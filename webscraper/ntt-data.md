# NTT DATA Scraper Prompt

## Company Info
- **Name**: NTT DATA
- **Legal Name**: NTT DATA ROMANIA SA
- **CUI**: 13091574
- **Website**: https://ro.nttdata.com/
- **Careers Page**: https://careers.nttdata.ro/

## Romania Jobs URL
```
https://careers.nttdata.ro/nttdataromania/search!
```
This URL shows all NTT DATA Romania jobs. Use this as the base URL for pagination.

## Pagination
- Base URL: `https://careers.nttdata.ro/nttdataromania/search!?q=&sortColumn=referencedate&sortDirection=desc`
- Page 2: `https://careers.nttdata.ro/nttdataromania/search!?q=&sortColumn=referencedate&sortDirection=desc&startrow=25`
- Page 3: `https://careers.nttdata.ro/nttdataromania/search!?q=&sortColumn=referencedate&sortDirection=desc&startrow=50`
- Page 4: `https://careers.nttdata.ro/nttdataromania/search!?q=&sortColumn=referencedate&sortDirection=desc&startrow=75`
- Total: 4 pages with 87 jobs (25+25+25+12)

## Total Jobs
- **87 Romania jobs** (as of Feb 2026)
- 4 pages

## Work Mode Detection
From the job detail page:
- "Remote, Hybrid or Office" - check for "Remote" option in locations list
- Most jobs offer "Pick your working style: choose from Remote, Hybrid or Office work opportunities"
- If job has "Remote" in location list → workmode: "hybrid" (most common)
- Some jobs explicitly "Remote, RO" in location → workmode: "remote"

## Location Detection
From the job listing text:
- "Cluj, RO" → location: ["Cluj"]
- "Brasov, RO" → location: ["Brasov"]
- "Bucuresti, RO" → location: ["Bucuresti"]
- "Sibiu, RO" → location: ["Sibiu"]
- "Remote, RO" → location: ["Remote"]
- Jobs can have multiple locations (e.g., "Cluj, Sibiu, Remote, Bucuresti, Brasov, Iasi, Timisoara")

## Job URL Format
```
https://careers.nttdata.ro/nttdataromania/job/{LOCATION}-{JOB_TITLE}/{JOB_ID}/
```

Example: `https://careers.nttdata.ro/nttdataromania/job/Cluj-NodeJS-Developer/1263983901/`

## Scraping Steps

1. **Navigate to NTT DATA careers**:
   `https://careers.nttdata.ro/nttdataromania/search!`

2. **Check total results**: Look for "Results X - Y of Z" text

3. **For each page (1-4)**:
   a. Extract all job links from the page
   b. Each job has: title link, location text, date
   c. Parse location from the text after title (e.g., "Cluj, RO")
   d. Click each job to get detailed locations and work mode

4. **For job detail extraction**:
   - Navigate to each job URL
   - Extract all locations from the location section
   - Check for work mode (most are hybrid with remote option)
   - Extract skills/tags from job description

5. **Repeat** until all 4 pages are exhausted

6. **Update websites.md**: Set "Last Scraped" to today's date (format: YYYY-MM-DD)

## Job Data Fields

| Field | Source | Example |
|-------|--------|---------|
| url | Job link href | `https://careers.nttdata.ro/nttdataromania/job/Cluj-NodeJS-Developer/1263983901/` |
| title | Job title text | "NodeJS Developer" |
| company | Fixed value | "NTT DATA ROMANIA SA" |
| cif | Fixed value | "13091574" |
| location | Parse from text | ["Cluj", "Brasov", "Remote"] |
| workmode | Parse from job detail | "hybrid", "remote" |
| date | Current date | "2026-02-17T00:00:00Z" |
| status | Fixed value | "scraped" |
| tags | Extract from job description | See below |

## TAG EXTRACTION (IMPORTANT)

The `tags` field is an array of lowercase strings (NO DIACRITICS). Extract these from the job detail page:

### 1. Seniority Level (experience)
Extract from job TITLE:

| Keyword in Title | Tag Value |
|-----------------|------------|
| "Junior" | "junior" |
| "Intern" | "student" |
| "Senior" | "senior" |
| "Lead" | "senior" |
| "Manager" | "senior" |
| Default (no prefix) | "mid" |

### 2. Technology/Skill Tags
Extract from job TITLE and DESCRIPTION:

| Technology Found | Tag Value |
|-----------------|----------|
| SAP, ABAP, HANA | "sap" |
| Java, .NET, Python, Node.js, Go | "programming" |
| JavaScript, React, Angular, Frontend | "frontend" |
| AWS, Azure, GCP, Cloud | "cloud" |
| DevOps, Docker, Kubernetes | "devops" |
| DevSecOps | "devsecops" |
| AI, Machine Learning | "ai" |
| Data, BI, Analytics | "data" |
| Security, Cybersecurity | "security" |
| Testing, QA, Automation | "qa" |
| Project Manager | "project-management" |
| Product Owner | "product-owner" |
| Consultant | "consultant" |

### Example Tags Extraction

**Job**: "NodeJS Developer"
- From title: "Developer" → default mid-level
- Skills: Node.js, GCP, Docker, Kubernetes → ["nodejs", "gcp", "docker", "kubernetes"]
- Work mode: "Hybrid" (multiple locations including Remote)

**Final tags**: `["nodejs", "javascript", "microservices", "gcp", "docker", "kubernetes"]`

**Job**: "Senior DevOps Engineer"
- From title: "Senior" → "senior"
- Tags: ["devops", "senior", "engineer"]

**Job**: "SAP Data Migration Lead/Architect"
- From title: "Architect" → no specific seniority prefix
- Skills: SAP → ["sap", "data-migration"]

### Tags Field Rules (per SCHEMAS.md)
- **lowercase only** - NO UPPERCASE
- **no diacritics** - use "programming" not "PROGRAMMING"
- **max 20 entries** - don't exceed
- **array format** - ["tag1", "tag2"]
- **standardized values only** - use consistent naming

## Solr Format

Push to Solr using curl:
```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  "http://localhost:8983/solr/job/update?commit=true" \
  -d '[{"url":"{JOB_URL}","title":"{TITLE}","company":"NTT DATA ROMANIA SA","cif":"13091574","location":["{LOCATION}"],"workmode":"{workmode}","tags":["{tag1}","{tag2}"],"date":"{ISO8601_DATE}","status":"scraped"}]'
```

Example:
```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  "http://localhost:8983/solr/job/update?commit=true" \
  -d '[{"url":"https://careers.nttdata.ro/nttdataromania/job/Cluj-NodeJS-Developer/1263983901/","title":"NodeJS Developer","company":"NTT DATA ROMANIA SA","cif":"13091574","location":["Cluj","Sibiu","Bucuresti","Brasov","Iasi","Timisoara"],"workmode":"hybrid","tags":["nodejs","javascript","microservices","gcp","docker","kubernetes","graphql"],"date":"2026-02-17T00:00:00Z","status":"scraped"}]'
```

## Important Notes

- All jobs are Romania-based - NTT DATA Romania only operates in Romania
- Work mode: Most jobs are "hybrid" with option for Remote/Office
- Locations: Cluj, Brasov, Bucuresti, Sibiu, Iasi, Timisoara, Craiova, Remote
- Job detail pages show ALL available locations for that position
- NTT DATA uses their own career platform (not SmartRecruiters)
- Push all 87 jobs to Solr
- workmode values must be exactly: "remote", "on-site", or "hybrid"
- tags must be lowercase, no diacritics, max 20 entries
- Commit to Solr after each batch (25 jobs) or at the end
- Verify with: `curl -s -u solr:SolrRocks "http://localhost:8983/solr/job/select?q=company:%22NTT%20DATA%20ROMANIA%20SA%22&rows=1"`

## Current Job Distribution (Feb 2026)

- **By Location**:
  - Cluj: ~45 jobs (most locations)
  - Brasov: ~25 jobs
  - Bucuresti: ~5 jobs
  - Sibiu: ~5 jobs
  - Remote: ~1 job

- **By Specialization**:
  - SAP: 15+ jobs (ABAP, HANA, Cloud, BW, EWM, etc.)
  - DevOps/Cloud: 10+ jobs
  - Java: 5+ jobs
  - Cybersecurity: 5+ jobs
  - QA/Testing: 3+ jobs
  - Project/Product Management: 3+ jobs

- **Work Mode**:
  - Hybrid: ~86 jobs
  - Remote: ~1 job

- **Note**: Most jobs offer multiple location choices (hybrid work)
