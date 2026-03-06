# COERA Scraper Prompt

## Company Info
- **Name**: COERA
- **Legal Name**: COERA BC SRL
- **CUI**: 32519996
- **Website**: https://www.co-era.com
- **Careers Page**: https://www.co-era.com/careers

## Romania Jobs URL
```
https://www.co-era.com/careers/
```
Main careers page with link to SmartRecruiters for actual job listings.

## SmartRecruiters Integration
COERA uses SmartRecruiters for job listings:
```
https://jobs.smartrecruiters.com/COERA
```

## Total Jobs
- **1 Romania job** (as of Feb 2026)
- Location: Cluj-Napoca
- Type: Contract

## Work Mode Detection
From job listing:
- "Contract" type → workmode: "on-site" (no remote option mentioned)
- Location is Cluj-Napoca, Romania

## Location Detection
- "Cluj-Napoca, Romania" → location: ["Cluj-Napoca"]

## Job URL Format
```
https://jobs.smartrecruiters.com/COERA/{JOB_ID}-{JOB_SLUG}
```

Example: `https://jobs.smartrecruiters.com/COERA/743999680007137-go-beyond-for-your-role-`

## Scraping Steps

1. **Navigate to COERA careers page**:
   `https://www.co-era.com/careers/`

2. **Click "Go beyond" link** to open SmartRecruiters:
   `https://jobs.smartrecruiters.com/COERA`

3. **Extract all job links** from SmartRecruiters listing

4. **Filter for Romania jobs only**:
   - Look for "Romania" in location
   - Exclude jobs in other countries

5. **For each Romania job**:
   - Extract title, location, work mode
   - Get job details for skills/tags

6. **Push to Solr** - see format below

7. **Update Solr company core**: Use atomic upsert to update company with today's date (DO NOT overwrite - use id as unique key):

```bash
# First, query to check if company exists and get all fields
curl -s -u $SOLR_USER:$SOLR_PASSWD "https://solr.peviitor.ro/solr/company/select?q=id:32519996&fl=id,company,brand,group,status,location,website,career,lastScraped,scraperFile"

# If NOT found, add new company with ALL fields:
curl -u $SOLR_USER:$SOLR_PASSWD -X POST "https://solr.peviitor.ro/solr/company/update/json?commit=true" \
  -H "Content-Type: application/json" \
  -d '[{
    "id": "32519996",
    "company": "COERA BC SRL",
    "brand": ["COERA"],
    "group": ["-"],
    "status": "activ",
    "website": ["https://www.co-era.com"],
    "career": ["https://www.co-era.com/careers"],
    "lastScraped": "2026-03-05",
    "scraperFile": "coera.md"
  }]'

# If found, check if fields are missing/empty:
# - If brand[], group[], website[], career[] are missing or empty → search internet and update ALL fields
# - If all fields are complete → only update lastScraped and scraperFile

# Update with ALL fields (if missing data found):
curl -u $SOLR_USER:$SOLR_PASSWD -X POST "https://solr.peviitor.ro/solr/company/update/json?commit=true" \
  -H "Content-Type: application/json" \
  -d '[{
    "id": "32519996",
    "company": "COERA BC SRL",
    "brand": ["COERA"],
    "group": ["-"],
    "status": "activ",
    "website": ["https://www.co-era.com"],
    "career": ["https://www.co-era.com/careers"],
    "lastScraped": "2026-03-05",
    "scraperFile": "coera.md"
  }]'

# OR just update lastScraped (if all fields are complete):
curl -u $SOLR_USER:$SOLR_PASSWD -X POST "https://solr.peviitor.ro/solr/company/update/json?commit=true" \
  -H "Content-Type: application/json" \
  -d '[{
    "id": "32519996",
    "lastScraped": "2026-03-05",
    "scraperFile": "coera.md"
  }]'
```

**IMPORTANT**: Always use the company's CUI as the `id` field.

## Company Update Logic

When updating the company in Solr:
1. Query: `curl -s -u $SOLR_USER:$SOLR_PASSWD "https://solr.peviitor.ro/solr/company/select?q=id:32519996&fl=id,company,brand,group,status,location,website,career,lastScraped,scraperFile"`
2. Check if ANY of these fields are missing or empty: brand[], group[], website[], career[], location[]
3. If ANY field is missing → search internet for missing data and update ALL fields:
   - Use targetare.ro to get company details
   - Use WebSearch to find official website(s) - prioritize .ro domains
   - Use WebSearch to find careers page(s) - prioritize .ro domains
   - Use WebSearch to find parent company group
