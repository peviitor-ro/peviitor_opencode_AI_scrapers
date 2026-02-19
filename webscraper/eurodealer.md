# EURODEALER PARTS Scraper Prompt

## Company Info
- **Name**: EURODEALER
- **Legal Name**: EURODEALER PARTS SRL
- **CUI**: 18222212
- **Website**: https://edparts.ro
- **Careers Page**: https://edparts.ro/cariere/

## Jobs URL
```
https://edparts.ro/cariere/
```

## Total Jobs
- **6 jobs** (as of Feb 2026)
- All located in Bucharest
- Work mode: on-site (workshop)

## Platform
- Simple HTML page with job list
- Jobs are listed as text on the page (not links)
- Application via form on the same page

## Job Positions (Feb 2026)
1. Mecanic auto - automotive
2. Electrician service auto - automotive
3. Receptie service - customer-service
4. Identificator piese auto - automotive
5. Reprezentant vanzari - sales
6. Gestionar piese - operations

## Scraping Steps

1. **Navigate to Eurodealer careers page**:
   `https://edparts.ro/cariere/`

2. **Look for "POSTURI DISPONIBILE" section**:
   All jobs are listed as text headings on the page

3. **Extract job titles**:
   - Mecanic auto
   - Electrician service auto
   - Receptie service
   - Identificator piese auto
   - Reprezentant vanzari
   - Gestionar piese

4. **Job Details**:
   - All jobs are in Bucharest (on Preciziei Street no. 11, district 6)
   - Work mode: on-site (workshop)
   - No individual job URLs - use page URL + anchor

5. **Push to Solr** after each job or in batches

## Solr Schema
Push to Solr at `http://localhost:8983/solr/job/update` with credentials `solr:SolrRocks`:
```json
{
  "add": {
    "doc": {
      "url": "https://edparts.ro/cariere/#{JOB_ANCHOR}",
      "title": "{TITLE}",
      "company": "EURODEALER PARTS SRL",
      "cif": "18222212",
      "location": ["București"],
      "workmode": "on-site",
      "date": "{ISO8601_DATE}",
      "status": "scraped",
      "tags": ["{SENIORITY_TAG}", "{FIELD_TAG}"]
    }
  }
}
```

## TAG EXTRACTION (IMPORTANT)

The `tags` field is an array of lowercase strings (NO DIACRITICS).

### 1. Seniority Level
All these positions appear to be mid-level (no specific seniority mentioned). Default to "mid".

### 2. Field Targeting

| Position | Field Tag | Notes |
|----------|----------|-------|
| Mecanic auto | "automotive" | Auto mechanic |
| Electrician service auto | "automotive" | Auto electrician |
| Receptie service | "customer-service" | Service reception |
| Identificator piese auto | "automotive" | Parts identifier |
| Reprezentant vanzari | "sales" | Sales representative |
| Gestionar piese | "operations" | Parts warehouse |

### Example Tags

**Job**: "Mecanic auto"
- Tags: `["mid", "automotive"]`

**Job**: "Reprezentant vanzari"
- Tags: `["mid", "sales"]`

**Job**: "Receptie service"
- Tags: `["mid", "customer-service"]`

## Important Notes
- **Follow Job Model exactly** - See SCHEMAS.md for required fields. DO NOT include "description" field - it doesn't exist in the Job model!
- Work mode is always "on-site" (it's a workshop)
- Location is always Bucharest (București)
- No individual job URLs - use page URL with anchor (#mecanic-auto, etc.)
- Company name must be exactly: "EURODEALER PARTS SRL"
- Commit to Solr after each job or in batches
- Verify count in Solr matches expected ~6 jobs
