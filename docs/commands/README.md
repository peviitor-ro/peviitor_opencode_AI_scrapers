# Commands

Available OpenCode commands for job scraping automation.

## Table of Contents

- [/scrape](#scrape) - Run scraper for a company
- [/update-solr](#update-solr) - Update Solr with new data
- [/delete-solr](#delete-solr) - Delete job documents from Solr
- [/add-website](#add-website) - Add a company to websites.md
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
2. Check if company exists in `webscraper/websites.md`
   - Search by brand name OR full company name
   - Search by CUI
3. If NOT found, automatically run `/add-website` first
4. Get Careers Page URL from websites.md
5. Navigate to career page (using Chrome DevTools MCP)
6. Filter for Romanian jobs only
7. Extract job data according to Job Model Schema
8. Push documents to Solr
9. Verify documents were inserted
10. Update "Last Scraped" column in websites.md

### Job Model Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | Yes | Full URL to job detail page |
| title | string | Yes | Position title (max 200 chars) |
| company | string | No | Legal company name (diacritics REQUIRED) |
| cif | string | No | CUI/CIF from websites.md |
| location | string[] | No | Romanian cities, multi-valued |
| tags | string[] | No | Skills, education, experience |
| workmode | string | No | "remote", "on-site", "hybrid" |
| date | date | No | ISO8601 scrape date |
| status | string | No | "scraped" (default) |
| expirationdate | date | No | vdate + 30 days |
| salary | string | No | "MIN-MAX CURRENCY" |

### Important

- ONLY scrape jobs that can be worked from Romania
- Use CUI from websites.md for "cif" field
- Use full legal company name from websites.md for "company" field
- Run start-chrome.ps1 first if Chrome is not running

### Example Flow

```
User: /scrape EPAM
AI: Checking websites.md for EPAM...
AI: Found! Careers: https://www.epam.com/careers/locations/romania
AI: Navigating to career page, filtering Romania jobs...
AI: Extracted 5 jobs, pushing to Solr...
AI: Verified 5 jobs in Solr
AI: Updated Last Scraped in websites.md
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
  'http://localhost:8983/solr/job/update?commit=true' \
  -d '[{"url":"https://example.com/job","title":"Software Engineer","company":"Test Company"}]'
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
  'http://localhost:8983/solr/job/update?commit=true' \
  -d '{"delete":{"query":"url:\"https://example.com/job\""}}'
```

---

## /add-website

Add a new company to `webscraper/websites.md` with automatic research.

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
6. Save only after user confirmation

### Data Collected

| Field | Description |
|-------|-------------|
| Full Company Name | Legal name from targetare.ro (e.g., "EPAM SYSTEMS INTERNATIONAL SRL") |
| Brand | Company brand name (e.g., "EPAM") |
| Website | Official company website |
| Careers Page | Company jobs/careers page |
| CUI/CIF | Romanian fiscal code (from targetare.ro) |

### Example Flow

```
User: /add-website EPAM
AI: Searching targetare.ro for EPAM...
AI: Found: EPAM SYSTEMS INTERNATIONAL SRL, CUI: 18942350
AI: Found website: https://epam.com
AI: Found careers: https://careers.epam.com

Is this data correct?
- Full Name: EPAM SYSTEMS INTERNATIONAL SRL
- Brand: EPAM
- Website: https://epam.com
- Careers: https://careers.epam.com
- CUI: 18942350

User: Yes, save it
AI: Adding to websites.md... Done!
```

### Prerequisites

- Chrome must be running with remote debugging (port 9222)
- Run `start-chrome.ps1` first if Chrome is not running

### Important Notes

- Uses Chrome DevTools MCP for web browsing (bypasses anti-bot protections)
- Always verifies data with user before saving
- Does NOT overwrite existing entries
- Last Scraped column left empty for new entries

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
http://localhost:8983/solr/
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
- Company careers pages: `webscraper/websites.md`
