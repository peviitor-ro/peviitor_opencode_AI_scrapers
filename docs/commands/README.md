# Commands

Available OpenCode commands for job scraping automation.

## Table of Contents

- [/scrape](#scrape) - Run scraper for a company
- [/update-solr](#update-solr) - Update Solr with new data
- [/delete-solr](#delete-solr) - Delete job documents from Solr
- [/add-website](#add-website) - Add a company to Solr company core
- [/login-solr](#login-solr) - Login to Solr admin panel
- [/docs-update](#docs-update) - Update project documentation
- [/instructions](#instructions) - Follow workflow for adding/changing commands

---

## /scrape

Scrape jobs from a company's career page and push to Solr.

### Usage

```
/scrape EPAM
/scrape ENDAVA ROMANIA SRL
```

### Steps

1. Parse company name from arguments
2. Query Solr company core to find company:
   - Search by brand: `https://solr.peviitor.ro/solr/company/select?q=brand:EPAM`
   - Search by company name
   - Search by CUI (id)
3. If NOT found, automatically run `/add-website` first
4. Get career URL from Solr company.career field
5. Navigate to career page (using Chrome DevTools MCP)
6. Filter for Romanian jobs only
7. Extract job data according to Job Model Schema
8. Push company to Solr company core first (if not exists)
9. Push jobs to Solr job core
10. Verify documents were inserted
11. Update "lastScraped" field in Solr company core

### Company Model Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | CIF/CUI (8 digits) |
| company | string | Yes | Legal company name (diacritics REQUIRED) |
| brand | string | No | Commercial brand name |
| group | string | No | Parent company group |
| status | string | No | "activ", "suspendat", "inactiv", "radiat" |
| location | string[] | No | Romanian cities |
| website | string[] | No | Official website URL(s) |
| career | string[] | No | Career page URL(s) |
| lastScraped | string | No | Date of last scrape |
| scraperFile | string | No | Name of scraper file |

### Job Model Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | Yes | Full URL to job detail page |
| title | string | Yes | Position title (max 200 chars) |
| company | string | No | Legal company name (diacritics REQUIRED) |
| cif | string | No | CUI/CIF from company.id |
| location | string[] | No | Romanian cities, multi-valued |
| tags | string[] | No | Skills, education, experience |
| workmode | string | No | "remote", "on-site", "hybrid" |
| date | date | No | ISO8601 scrape date |
| status | string | No | "scraped" (default) |
| expirationdate | date | No | vdate + 30 days |
| salary | string | No | "MIN-MAX CURRENCY" |

### Important

- ONLY scrape jobs that can be worked from Romania
- Use CUI from Solr company.id for "cif" field
- Use full legal company name from Solr company.company for "company" field
- Run start-chrome.ps1 first if Chrome is not running
- ALWAYS push company to Solr company core BEFORE pushing jobs

### Example Flow

```
User: /scrape EPAM
AI: Querying Solr company core for EPAM...
AI: Found! career: https://www.epam.com/careers/locations/romania
AI: Pushing company to Solr company core...
AI: Navigating to career page, filtering Romania jobs...
AI: Extracted 5 jobs, pushing to Solr job core...
AI: Verified 5 jobs in Solr
AI: Updated lastScraped in Solr company core
Done!
```

---

## /update-solr

Update Solr index with new job or company data.

### Usage

```
/update-solr
```

### Steps

1. Verify Solr is running
2. Add/update documents in job or company core
3. Verify the update was successful

### Example API Call

```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  'https://solr.peviitor.ro/solr/company/update/json?commit=true' \
  -d '[{"id":"33159615","company":"EPAM SYSTEMS INTERNATIONAL SRL","brand":"EPAM","status":"activ"}]'
```

---

## /delete-solr

Delete job documents from Solr by key.

### Usage

```
/delete-solr url:https://example.com/job
/delete-solr company:Company Name
/delete-solr title:Job Title
```

### Important

- Always use delete-by-query format: `{"delete":{"query":"url:\"https://example.com/job\""}}`
- Do NOT use `_delete_:true` format - it doesn't work properly
- Exact match is required

### Example

```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  'https://solr.peviitor.ro/solr/job/update/json?commit=true' \
  -d '{"delete":{"query":"url:\"https://example.com/job\""}}'
```

---

## /add-website

Add a new company to Solr company core with automatic research.

### Usage

```
/add-website EPAM
```

### New Workflow

1. Accept company brand name (e.g., "EPAM")
2. Search targetare.ro for company details:
   - Full legal company name in Romania
   - CUI/CIF (fiscal code)
   - Registration number
3. Search for company's official website
4. Find company's careers/jobs page
5. Present data to user for verification
6. Save to Solr company core after user confirmation

### Data Collected

| Field | Description |
|-------|-------------|
| id | CUI/CIF from targetare.ro |
| company | Legal name from targetare.ro |
| brand | Company brand name |
| website | Official company website |
| career | Company jobs/careers page |
| status | Default: "activ" |

### Example Flow

```
User: /add-website EPAM
AI: Searching targetare.ro for EPAM...
AI: Found: EPAM SYSTEMS INTERNATIONAL SRL, CUI: 33159615
AI: Found website: https://www.epam.com
AI: Found careers: https://www.epam.com/careers/locations/romania

Is this data correct?
- Full Name: EPAM SYSTEMS INTERNATIONAL SRL
- Brand: EPAM
- Website: https://www.epam.com
- Careers: https://www.epam.com/careers/locations/romania
- CUI: 33159615

User: Yes, save it
AI: Adding to Solr company core... Done!
```

### Solr Command

```bash
curl -u solr:SolrRocks -X POST "https://solr.peviitor.ro/solr/company/update/json?commit=true" \
  -H "Content-Type: application/json" \
  -d '[{
    "id": "33159615",
    "company": "EPAM SYSTEMS INTERNATIONAL SRL",
    "brand": "EPAM",
    "group": "EPAM Systems",
    "status": "activ",
    "website": ["https://www.epam.com"],
    "career": ["https://www.epam.com/careers/locations/romania"]
  }]'
```

### Prerequisites

- Chrome must be running with remote debugging (port 9222)
- Run `start-chrome.ps1` first if Chrome is not running

### Important Notes

- Uses Chrome DevTools MCP for web browsing (bypasses anti-bot protections)
- Always verifies data with user before saving
- Does NOT overwrite existing entries
- lastScraped field left empty for new entries

---

## /login-solr

Open Solr admin panel in Chrome and login.

### Usage

```
/login-solr
```

### Credentials

- Username: `solr`
- Password: `SolrRocks`

### URL

```
https://solr.peviitor.ro/solr/
```

---

## /docs-update

Review project files and update documentation.

### Usage

```
/docs-update
```

### Steps

1. Review all project files (PowerShell scripts, tests, commands)
2. Understand what each file does
3. Update/extend documentation in `docs/` folder
4. Create new command documentation if needed

### When to Use

- After adding new scripts or commands
- When existing docs need updating
- When new features are implemented

---

## /instructions

Follow the workflow defined in INSTRUCTIONS.md when adding/changing commands.

### Usage

This is a meta-command that defines the workflow for adding or changing other commands.

### Workflow Steps

1. **Write a test first** - Create test files in `tests/` directory
2. **Run the test** to learn how things work and verify it fails initially
3. **Update the command/scraper** based on what you learn from the test
4. **Update documentation** in `docs/` folder if it exists
5. **Review entire code** and suggest optimizations

### Important Notes

- Always reference SCHEMAS.md for data model definitions
- Always use correct Solr delete-by-query format: `{"delete":{"query":"url:\"https://example.com/job\""}}`
- Do NOT use `_delete_:true` format - it doesn't work properly
- Test with Playwright before finalizing any command
- Follow conventions in AGENTS.md for code style and project structure

### Project Context

- Tests: `tests/` directory
- Documentation: `docs/` directory
- Commands: `.opencode/commands/` directory
- Company data: Solr company core (https://solr.peviitor.ro/solr/company/select)
