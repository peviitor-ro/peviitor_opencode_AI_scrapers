# GENPACT Scraper Prompt

## Company Info
- **Name**: GENPACT
- **Legal Name**: GENPACT ROMANIA SRL
- **CUI**: 17362595
- **Website**: https://www.genpact.com
- **Careers Page**: https://www.genpact.com/careers

## Jobs URL (Romania)
```
https://genpact.taleo.net/careersection/sgy_external_career_section/jobsearch.ftl?lang=en&portal=44100025334
```

To filter for Romania:
1. Type "Romania" in the Location field
2. Click "Search for jobs"
3. Filter URL: Already filtered by Romania

## Total Jobs
- **306 Romania jobs** (as of Feb 2026)
- ~13 pages with 25 jobs per page
- Locations: Bucharest, Iași, Cluj-Napoca

## Platform
- Uses Taleo recruitment platform
- Job URLs: `https://genpact.taleo.net/careersection/sgy_external_career_section/jobdetail.ftl?job={JOB_ID}`

## Work Mode Detection
From job title or job details:
- "Remote Romania" or "Remote Ro" → workmode: "remote"
- "Hybrid Bucharest" / "Hybrid Iasi" / "Hybrid Cluj" → workmode: "hybrid"
- "On site" / "On-site" → workmode: "on-site"
- Default (not specified): "hybrid" (common for Genpact)

## Location Detection
From job listing:
- "Romania-Bucharest" → location: ["București"]
- "Romania-Iasi" → location: ["Iași"]
- "Romania-Cluj-Napoca" → location: ["Cluj-Napoca"]

## Scraping Steps

1. **Navigate to Genpact careers job search**:
   `https://genpact.taleo.net/careersection/sgy_external_career_section/jobsearch.ftl?lang=en&portal=44100025334`

2. **Filter for Romania**:
   - Type "Romania" in the Location textbox
   - Click "Search for jobs"

3. **Extract job list**:
   Each job shows:
   - Job title
   - Location (e.g., "Romania-Iasi", "Romania-Bucharest")
   - Posting date

4. **Click on each job** to get full details:
   - Extract title, location, work mode
   - Note: Work mode often in title (e.g., "Remote Romania", "Hybrid Bucharest")

5. **Navigate through pages**:
   - Use pagination (Next button or page numbers)
   - Continue until all pages are exhausted

6. **Push to Solr** after each job or in batches

## Solr Schema
Push to Solr at `http://localhost:8983/solr/job/update` with credentials `solr:SolrRocks`:
```json
{
  "add": {
    "doc": {
      "url": "{JOB_URL}",
      "title": "{TITLE}",
      "company": "GENPACT ROMANIA SRL",
      "cif": "17362595",
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

The `tags` field is an array of lowercase strings (NO DIACRITICS). Extract these from the job title:

### 1. Seniority Level
Extract from job TITLE:

| Keyword in Title | Description | Tag Value |
|-----------------|-------------|------------|
| "Senior" | Senior level position | "senior" |
| "Lead" | Team lead | "senior" |
| "Manager" | Management | "senior" |
| "Assistant Manager" | Assistant Manager | "senior" |
| "Trainee" | Trainee program | "trainee" |
| "Domain Trainee" | Trainee program | "trainee" |
| "Management Trainee" | Trainee program | "trainee" |
| "Process Associate" | Entry level | "junior" |
| "Process Developer" | Mid level | "mid" |
| "Consultant" | Mid/Senior level | "mid" |
| "Principal" | Senior/Consultant | "consultant" |
| "Vice President" | Consultant | "consultant" |
| Default (no prefix) | Mid level | "mid" |

### 2. Field Targeting
Extract from job TITLE keywords:

| Keyword Found | Field Tag | Notes |
|--------------|-----------|-------|
| HR, Human Resources, Payroll | "hr" | Human Resources |
| Finance, Accounting, R2R, Accounts | "finance" | Finance/Accounting |
| Collections, Accounts Receivable | "finance" | Finance |
| Order Management, Supply Chain | "operations" | Operations |
| Customer Service, Customer Care | "customer-service" | Customer Service |
| Sales, Business Development | "sales" | Sales |
| Data, Analytics, AI | "data-science" | Data/AI |
| IT, Service Desk, Technical | "it" | IT |
| Project Management, PM | "project-management" | PM |
| Insurance | "insurance" | Insurance domain |
| Legal, Compliance | "legal" | Legal |
| Procurement, Buyer | "procurement" | Procurement |

### Example Tags Extraction

**Job**: "Human Resources Operations – Senior Process Associate – English – Remote Ro"
- From title: "Senior" → "senior"
- Keywords: "HR", "Human Resources" → "hr"
- Tags: `["senior", "hr"]`

**Job**: "Human Resources Operations – Domain Trainee – English – Remote Romania"
- From title: "Domain Trainee" → "trainee"
- Keywords: "HR", "Human Resources" → "hr"
- Tags: `["trainee", "hr"]`

**Job**: "Accounts Receivable Subject Matter Expert – Assistant Manager - French – Hybrid Bucharest"
- From title: "Assistant Manager" → "senior"
- Keywords: "Accounts Receivable", "Finance" → "finance"
- Tags: `["senior", "finance"]`

**Job**: "Order Management – Senior Process Associate – Greek – hybrid Bucharest"
- From title: "Senior" → "senior"
- Keywords: "Order Management" → "operations"
- Tags: `["senior", "operations"]`

### Tags Field Rules (per SCHEMAS.md)
- **lowercase only** - NO UPPERCASE
- **no diacritics** - use "it" not "IT"
- **max 20 entries** - don't exceed
- **array format** - ["tag1", "tag2"]
- **standardized values only** - use consistent naming

## Important Notes
- **Follow Job Model exactly** - See SCHEMAS.md for required fields. DO NOT include "description" field - it doesn't exist in the Job model!
- Genpact has many job types: Process Associates, Consultants, Managers, etc.
- Work mode is usually specified in job title (Remote/Hybrid/On-site)
- Locations: București, Iași, Cluj-Napoca
- Company name must be exactly: "GENPACT ROMANIA SRL"
- There are 306 Romania jobs - pagination is required
- Commit to Solr after each job or in batches
- Verify count in Solr matches expected ~306 jobs
