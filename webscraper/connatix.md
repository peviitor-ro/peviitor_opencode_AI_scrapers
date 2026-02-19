# Connatix Scraping Prompt

## Company Information

- **Brand**: CONNATIX (now JWX - merged with JW Player)
- **Full Company Name**: CONNATIX NATIVE EXCHANGE ROMANIA SRL
- **CUI**: 35861771
- **Website**: https://connatix.com
- **Careers Page**: https://careers.smartrecruiters.com/ConnatixNativeExchange
- **Office Location**: Ploiesti 36-38, Cluj-Napoca, Romania

## Important Note

**NO JOB POSTINGS AVAILABLE** - As of 2026-02-18, the SmartRecruiters page shows "No job postings are currently available."

The company appears to have paused hiring or uses a different recruitment method.

## Scraping Instructions

### If Jobs Are Available:

1. Navigate to: https://careers.smartrecruiters.com/ConnatixNativeExchange
2. Look for job listings in the main content area
3. Filter by Location: Romania or Cluj-Napoca if possible
4. Click on each job to get details:
   - Job title
   - Job URL (full URL)
   - Location
   - Work mode (remote/hybrid/on-site)
   - Description (for tags extraction)

### Job Data Extraction:

For each job found, extract:
- `url`: Full URL to job detail page
- `title`: Job title (exact as shown)
- `company`: "CONNATIX NATIVE EXCHANGE ROMANIA SRL"
- `cif`: "35861771"
- `location`: Array of Romanian cities (e.g., ["Cluj-Napoca"])
- `workmode`: "remote", "on-site", or "hybrid" (from job listing)
- `tags`: Extract from job title and description:
  - Seniority: intern, trainee, entry-level, graduate, junior, mid, senior, consultant
  - Field: it, data-science, ai, cloud, devops, qa, finance, hr, sales, etc.
- `date`: Current ISO8601 date (e.g., "2026-02-18T00:00:00Z")
- `status`: "scraped"

### Solr Schema Format:

```json
{
  "url": "https://jobs.smartrecruiters.com/...",
  "title": "Software Engineer",
  "company": "CONNATIX NATIVE EXCHANGE ROMANIA SRL",
  "cif": "35861771",
  "location": ["Cluj-Napoca"],
  "workmode": "hybrid",
  "tags": ["senior", "it"],
  "date": "2026-02-18T00:00:00Z",
  "status": "scraped"
}
```

### Alternative Careers Sources:

If SmartRecruiters has no jobs, check:
1. https://connatix.com/careers (main website)
2. https://jwx.com/careers (new brand website)
3. LinkedIn company page: https://www.linkedin.com/company/jwp-connatix/
4. BuiltIn: https://builtin.com/company/connatix/jobs

### Important Rules:

- ONLY scrape jobs that can be worked from Romania
- Exclude jobs that require only other countries
- Use CUI 35861771 for the cif field
- Use exact company name: "CONNATIX NATIVE EXCHANGE ROMANIA SRL"
- Tags must be lowercase, no diacritics
- Diacritics are OK for location (e.g., "Cluj-Napoca")