4. If ALL fields are complete → only update lastScraped and scraperFile

## Job Data Fields

| Field | Source | Example |
|-------|--------|---------|
| url | Job link href | `https://jobs.smartrecruiters.com/COERA/743999680007137-go-beyond-for-your-role-` |
| title | Job heading | "Go beyond for your role!" |
| company | Fixed value | "COERA BC SRL" |
| cif | Fixed value | "32519996" |
| location | From listing | ["Cluj-Napoca"] |
| workmode | From job details | "on-site" |
| tags | Extract from job detail | See below |
| date | Current date | "2026-02-17T00:00:00Z" |
| status | Fixed value | "scraped" |

## TAG EXTRACTION

The `tags` field is an array of lowercase strings (NO DIACRITICS).

### 1. Seniority Level
From job title:
- "Junior" / "Intern" → "junior"
- "Senior" → "senior"
- Default → "mid"

### 2. Skills
Extract from job description:

| Skill Found | Tag Value |
|-------------|-----------|
| .NET | ".net" |
| Node.js, NodeJS | "node.js" |
| Azure | "azure" |
| PostgreSQL | "postgresql" |
| AngularJS, Angular | "angular" |
| SQL Server, MS SQL | "sql-server" |
| EF Core, Entity Framework | "entity-framework" |
| SEO | "seo" |
| Cloud | "cloud" |

### Example Tags

**Go beyond for your role! (Contract)**
- Skills mentioned: .NET, Node.js, Azure, PostgreSQL, AngularJS, SQL Server, EF Core
- Tags: ["software-engineer", ".net", "node.js", "azure", "postgresql", "angularjs", "sql-server", "ef-core"]

This is a general software engineering position that accepts candidates at various levels.

### Tags Field Rules
- **lowercase only** - NO UPPERCASE
- **no diacritics** - avoid special characters
- **max 20 entries** - don't exceed
- **array format** - ["tag1", "tag2"]

## Solr Format

Push to Solr using curl:
```bash
curl -u $SOLR_USER:$SOLR_PASSWD -X POST -H "Content-Type: application/json" \
  "https://solr.peviitor.ro/solr/job/update?commit=true" \
  -d '[{"url":"{JOB_URL}","title":"{TITLE}","company":"COERA BC SRL","cif":"32519996","location":["Cluj-Napoca"],"workmode":"on-site","tags":["{tag1}","{tag2}"],"date":"2026-02-17T00:00:00Z","status":"scraped"}]'
```

Example:
```bash
curl -u $SOLR_USER:$SOLR_PASSWD -X POST -H "Content-Type: application/json" \
  "https://solr.peviitor.ro/solr/job/update?commit=true" \
  -d '[{"url":"https://jobs.smartrecruiters.com/COERA/743999680007137-go-beyond-for-your-role-","title":"Go beyond for your role!","company":"COERA BC SRL","cif":"32519996","location":["Cluj-Napoca"],"workmode":"on-site","tags":["software-engineer",".net","node.js","azure","postgresql","angularjs","sql-server","ef-core"],"date":"2026-02-17T00:00:00Z","status":"scraped"}]'
```

## Current Jobs (Feb 2026)

| # | Title | Location | Type | Work Mode |
|---|-------|----------|------|-----------|
| 1 | Go beyond for your role! | Cluj-Napoca | Contract | on-site |

This is a general open position for software engineers. The job description mentions:
- .NET APIs, Node.js, Azure Cloud (Service Bus, Container Apps), PostgreSQL, AngularJS
- .NET 8, MS SQL Server, EF Core
- SEO optimization platform projects

## Important Notes

- COERA uses SmartRecruiters for job management
- Main careers page links to SmartRecruiters
- Only 1 position listed (general software engineering role)
- This is a contract position, not full-time
- Work mode is on-site (no remote option)
- Verify with: `curl -s -u $SOLR_USER:$SOLR_PASSWD "https://solr.peviitor.ro/solr/job/select?q=cif:32519996"`
