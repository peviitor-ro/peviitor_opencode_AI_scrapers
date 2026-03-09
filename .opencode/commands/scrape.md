---
description: Scrape jobs from a company career page and push to Solr
agent: build
---

# SOLR AUTHENTICATION REMINDER
**ALWAYS use credentials when pushing to Solr:**
- Use environment variables: `$SOLR_USER` and `$SOLR_PASSWD`
- Example: `curl -u "$SOLR_USER:$SOLR_PASSWD" "https://solr.peviitor.ro/solr/job/update/json?commit=true"`
- In GitHub Actions, use secrets: `${{ secrets.SOLR_USER }}` and `${{ secrets.SOLR_PASSWD }}`

---

Scrape jobs from a company's career page and add them to Solr.

## IMPORTANT - Use Company-Specific Prompts First

**Before doing anything else**, check if there's a company-specific scraping prompt file:
- Look for `webscraper/{company}.md` (e.g., `webscraper/epam.md`, `webscraper/endava.md`)
- If found, **READ and FOLLOW** those specific instructions exactly
- The prompt file contains all the scraping steps, URL patterns, and data extraction rules for that company

## Workflow

### Step 1: Check for Company Prompt File
1. Parse company name from arguments (e.g., "EPAM" or "EPAM SYSTEMS INTERNATIONAL SRL")
2. Look for file: `webscraper/{lowercase_company_name}.md`
   - Example: "EPAM" → `webscraper/epam.md`
   - Example: "Endava" → `webscraper/endava.md`
3. **IF found**: Read the file and follow the scraping instructions inside
4. **IF NOT found**: 
   - Create a new scraper file at `webscraper/{lowercase_company_name}.md`
   - Include company info, careers URL, pagination rules, and data extraction steps
   - This file will be saved and can be used for future scrapes

### Step 2: Check Company in Solr
5. Query Solr company core to find the company:
   - Search by brand: `https://solr.peviitor.ro/solr/company/select?q=brand:EPAM`
   - Search by company name: `https://solr.peviitor.ro/solr/company/select?q=company:EPAM%20SYSTEMS`
   - Search by CUI: `https://solr.peviitor.ro/solr/company/select?q=id:33159615`
6. If NOT found in Solr, run `/add-website` with the company name
7. Once company is found in Solr, get the career URL from the `career` field
8. Navigate to the career page
9. Filter for Romanian jobs only (jobs that can be worked from Romania)
10. Extract job data according to Job Model Schema (see SCHEMAS.md)
11. Push documents to Solr using /update-solr
12. Verify documents were inserted

## Company Prompt File Format

Each company prompt file should contain:
- Company info (name, legal name, CUI, website, careers URL)
- Romania-specific job URL with filters
- Pagination rules
- Job URL format
- Data extraction steps
- Solr schema format

See existing examples:
- `webscraper/epam.md` - Example of EPAM careers scraping
- `webscraper/endava of SmartRecruit.md` - Exampleers scraping

Usage:
- Scrape company: /scrape EPAM
- Scrape by full name: /scrape "EPAM SYSTEMS INTERNATIONAL SRL"

Arguments:
- Company brand name or full company name (e.g., "EPAM", "Endava", "ENDAVA ROMANIA SRL")

## Company Model Schema (from peviitor_core):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | CIF/CUI (8 digits) |
| company | string | Yes | Legal company name (diacritics REQUIRED) |
| brand | string[] | No | Commercial brand name(s) - Array (e.g. ["ORANGE"], ["Orange", "Orange Business"]) |
| group | string[] | No | Parent company group(s) - Array (e.g. ["Orange Group"]) |
| status | string | No | "activ", "suspendat", "inactiv", "radiat" |
| location | string[] | No | Romanian cities, DIACRITICS ACCEPTED |
| website | string[] | No | Official website URL(s) - ALWAYS prioritize .ro domains |
| career | string[] | No | Career page URL(s) - ALWAYS prioritize .ro domains |
| lastScraped | string | No | Date of last scrape (e.g. "2026-02-20") |
| scraperFile | string | No | Name of scraper file (e.g. "epam.md") |

Job Model Schema (from SCHEMAS.md):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | Yes | Full URL to job detail page |
| title | string | Yes | Position title (max 200 chars, no HTML, diacritics OK) |
| company | string | No | Legal company name (diacritics REQUIRED) |
| cif | string | No | CUI/CIF from company.id |
| location | string[] | No | Romanian cities (diacritics OK), multi-valued |
| tags | string[] | No | Skills, education, experience (lowercase, no diacritics) |
| workmode | string | No | "remote", "on-site", "hybrid" |
| date | date | No | ISO8601 scrape date (e.g., "2026-01-18T10:00:00Z") |
| status | string | No | "scraped" (default) - will be updated to "tested" during validation |
| expirationdate | date | No | Try to extract from job page, otherwise leave empty (set during validation) |
| salary | string | No | "MIN-MAX CURRENCY" (e.g., "5000-8000 RON") |

