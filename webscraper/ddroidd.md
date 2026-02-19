# DDROIDD Scraper Prompt

## Company Info
- **Name**: DDROIDD
- **Legal Name**: DDROIDD LTD SRL
- **CUI**: 40399734
- **Website**: https://www.ddroidd.com
- **Careers Page**: https://www.ddroidd.com/careers

## Romania Jobs URL
```
https://www.ddroidd.com/careers
```
This is the main careers page. Jobs are displayed directly on this page without pagination.

## Total Jobs
- **9 Romania jobs** (as of Feb 2026)
- Jobs are listed on a single page
- 1 job in Cluj (Junior)
- 1 job in Cluj (Senior)
- 7 jobs with "Romania" location (all Senior level)

## Excluded Jobs
- 1 job in DACH region (not Romania) - excluded

## Work Mode Detection
From the job listing:
- Jobs with "Romania" location → workmode: "remote" (explicitly stated in job details)
- Jobs with "Cluj" location → workmode: "hybrid" (default for on-site positions)

## Location Detection
From the job listing text:
- "Cluj" → location: ["Cluj"]
- "Romania" → location: ["Romania"]

## Job URL Format
```
https://www.ddroidd.com/careers/{JOB_SLUG}
```

Example: `https://www.ddroidd.com/careers/service-desk-analyst`

## Scraping Steps

1. **Navigate to DDROIDD careers page**:
   `https://www.ddroidd.com/careers`

2. **Extract all job links**:
   - Look for links with href pattern `/careers/{job-slug}`
   - Filter out non-job links

3. **For each job**:
   - Extract title, location, and level from listing
   - Optionally click job for detailed tags

4. **Push to Solr** - see format below

5. **Update websites.md**: Set "Last Scraped" to today's date (format: YYYY-MM-DD)

## Job Data Fields

| Field | Source | Example |
|-------|--------|---------|
| url | Job link href | `https://www.ddroidd.com/careers/service-desk-analyst` |
| title | Job heading | "Service Desk Analyst" |
| company | Fixed value | "DDROIDD LTD SRL" |
| cif | Fixed value | "40399734" |
| location | Parse from text | ["Cluj"] or ["Romania"] |
| workmode | From job details | "remote" or "hybrid" |
| tags | Extract from job detail | See below |
| date | Current date | "2026-02-17T00:00:00Z" |
| status | Fixed value | "scraped" |

## TAG EXTRACTION

The `tags` field is an array of lowercase strings (NO DIACRITICS).

### 1. Seniority Level
From job title and level text:

| Keyword | Tag Value |
|---------|-----------|
| "Junior" | "junior" |
| "Senior" | "senior" |
| Default | "mid" |

### 2. Skills
Extract from job description sections:

| Skill Found | Tag Value |
|-------------|-----------|
| Java, Spring | "java" |
| .NET | ".net" |
| Python | "python" |
| C++ | "c++" |
| iOS, Swift, SwiftUI | "ios" |
| Android | "android" |
| React, Vue, Angular | "frontend" |
| DevOps, Jenkins, Docker, Kubernetes | "devops" |
| AWS, Azure, GCP | "cloud" |
| SQL, PostgreSQL, MySQL | "sql" |
| QA, Testing, Automation | "qa" |
| Data Engineer, Spark | "data-engineering" |
| Terraform, Ansible | "infrastructure" |

### Example Tags

**Service Desk Analyst (Cluj, Junior, hybrid)**
- Tags: ["it-support", "helpdesk", "windows", "m365", "networking", "hardware", "communication", "problem-solving", "junior"]

**Senior C++ Developer (Cluj, Senior, hybrid)**
- Tags: ["c++", "modern-c++", "stl", "data-structures", "algorithms", "multi-threading", "linux", "oop", "debugging", "performance-optimization", "senior"]

**Senior Data Engineer (Romania, Senior, remote)**
- Tags: ["spark", "data-engineering", "etl", "elt", "databricks", "aws", "scala", "senior"]

**DevOps Engineer (Romania, Senior, remote)**
- Tags: ["jenkins", "docker", "kubernetes", "aws", "terraform", "ansible", "elk", "nagios", "bash", "python", "php", "symfony", "senior"]

### Tags Field Rules
- **lowercase only** - NO UPPERCASE
- **no diacritics** - use "c++" not "C++"
- **max 20 entries** - don't exceed
- **array format** - ["tag1", "tag2"]

## Solr Format

Push to Solr using curl:
```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  "http://localhost:8983/solr/job/update?commit=true" \
  -d '[{"url":"{JOB_URL}","title":"{TITLE}","company":"DDROIDD LTD SRL","cif":"40399734","location":["{LOCATION}"],"workmode":"{workmode}","tags":["{tag1}","{tag2}"],"date":"2026-02-17T00:00:00Z","status":"scraped"}]'
```

## Current Jobs (Feb 2026)

| # | Title | Location | Level | Work Mode |
|---|-------|----------|-------|-----------|
| 1 | Service Desk Analyst | Cluj | Junior | hybrid |
| 2 | Senior C++ Developer | Cluj | Senior | hybrid |
| 3 | Java Solution Architect | Romania | Senior | hybrid |
| 4 | Senior Data Engineer | Romania | Senior | remote |
| 5 | Senior QA Automation Engineer | Romania | Senior | remote |
| 6 | Senior iOS Developer | Romania | Senior | remote |
| 7 | Python Developer | Romania | Senior | remote |
| 8 | Java Developer | Romania | Senior | remote |
| 9 | DevOps Engineer | Romania | Senior | remote |

**Excluded**: Business Development Manager (DACH region - not Romania)

## Important Notes

- DDROIDD uses their own website careers page (not SmartRecruiters)
- All jobs are displayed on a single page
- Work mode is explicitly mentioned in job details (remote for Romania positions, hybrid for Cluj)
- Push all 9 Romania jobs to Solr
- workmode values must be exactly: "remote", "on-site", or "hybrid"
- Verify with: `curl -s -u solr:SolrRocks "http://localhost:8983/solr/job/select?q=cif:40399734"`
