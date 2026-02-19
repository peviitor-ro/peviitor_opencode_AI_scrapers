# Endava Scraper Prompt

## Company Info
- **Name**: Endava
- **Legal Name**: ENDAVA ROMANIA SRL
- **CUI**: 9533457
- **Website**: https://www.endava.com
- **Careers Page**: https://www.endava.com/careers/jobs

## Job Source
Endava uses **SmartRecruiters ATS** for their job listings.

## Romania Jobs URL
```
https://www.endava.com/careers/jobs?location=Bra%C8%99ov%2C+Romania&location=Bucharest%2C+Romania&location=Cluj-Napoca%2C+Romania&location=Craiova%2C+Romania&location=Ia%C8%99i%2C+Romania&location=Pite%C5%9Fti%2C+Romania&location=Pite%C8%99ti%2C+Romania&location=Sibiu%2C+Romania&location=Suceava%2C+Romania&location=T%C3%A2rgu+Mure%C5%9F%2C+Romania&location=T%C3%A2rgu+Mure%C8%99%2C+Romania&location=Timi%C8%99oara%2C+Romania
```

## Filtering for Romania (UI Method)
Endava has offices in 12 Romanian cities:
- Brașov
- Bucharest
- Cluj-Napoca
- Craiova
- Iași
- Pitești
- Sibiu
- Suceava
- Târgu Mureș
- Timișoara

**Recommended approach**:
1. Navigate to `https://www.endava.com/careers/jobs`
2. Click "All locations" dropdown button
3. Find and click the **Romania checkbox** (it selects all Romanian cities at once)
4. The filter will show "Brașov, + 11 Locations" when all are selected
5. Look for "X results found" to confirm - should be **161 results**

**Alternative URL approach**:
Append all 12 location parameters to filter directly:
```
https://www.endava.com/careers/jobs?location=Bra%C8%99ov%2C+Romania&location=Bucharest%2C+Romania&location=Cluj-Napoca%2C+Romania&location=Craiova%2C+Romania&location=Ia%C8%99i%2C+Romania&location=Pite%C5%9Fti%2C+Romania&location=Pite%C8%99ti%2C+Romania&location=Sibiu%2C+Romania&location=Suceava%2C+Romania&location=T%C3%A2rgu+Mure%C5%9F%2C+Romania&location=T%C3%A2rgu+Mure%C8%99%2C+Romania&location=Timi%C8%99oara%2C+Romania
```

## Pagination
- Use `?page=N` query parameter (e.g., `?page=2`, `?page=3`)
- There's also a "Next" button that can be clicked
- Total Romania jobs: **161** (9 per page, ~18 pages)
- Each page has 9 job listings

## Job URL Format
```
https://jobs.smartrecruiters.com/Endava/{JOB_ID}-{JOB_SLUG}
```

Example: `https://jobs.smartrecruiters.com/Endava/744000107250166`

## Job Data Extraction

From the job detail page, extract:
- **title**: Job title (h1 heading)
- **location**: Array of Romanian cities (e.g., ["Bucharest"], ["Cluj-Napoca"])
- **workmode**: "hybrid", "remote", or "on-site" (check for text like "Employees work in a hybrid mode")
- **description**: Job description text (combine Job Description, Qualifications, Company Description sections)
- **url**: Full URL to the job (this is the unique identifier)
- **company**: "ENDAVA ROMANIA SRL" (with DIACRITICS)
- **cif**: "9533457"
- **date**: Current date in ISO8601 format (e.g., "2026-02-17T10:00:00Z")
- **status**: "scraped"

## Scraping Steps

1. **Navigate to filtered URL** with all 12 Romania locations
2. **Check total results**: Look for "X results found" text
3. **For each page**:
   a. Extract all 9 job links from the page
   b. For each job link, navigate to the detail page
   c. Extract job data (title, location, work_mode, description)
   d. Push to Solr with company="ENDAVA ROMANIA SRL" and CUI="9533457"
   e. Navigate back to the jobs list
4. **Click Next** or change page parameter to go to next page
5. **Repeat** until all pages are exhausted (no more "Next" button or reached last page)
6. **Update websites.md**: Set "Last Scraped" to today's date

## Solr Schema
Push to Solr at `http://localhost:8983/solr/job/update` with credentials `solr:SolrRocks`:
```json
{
  "add": {
    "doc": {
      "url": "{JOB_URL}",
      "title": "{TITLE}",
      "company": "ENDAVA ROMANIA SRL",
      "cif": "9533457",
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

**Job**: "Senior Java Developer"
- From title: "Senior" → "senior"
- Skills: "Java" → "it"
- Tags: `["senior", "it"]`

**Job**: "Graduate Data Analyst"
- From title: "Graduate" → "graduate"
- Skills: "Data Analytics" → "data-science"
- Tags: `["graduate", "data-science"]`

### Tags Field Rules (per SCHEMAS.md)
- **lowercase only** - NO UPPERCASE
- **no diacritics** - use "it" not "IT"
- **max 20 entries** - don't exceed
- **array format** - ["tag1", "tag2"]
- **standardized values only** - use consistent naming

## Important Notes
- **Follow Job Model exactly** - See SCHEMAS.md for required fields. DO NOT include "description" field - it doesn't exist in the Job model!
- Always filter for Romania only - there are many non-Romania jobs on the same site
- Use Chrome DevTools MCP for navigation
- Some jobs may have similar titles but different locations (each is a separate job)
- Work mode text examples: "Employees work in a hybrid mode", "2 days/week in office"
- workmode values must be exactly: "remote", "on-site", or "hybrid"
- location must be an array: ["Bucharest"], ["Cluj-Napoca", "Timișoara"]
- Commit to Solr after each job or in batches
- Verify count in Solr matches expected ~166 jobs