Workflow:
1. Parse company name from /scrape arguments
2. Query Solr company core to find company:
   - Try by brand: `curl -u "$SOLR_USER:$SOLR_PASSWD" "https://solr.peviitor.ro/solr/company/select?q=brand:COMPANY_NAME"`
   - Try by company name: `curl -u "$SOLR_USER:$SOLR_PASSWD" "https://solr.peviitor.ro/solr/company/select?q=company:COMPANY_NAME"`
   - Try by CUI if provided
3. If not found in Solr:
   - Run /add-website with the company name
   - Re-query Solr to get updated data
4. If company EXISTS in Solr, check if all fields are complete:
   - Query: `curl -u "$SOLR_USER:$SOLR_PASSWD" "https://solr.peviitor.ro/solr/company/select?q=id:{CUI}&fl=id,company,brand,group,status,location,website,career,lastScraped,scraperFile"`
   - Check for missing or empty fields:
     - brand[] is missing or empty
     - group[] is missing or empty  
     - website[] is missing or empty
     - career[] is missing or empty
     - location[] is missing or empty
   - If ANY field is missing or empty, research and update:
     a. Search for company on targetare.ro to get CUI
     b. Navigate to targetare.ro to get full company details
     c. Search for official website(s) - prioritize .ro domains
     d. Search for careers page(s) - prioritize .ro domains
     e. Search for parent group
     f. Use WebSearch to find any missing data
5. If updating company, use atomic upsert with ALL fields:
   - curl -u "$SOLR_USER:$SOLR_PASSWD" -X POST "https://solr.peviitor.ro/solr/company/update/json?commit=true" \
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
6. Get company data from Solr response:
   - id (CUI)
   - company (full legal name)
   - brand[] - if missing, research and update
   - group[] - if missing, research and update
   - website[] - **IMPORTANT**: When multiple websites exist, use .ro domains FIRST
   - career[] - **IMPORTANT**: When multiple careers pages exist, use .ro domains FIRST
   - If company has both ziramarketing.com and ziramarketing.ro, use ONLY ziramarketing.ro
5. Push company to Solr company core FIRST (before jobs):
   - Use curl to POST to https://solr.peviitor.ro/solr/company/update/json?commit=true
   - Credentials: "$SOLR_USER:$SOLR_PASSWD"
   - Format: JSON with id, company, brand[], group[], status="activ", website[], career[]
   - This ensures company exists before jobs are added
   - **IMPORTANT**: When updating website[] or career[] arrays, ALWAYS prioritize .ro domains
   - Put .ro domains FIRST in arrays: e.g., `["https://www.company.ro", "https://www.company.com"]`
6. Get career URL from Solr company.career array
7. Navigate to career page using Chrome DevTools MCP
8. Find jobs that can be worked from Romania:
   - Look for "Romania" location filters
   - Filter out jobs requiring other countries only
   - Include: "Romania", "București", "Cluj-Napoca", "remote Romania", etc.
9. Extract each job:
   - url: full URL to job detail
   - title: job title
   - company: from Solr company.company
   - cif: from Solr company.id
   - location: Romanian cities only
   - tags: skills, education, experience (lowercase, no diacritics)
   - workmode: "remote", "on-site", or "hybrid"
   - date: current date in ISO8601
   - status: "scraped"
   - salary: if available
   - expirationdate: try to extract from job page (look for "apply by", "expires", "valid until", etc.)
10. Push to Solr:
    a. Company core (ALWAYS do this first):
       - Use curl to POST to https://solr.peviitor.ro/solr/company/update/json?commit=true
       - Credentials: "$SOLR_USER:$SOLR_PASSWD"
       - Format (use atomic upsert - Solr will merge if id exists):
         [{
           "id": "33159615",
           "company": "EPAM SYSTEMS INTERNATIONAL SRL",
           "brand": "EPAM",
           "group": "EPAM Systems",
           "status": "activ",
           "website": ["https://www.epam.com"],
           "career": ["https://www.epam.com/careers/locations/romania"],
           "lastScraped": "2026-03-05",
           "scraperFile": "epam.md"
         }]
        - If company exists, use atomic add to update lastScraped AND scraperFile:
          [{
            "id": "33159615",
            "lastScraped": "2026-03-05",
            "scraperFile": "epam.md"
          }]
        - **IMPORTANT**: ALWAYS include both lastScraped AND scraperFile when updating company - this is atomic add, not overwrite
    b. Job core:
       - Use curl to POST to https://solr.peviitor.ro/solr/job/update/json?commit=true
       - Credentials: "$SOLR_USER:$SOLR_PASSWD"
       - Format: JSON array of job documents
