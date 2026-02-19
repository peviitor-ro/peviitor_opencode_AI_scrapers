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

7. **Update websites.md**: Set "Last Scraped" to today's date (format: YYYY-MM-DD)

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
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  "http://localhost:8983/solr/job/update?commit=true" \
  -d '[{"url":"{JOB_URL}","title":"{TITLE}","company":"COERA BC SRL","cif":"32519996","location":["Cluj-Napoca"],"workmode":"on-site","tags":["{tag1}","{tag2}"],"date":"2026-02-17T00:00:00Z","status":"scraped"}]'
```

Example:
```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  "http://localhost:8983/solr/job/update?commit=true" \
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
- Verify with: `curl -s -u solr:SolrRocks "http://localhost:8983/solr/job/select?q=cif:32519996"`
