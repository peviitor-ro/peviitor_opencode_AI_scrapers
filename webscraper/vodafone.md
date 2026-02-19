# Vodafone Scraper Prompt

## Company Info
- **Name**: VODAFONE
- **Legal Name**: VODAFONE ROMANIA SA
- **CUI**: 8971726
- **Website**: https://www.vodafone.ro
- **Careers Page**: https://careers.vodafone.com/romania/

## Romania Jobs URL
```
https://jobs.vodafone.com/careers?domain=vodafone.com&query=&location=Romania
```

## Platform
Vodafone uses **Eightfold.ai** platform for their careers portal.

## API Endpoint
The job data is loaded via API:
```
https://jobs.vodafone.com/api/pcsx/search?domain=vodafone.com&query=&location=Romania&start=0
```

Parameters:
- `start`: Pagination offset (0, 10, 20, ...)
- `count`: Number of results per page (default 10, max ~25)

## Total Jobs
- **158 Romania jobs** (as of Feb 2026)
- ~10 jobs per page

## Job Data from API

| Field | API Field | Example |
|-------|-----------|---------|
| url | `positionUrl` | `/careers/job/563018695146629` → `https://jobs.vodafone.com/careers/job/563018695146629` |
| title | `name` | "Sales Advisor - Brasov" |
| company | Fixed | "VODAFONE ROMANIA SA" |
| cif | Fixed | "8971726" |
| location | `locations[0]` | "Brasov, Brasov, Romania" |
| workmode | `workLocationOption` | "onsite", "hybrid", "remote_local" |
| department | `department` | "CBU - Sales - Brasov" |
| date | `postedTs` | Unix timestamp → ISO8601 |

## Work Mode Mapping
From API `workLocationOption` field:
- "onsite" → workmode: "on-site"
- "hybrid" → workmode: "hybrid"  
- "remote_local" → workmode: "remote"

## Location Normalization
From `standardizedLocations` array:
- "Brașov, BV, RO" → ["Brasov"]
- "Bucharest, Bucharest, RO" → ["Bucuresti"]
- "Cluj-Napoca, CJ, RO" → ["Cluj-Napoca"]
- "Iași, IS, RO" → ["Iasi"]

Note: Remove diacritics for Solr (use "Bucuresti" not "București")

## Scraping Steps

1. **Navigate to Vodafone careers with Romania filter**:
   `https://jobs.vodafone.com/careers?domain=vodafone.com&query=&location=Romania`

2. **Get job count**: The API returns `count: 158`

3. **Fetch all jobs via API**:
   - Request: `https://jobs.vodafone.com/api/pcsx/search?domain=vodafone.com&query=&location=Romania&start=0`
   - Loop through pagination: start=0, 10, 20, ... until all jobs retrieved
   
4. **For each job, extract**:
   ```json
   {
     "url": "https://jobs.vodafone.com/careers/job/" + position_id,
     "title": name,
     "company": "VODAFONE ROMANIA SA",
     "cif": "8971726",
     "location": [normalized_city],
     "workmode": mapped_workmode,
     "date": ISO8601(postedTs),
     "status": "scraped"
   }
   ```

5. **Push to Solr** in batches of 10-25 jobs

6. **Update websites.md**: Set "Last Scraped" to today's date (format: YYYY-MM-DD)

## Tags Extraction

Tags are generated based on job title and department. Use these rules:

### Seniority Tags
| Keyword in Title | Tag Value |
|-----------------|-----------|
| "Junior", "Entry", "Trainee" | junior |
| "Senior" | senior |
| "Lead" | lead |
| "Manager", "Head" | manager |

### Field Tags
| Keyword | Tag Value |
|---------|-----------|
| developer, engineer, python, java, software | it |
| data, analytics, scientist | data-science |
| security | security |
| devops, automation | devops |
| cloud | cloud |
| network, ran, packet | networking |
| project, programme | project-management |
| sales, account manager | sales |
| test, qa | qa |
| finance, accounting, ledger | finance |
| hr, talent, recruitment | hr |
| support, service desk | support |
| iot | iot |
| ai, machine learning | ai |

## Solr Format

Push to Solr using curl:
```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  "http://localhost:8983/solr/job/update?commit=true" \
  -d '[{"url":"{JOB_URL}","title":"{TITLE}","company":"VODAFONE ROMANIA SA","cif":"8971726","location":["{LOCATION}"],"workmode":"{workmode}","date":"{ISO8601_DATE}","status":"scraped"}]'
```

Example:
```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  "http://localhost:8983/solr/job/update?commit=true" \
  -d '[{"url":"https://jobs.vodafone.com/careers/job/563018695146629","title":"Sales Advisor - Brasov","company":"VODAFONE ROMANIA SA","cif":"8971726","location":["Brasov"],"workmode":"on-site","date":"2026-02-17T10:00:00Z","status":"scraped"}]'
```

## Important Notes

- All jobs from this URL are Romania jobs - no need to filter further
- Work mode values must be exactly: "remote", "on-site", or "hybrid"
- Location must be Romanian cities only - remove diacritics (Bucuresti not București)
- Tags extraction is optional for Vodafone (not included in API response)
- Commit to Solr after each batch (10 jobs) or at the end
- Verify with: `curl -s -u solr:SolrRocks "http://localhost:8983/solr/job/select?q=company:%22VODAFONE%20ROMANIA%20SA%22&rows=1"`

## Pagination Note

The API returns jobs in batches of ~10. To get all 158 jobs:
- Page 1: start=0
- Page 2: start=10
- Page 3: start=20
- ...
- Continue until you get fewer than 10 jobs or reach count=158
