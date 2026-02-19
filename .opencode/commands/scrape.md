---
description: Scrape jobs from a company career page and push to Solr
agent: build
---

# SOLR AUTHENTICATION REMINDER
**ALWAYS use credentials when pushing to Solr:**
- Username: `solr`
- Password: `SolrRocks`
- Example: `curl -u solr:SolrRocks "http://localhost:8983/solr/job/update/json?commit=true"`

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
4. **IF NOT found**: Continue with steps below

### Step 2: Check websites.md
5. Check if company exists in webscraper/websites.md
   - Search by brand name OR full company name
   - Search by CUI if provided
6. If NOT found, automatically run /add-website with the company name
7. Once company is in websites.md, get the Careers Page URL
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
- `webscraper/endava.md` - Example of SmartRecruiters scraping

Usage:
- Scrape company: /scrape EPAM
- Scrape by full name: /scrape "EPAM SYSTEMS INTERNATIONAL SRL"

Arguments:
- Company brand name or full company name (e.g., "EPAM", "Endava", "ENDAVA ROMANIA SRL")

Job Model Schema (from SCHEMAS.md):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | Yes | Full URL to job detail page |
| title | string | Yes | Position title (max 200 chars, no HTML, diacritics OK) |
| company | string | No | Legal company name (diacritics REQUIRED) |
| cif | string | No | CUI/CIF from websites.md |
| location | string[] | No | Romanian cities (diacritics OK), multi-valued |
| tags | string[] | No | Skills, education, experience (lowercase, no diacritics) |
| workmode | string | No | "remote", "on-site", "hybrid" |
| date | date | No | ISO8601 scrape date (e.g., "2026-01-18T10:00:00Z") |
| status | string | No | "scraped" (default) - will be updated to "tested" during validation |
| expirationdate | date | No | Try to extract from job page, otherwise leave empty (set during validation) |
| salary | string | No | "MIN-MAX CURRENCY" (e.g., "5000-8000 RON") |

Workflow:
1. Parse company name from /scrape arguments
2. Search websites.md for company:
   - Match against "Company" column (full name)
   - Match against brand name (if known)
   - Match against CUI
3. If not found:
   - Run /add-website with the company name
   - Re-read websites.md to get updated data
4. Get Careers Page URL from websites.md
5. Navigate to career page using Chrome DevTools MCP
6. Find jobs that can be worked from Romania:
   - Look for "Romania" location filters
   - Filter out jobs requiring other countries only
   - Include: "Romania", "București", "Cluj-Napoca", "remote Romania", etc.
7. Extract each job:
     - url: full URL to job detail
     - title: job title
     - company: from websites.md (full legal name)
     - cif: from websites.md (CUI column)
     - location: Romanian cities only
     - tags: skills, education, experience (lowercase, no diacritics)
     - workmode: "remote", "on-site", or "hybrid"
     - date: current date in ISO8601
     - status: "scraped"
     - salary: if available
     - expirationdate: try to extract from job page (look for "apply by", "expires", "valid until", etc.)
8. Push to Solr:
   - Use curl command to POST to http://localhost:8983/solr/job/update
   - Credentials: solr:SolrRocks
   - Format: JSON array of job documents
9. Verify insertion:
   - Query Solr for inserted jobs by url
   - Confirm count matches

Example Flow:
1. User runs: /scrape EPAM
2. AI checks websites.md for "EPAM" or "EPAM SYSTEMS INTERNATIONAL SRL"
3. Found! Careers: https://www.epam.com/careers/locations/romania
4. AI navigates to career page
5. AI filters for Romania jobs only
6. AI extracts job data:
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
7. AI pushes to Solr
8. AI verifies documents exist

Note:
- ALWAYS use Chrome DevTools MCP for scraping (requires Chrome with remote debugging)
- Run start-chrome.ps1 first if Chrome is not running with debug port
- ONLY scrape jobs that can be worked from Romania - exclude jobs in other countries
- Use CUI from websites.md for the "cif" field
- Use full legal company name from websites.md for "company" field
- After scraping, update "Last Scraped" column in websites.md with today's date
- Try to extract expirationdate from job page (look for "apply by", "expires", "valid until", "deadline" text). If found, parse the date and convert to ISO8601. If not found, leave empty.

CRITICAL - AUTOMATIC PAGINATION:
- The model MUST NOT stop until ALL jobs are collected from ALL pages
- After extracting jobs from the current page, look for pagination controls (Next button, page numbers)
- If more pages exist, click Next or navigate to the next page and continue extracting jobs
- Repeat until there are no more pages (Next button is disabled or page numbers end)
- Keep track of total jobs found and ensure all are pushed to Solr
- DO NOT stop after the first page or after a fixed number of jobs
