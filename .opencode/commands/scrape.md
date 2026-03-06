---
description: Scrape jobs from a company career page and push to Solr
agent: build
---

# SOLR AUTHENTICATION REMINDER
**ALWAYS use credentials when pushing to Solr:**
- Username: `solr`
- Password: `SolrRocks`
- Example: `curl -u solr:SolrRocks "https://solr.peviitor.ro/solr/job/update/json?commit=true"`

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
| brand | string | No | Commercial brand name (e.g. "ORANGE", "EPAM") |
| group | string | No | Parent company group (e.g. "Orange Group") |
| status | string | No | "activ", "suspendat", "inactiv", "radiat" |
| location | string[] | No | Romanian cities, DIACRITICS ACCEPTED |
| website | string[] | No | Official website URL(s) |
| career | string[] | No | Career page URL(s) |
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
   - Try by brand: `curl -u solr:SolrRocks "https://solr.peviitor.ro/solr/company/select?q=brand:COMPANY_NAME"`
   - Try by company name: `curl -u solr:SolrRocks "https://solr.peviitor.ro/solr/company/select?q=company:COMPANY_NAME"`
   - Try by CUI if provided
3. If not found in Solr:
   - Run /add-website with the company name
   - Re-query Solr to get updated data
4. Get company data from Solr response:
   - id (CUI)
   - company (full legal name)
   - brand
   - group
   - website[] - **IMPORTANT**: When multiple websites exist, use .ro domains FIRST
   - career[] - **IMPORTANT**: When multiple careers pages exist, use .ro domains FIRST
   - If company has both ziramarketing.com and ziramarketing.ro, use ONLY ziramarketing.ro
5. Push company to Solr company core FIRST (before jobs):
   - Use curl to POST to https://solr.peviitor.ro/solr/company/update/json?commit=true
   - Credentials: solr:SolrRocks
   - Format: JSON with id, company, brand, group, status="activ", website[], career[]
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
       - Credentials: solr:SolrRocks
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
       - Credentials: solr:SolrRocks
       - Format: JSON array of job documents
11. Verify insertion:
    - Query Solr for inserted company by id
    - Query Solr for inserted jobs by url
    - Confirm counts

Example Flow:
1. User runs: /scrape EPAM
2. AI queries Solr: https://solr.peviitor.ro/solr/company/select?q=brand:EPAM
3. Found! career: https://www.epam.com/careers/locations/romania
4. AI pushes company to Solr company core (atomic upsert):
   [{
     "id": "33159615",
     "company": "EPAM SYSTEMS INTERNATIONAL SRL",
     "brand": "EPAM",
     "group": "EPAM Systems",
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

CRITICAL - AUTOMATIC PAGINATION:
- The model MUST NOT stop until ALL jobs are collected from ALL pages
- After extracting jobs from the current page, look for pagination controls (Next button, page numbers)
- If more pages exist, click Next or navigate to the next page and continue extracting jobs
- Repeat until there are no more pages (Next button is disabled or page numbers end)
- Keep track of total jobs found and ensure all are pushed to Solr
- DO NOT stop after the first page or after a fixed number of jobs