11. Verify insertion:
    - Query Solr for inserted company by id
    - Query Solr for inserted jobs by url
    - Confirm counts

Example Flow:
1. User runs: /scrape EPAM
2. AI queries://solr.pe Solr: httpsviitor.ro/solr/company/select?q=brand:EPAM
3. Found! career: https://www.epam.com/careers/locations/romania
4. AI checks if all company fields are complete:
   - Query: https://solr.peviitor.ro/solr/company/select?q=id:33159615&fl=id,company,brand,group,status,location,website,career
5. If fields are missing (brand, group, website, career empty):
   - AI searches targetare.ro for company details
   - AI searches for official website (.ro priority)
   - AI searches for careers page (.ro priority)
   - AI searches for parent company group
6. AI pushes company to Solr company core (atomic upsert):
   [{
     "id": "33159615",
     "company": "EPAM SYSTEMS INTERNATIONAL SRL",
     "brand": ["EPAM"],
     "group": ["EPAM Systems"],
     "status": "activ",
     "website": ["https://www.epam.com", "https://www.epam.ro"],
     "career": ["https://www.epam.com/careers/locations/romania"],
     "lastScraped": "2026-03-05",
     "scraperFile": "epam.md"
   }]
5. AI navigates to career page
6. AI filters for Romania jobs only
7. AI extracts job data:
   [
     {
       "url": "https://www.epam.com/careers/job/12345",
       "title": "Senior Java Developer",
       "company": "EPAM SYSTEMS INTERNATIONAL SRL",
       "cif": "33159615",
       "location": ["București", "Cluj-Napoca"],
       "tags": ["java", "spring", "senior", "hibernate"],
       "workmode": "hybrid",
       "date": "2026-02-17T00:00:00Z",
       "status": "scraped",
       "salary": "5000-10000 EUR",
       "expirationdate": "2026-03-17T00:00:00Z"
     }
   ]
8. AI pushes jobs to Solr job core
9. AI verifies both company and jobs exist in Solr

