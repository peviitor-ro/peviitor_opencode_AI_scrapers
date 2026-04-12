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
https://careers.epam.com/en/jobs/romania
```
This URL filters for Romania jobs. Use this as the base URL for pagination.

## Pagination
- Use the page navigation buttons on the site OR append `&page=N` to the URL
- **ALWAYS check the job count** - look for text "Viewing X-Y out of Z jobs found" in the status element
- Continue scraping until there are no more pages (no "Next" button or reached last page)
- The number of jobs changes over time - NEVER hardcode a specific number

## How to Detect Total Jobs
From the page status element, look for:
- "Viewing 1-10 out of 76 jobs found" → Total: 76 jobs
- "Viewing 11-20 out of 76 jobs found" → Page 2
- Continue until "Viewing 71-76 out of 76 jobs found" → Last page

**Important**: The total job count changes - always read it from the page dynamically!

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
   `https://careers.epam.com/en/jobs/romania`

2. **Check total results**: Look for "Viewing X-Y out of Z jobs found" in the status element

3. **For each page**:
   a. Extract all job links from the page groups
   b. Each job has: title link, work mode text, location text
   c. Parse work mode: "HYBRID IN" / "REMOTE IN" / "OFFICE IN"
   d. Parse location: "ROMANIA: BUCHAREST" or "ROMANIA"
   e. **OPTIONAL - For more detailed data**: Click each job to extract tags

4. **For page navigation**: Click page number button or click "Next" button

5. **Repeat** until no more pages exist (check for "Next" button or last page)

6. **Update Solr company core**: Use atomic upsert to update company with today's date (DO NOT overwrite - use id as unique key):

```bash
# First, query to check if company exists and get all fields
curl -s -u $SOLR_USER:$SOLR_PASSWD "https://solr.peviitor.ro/solr/company/select?q=id:33159615&fl=id,company,brand,group,status,location,website,career,lastScraped,scraperFile"

# If NOT found, add new company with ALL fields:
curl -u $SOLR_USER:$SOLR_PASSWD -X POST "https://solr.peviitor.ro/solr/company/update/json?commit=true" \
  -H "Content-Type: application/json" \
  -d '[{
    "id": "33159615",
    "company": "EPAM SYSTEMS INTERNATIONAL SRL",
    "brand": ["EPAM"],
    "group": ["EPAM Systems"],
    "status": "activ",
    "website": ["https://www.epam.com"],
    "career": ["https://www.epam.com/careers/locations/romania"],
    "lastScraped": "2026-03-05",
    "scraperFile": "epam.md"
  }]'

# If found, check if fields are missing/empty:
# - If brand[], group[], website[], career[] are missing or empty → search internet and update ALL fields
# - If all fields are complete → only update lastScraped and scraperFile

# Update with ALL fields (if missing data found):
curl -u $SOLR_USER:$SOLR_PASSWD -X POST "https://solr.peviitor.ro/solr/company/update/json?commit=true" \
  -H "Content-Type: application/json" \
  -d '[{
    "id": "33159615",
    "company": "EPAM SYSTEMS INTERNATIONAL SRL",
    "brand": ["EPAM"],
    "group": ["EPAM Systems"],
    "status": "activ",
    "website": ["https://www.epam.com"],
    "career": ["https://www.epam.com/careers/locations/romania"],
    "lastScraped": "2026-03-05",
    "scraperFile": "epam.md"
  }]'

# OR just update lastScraped (if all fields are complete):
curl -u $SOLR_USER:$SOLR_PASSWD -X POST "https://solr.peviitor.ro/solr/company/update/json?commit=true" \
  -H "Content-Type: application/json" \
  -d '[{
    "id": "33159615",
    "lastScraped": "2026-03-05",
    "scraperFile": "epam.md"
  }]'
```

**IMPORTANT**: Always use the company's CUI as the `id` field. When updating, only include the fields that need to change - Solr will merge with existing data (atomic update).

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
curl -u $SOLR_USER:$SOLR_PASSWD -X POST -H "Content-Type: application/json" \
  "https://solr.peviitor.ro/solr/job/update?commit=true" \
  -d '[{"url":"{JOB_URL}","title":"{TITLE}","company":"EPAM SYSTEMS INTERNATIONAL SRL","cif":"33159615","location":["{LOCATION}"],"workmode":"{workmode}","tags":["{tag1}","{tag2}"],"date":"{ISO8601_DATE}","status":"scraped"}]'
```

Example with tags:
```bash
curl -u $SOLR_USER:$SOLR_PASSWD -X POST -H "Content-Type: application/json" \
  "https://solr.peviitor.ro/solr/job/update?commit=true" \
  -d '[{"url":"https://careers.epam.com/en/vacancy/senior-full-stack-abap-ui5-developer-blt0362ababb3b04a7c_en","title":"Senior Full Stack ABAP/UI5 Developer","company":"EPAM SYSTEMS INTERNATIONAL SRL","cif":"33159615","location":["Romania"],"workmode":"hybrid","tags":["senior","sap","it"],"date":"2026-02-17T10:00:00Z","status":"scraped"}]'
```

## Important Notes

- All jobs on the Romania-filtered page are Romania jobs - no need to filter further
- Work mode text appears as: "HYBRID IN", "REMOTE IN", "OFFICE IN" (all caps with IN suffix)
- Location text appears as: "ROMANIA" or "ROMANIA: BUCHAREST"
- Some jobs show "relocation" tags (Cyprus, Malta) but location is still Romania - include them
- EPAM uses their own careers platform (not SmartRecruiters)
- **Push ALL jobs found** to Solr (dynamic count based on pagination)
- workmode values must be exactly: "remote", "on-site", or "hybrid"
- tags must be lowercase, no diacritics, max 20 entries
- Commit to Solr after each batch (10 jobs) or at the end
- Verify with: `curl -s -u $SOLR_USER:$SOLR_PASSWD "https://solr.peviitor.ro/solr/job/select?q=company:%22EPAM%20SYSTEMS%20INTERNATIONAL%20SRL%22&rows=1"`

## Company Update Logic

When updating the company in Solr:
1. Query: `curl -s -u $SOLR_USER:$SOLR_PASSWD "https://solr.peviitor.ro/solr/company/select?q=id:33159615&fl=id,company,brand,group,status,location,website,career,lastScraped,scraperFile"`
2. Check if ANY of these fields are missing or empty: brand[], group[], website[], career[], location[]
3. If ANY field is missing → search internet for missing data and update ALL fields:
   - Use DemoANAF API to get company details: curl "https://demoanaf.ro/api/company/{CUI}"
   - Use WebSearch to find official website(s) - prioritize .ro domains
   - Use WebSearch to find careers page(s) - prioritize .ro domains
   - Use WebSearch to find parent company group
4. If ALL fields are complete → only update lastScraped and scraperFile