Note:
- ALWAYS use Chrome DevTools MCP for scraping (requires Chrome with remote debugging)
- Run start-chrome.ps1 first if Chrome is not running with debug port
- ONLY scrape jobs that can be worked from Romania - exclude jobs in other countries
- Use CUI from Solr company.id for the "cif" field
- Use full legal company name from Solr company.company for "company" field
- ALWAYS push company to Solr company core BEFORE pushing jobs
- Use "activ" as default status for new companies
- After scraping, ALWAYS update BOTH "lastScraped" AND "scraperFile" fields in Solr company core (format: YYYY-MM-DD)
- Solr uses atomic upsert - if company id exists, it will merge fields (not overwrite)
- When updating existing company, ALWAYS include both lastScraped and scraperFile fields - this is atomic add, not overwrite
- Try to extract expirationdate from job page (look for "apply by", "expires", "valid until", "deadline" text). If found, parse the date and convert to ISO8601. If not found, leave empty.
- **IMPORTANT - WEBSITE PRIORITY**: When company has multiple websites/careers pages, ALWAYS prioritize .ro domains and put them FIRST in arrays. Example: use ziramarketing.ro, NOT ziramarketing.com
- for details:

  You are running in GitHub Actions. You have access to Chrome DevTools MCP connected to Chrome on port 9222.
  
  IMPORTANT - Solr Configuration:
  - Use SOLR_USER and SOLR_PASSWD environment variables for authentication.
  - Solr URL is: https://***.peviitor.ro
  - Example: curl -u \"\$SOLR_USER:\$SOLR_PASSWD\" \"https://***.peviitor.ro/***/job/select?q=status:scraped&wt=json&rows=1\"
  
  Security rules:
  - Do NOT reveal SOLR_USER or SOLR_PASSWD values in any output.
  - Use credentials for Solr operations only.
  
  Follow the workflow in AGENTS.md and instructions.md to validate jobs:
  
  1. First query SOLR for a job with status NOT verified:
     curl -u \"\$SOLR_USER:\$SOLR_PASSWD\" 'https://***.peviitor.ro/***/job/select?q=-status:verified&wt=json&rows=1'
  
  2. Open the job URL from SOLR in Chrome using chrome-devtools
  
  3. Extract and verify all fields (salary, tags, workmode, etc.). follow instructions from instructions.md and AGENTS.md file from this repository.
  
  4. If job is no longer available (shows 'expired' or 'no longer available'), delete from SOLR:
     curl -u \"\$SOLR_USER:\$SOLR_PASSWD\" -X POST -H 'Content-Type: application/json' \\
       'https://***.peviitor.ro/***/job/update?commit=true' \\
       -d '{\"delete\": [\"<JOB_URL>\"]}'
  
  5. Otherwise, use atomic update with {\"set\": \"value\"} to update verified fields and set status='verified', vdate to today's date in ISO8601 format (e.g., 2026-03-08T00:00:00Z):
     curl -u \"\$SOLR_USER:\$SOLR_PASSWD\" -X POST -H 'Content-Type: application/json' \\
       'https://***.peviitor.ro/***/job/update?commit=true' \\
       -d '{\"add\": {\"doc\": {\"url\": \"<JOB_URL>\", \"status\": {\"set\": \"verified\"}, \"vdate\": {\"set\": \"2026-03-08T00:00:00Z\"}}}}'
  
  6. Verify the update by querying SOLR:
     curl -u \"\$SOLR_USER:\$SOLR_PASSWD\" 'https://***.peviitor.ro/***/job/select?q=url:<JOB_URL>&wt=json'
  
  7. for tags we are interested if job is entry level or mid or senior. we also need to extract required skills, industry.
  tags are one of the most IMPORTANT part why we open the page in Chrome. so extract up to 10 most important tags.
  
  9. extract the salary. if there is just one salary displayed then extract this one from the page. This one is important to have salary.
  if there is "lei" transform it to "RON"
  
  10. limit to 25 jobs
  Output the final result (number of jobs validated).
  11. use company name as uppercase. if lowercase in *** please transform it to uppercase. we always want company name with uppercase in job and company schema
  12. use User-Agent for OLX to mimic user browser calls. try to make olx work. there are multiple URLs that expired on olx. we need to validate them not to skip them
  13. use olx-pages-helper.md instructions on how to avoid CAPTCHA
 ### 1. Job & Company Models
Read the README from peviitor-core to understand the data models:
- **URL**: https://github.com/peviitor-ro/peviitor_core/blob/main/README.md
- **Content**: Job Model Schema and Company Model Schema

### 2. Solr Schemas
Access the live Solr instance to see the actual field definitions:
- **Base URL**: https://solr.peviitor.ro
- **Credentials**: `$SOLR_USER:$SOLR_PASSWD`

#### Job Core Schema
```bash
curl -u $SOLR_USER:$SOLR_PASSWD "https://solr.peviitor.ro/solr/job/schema"
```

#### Company Core Schema
```bash
curl -u $SOLR_USER:$SOLR_PASSWD "https://solr.peviitor.ro/solr/company/schema"
```

## Job Model Fields (from Solr)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | Full URL to job detail page (unique key) |
| `title` | text_general | Yes | Position title |
| `company` | string | No | Hiring company name, Always use uppercase. |
| `cif` | string | No | CIF/CUI of the company |
| `location` | text_general | No | Romanian cities/addresses |
| `tags` | text_general[] | No | Skills/education/experience |
| `workmode` | string | No | "remote", "on-site", "hybrid" |
| `date` | pdate | No | Scrape date (ISO8601) |
| `status` | string | No | "scraped", "tested", "published", "verified" |
| `vdate` | pdate | No | Verified date |
| `expirationdate` | pdate | No | Job expiration date |
| `salary` | text_general | No | Format: "MIN-MAX CURRENCY" |

## Company Model Fields (from Solr)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | CIF/CUI (unique key) |
| `company` | string | Yes | Legal name from Trade Register . always use uppercase.|
| `brand` | string | No | Commercial brand name |
| `group` | string | No | Parent company group |
| `status` | string | No | "activ", "suspendat", "inactiv", "radiat" |
| `location` | text_general | No | Romanian cities/addresses |
| `website` | string[] | No | Official company website(s) |
| `career` | string[] | No | Career page URL(s) |
| `lastScraped` | string | No | Last scrape date (ISO8601) |
| `scraperFile` | string | No | Name of scraper file used |

## Workflow: Verifying Jobs

### Step 1: Find Unverified Jobs in SOLR
When starting a new verification session, query SOLR for jobs that are NOT verified:
```bash
curl -u $SOLR_USER:$SOLR_PASSWD "https://solr.peviitor.ro/solr/job/select?q=status:scraped&wt=json&rows=1"
```

### Step 2: Open Job URL
Navigate to the job's URL from the SOLR response.

### Step 3: Extract & Verify Data
Follow the extraction process in AGENTS.md
transform company name to uppercase

### Step 4: Push Updates to SOLR
Use **atomic update** to add verified fields. Status should be set to "verified".

**Important**: Use atomic update with `{"set": "value"}` to preserve existing fields:

```bash
curl -u $SOLR_USER:$SOLR_PASSWD -X POST -H "Content-Type: application/json" \
  "https://solr.peviitor.ro/solr/job/update?commit=true" \
  -d "{\"add\": {\"doc\": {\"url\": \"<JOB_URL>\", \
  \"company\": {\"set\": \"<company>\"}, \
  \"cif\": {\"set\": \"<cif>\"}, \
  \"salary\": {\"set\": \"<salary>\"}, \
  \"workmode\": {\"set\": \"<workmode>\"}, \
  \"tags\": {\"set\": [\"tag1\", \"tag2\"]}, \
  \"status\": {\"set\": \"verified\"}, \
  \"vdate\": {\"set\": \"2026-03-08T00:00:00Z\"}}}}"
```

### Step 5: Verify the Update in SOLR
Always query SOLR to confirm all fields were updated correctly:
```bash
curl -u $SOLR_USER:$SOLR_PASSWD "https://solr.peviitor.ro/solr/job/select?q=url:<JOB_URL>&wt=json"
```

**Note**: Date fields (vdate, date, expirationdate) must use ISO8601 format: `YYYY-MM-DDTHH:MM:SSZ`

### Step 6: Handle Expired Jobs
If job is no longer available on the original URL:
```bash
curl -u $SOLR_USER:$SOLR_PASSWD -X POST -H "Content-Type: application/json" \
  "https://solr.peviitor.ro/solr/job/update?commit=true" \
  -d "{\"delete\": [\"<JOB_URL>\"]}"
```

## Notes
- Use `curl` with `-u $SOLR_USER:$SOLRPASSWD` for authentication
- The Solr instance uses `text_general` field type for most text fields
- Both cores have copy fields that aggregate text to `_text_` for full-text search

# Agent Instructions

When working with this project, follow these steps:

## 1. Read Documentation First
- Start by reading `instructions.md` in this directory to understand the project context
- Check for any existing documentation before making assumptions

## 2. Job & Company Models
To understand the data models:
1. Fetch from GitHub: `https://github.com/peviitor-ro/peviitor_core/blob/main/README.md`
2. Or use the cached info in `instructions.md`

## 3. Accessing Solr Schemas
When asked to read Solr schemas:

### Job Core
```bash
curl -u $SOLR_USER:$SOLR_PASSWD "https://solr.peviitor.ro/solr/job/schema"
```

### Company Core
```bash
curl -u $_SOLR_USER:$SOLR_PASSWD "https://solr.peviitor.ro/solr/company/schema"
```

**Important**: 
- Use `curl` with `-u $SOLR_USER:$SOLR_PASSWD` for Basic Auth
- WebFetch alone won't work due to 401 errors - curl/bash is required
- Do NOT use the username "$SOLR_USER:$SOLR_PASSWD" in URL format - use `-u` flag instead
- you are running in PROD, be careful; you don't use localhost:8983

## 4. Key Differences from Documentation
- The README in peviitor_core describes the conceptual model
- The Solr schemas show the actual implementation (field types, indexing)
- Some fields may differ slightly between conceptual and implementation

## 5. Authentication
- Solr credentials: `$SOLR_USER` / `$SOLR_PASSWD`
- Always use Basic Auth via curl `-u` flag

## 6. Verification Workflow
When asked to verify. First query SOL a job:
1R for a job with status="scraped" (not yet verified)
2. Open the job URL from SOLR
3. Extract missing fields (salary, tags, cif, etc.)
4. Use targetare.ro to find company CIF if needed
5. **Use atomic update** with `{"set": "value"}` to preserve existing fields
6. Push atomic update with all verified fields and status="verified"
7. **Verify the update** by querying SOLR to confirm all fields
8. If job is no longer available, delete it from SOLR

CRITICAL - AUTOMATIC PAGINATION:
- The model MUST NOT stop until ALL jobs are collected from ALL pages
- After extracting jobs from the current page, look for pagination controls (Next button, page numbers)
- If more pages exist, click Next or navigate to the next page and continue extracting jobs
- Repeat until there are no more pages (Next button is disabled or page numbers end)
- Keep track of total jobs found and ensure all are pushed to Solr
- DO NOT stop after the first page or after a fixed number of jobs
