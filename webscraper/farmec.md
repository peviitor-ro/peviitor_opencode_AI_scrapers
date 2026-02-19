# FARMEC Scraper Prompt

## Company Info
- **Name**: FARMEC
- **Legal Name**: FARMEC SA
- **CUI**: 199150
- **Website**: https://www.farmec.ro
- **Careers Page**: https://www.farmec.ro/compania/cariere/

## Jobs URL
```
https://www.farmec.ro/compania/cariere/
```

## Platform
- Custom website (not an ATS/HRMS platform)
- Jobs are displayed as links on the careers page

## Total Jobs
- **5 jobs** (as of Feb 2026)
- Locations: Cluj-Napoca, Harghita, București

## Work Mode Detection
From job details:
- All jobs show "program de muncă" (work schedule) → workmode: "on-site"
- No remote or hybrid jobs available

## Location Detection
- "Cluj-Napoca" → location: ["Cluj-Napoca"]
- "Cluj" → location: ["Cluj-Napoca"]
- "Harghita" → location: ["Harghita"]
- "Brașov" → location: ["Brașov"]
- "București" → location: ["București"]
- "Bucuresti" → location: ["București"]

## Job URL Format
```
https://www.farmec.ro/compania/joburi/{JOB_SLUG}
```

Example:
- `https://www.farmec.ro/compania/joburi/reglor-utilaje-cluj-2-3-2-2-2-2-2-2/`
- `https://www.farmec.ro/compania/joburi/beauty-adviser-cluj-2-3-2-2-2-2-2-2/`
- `https://www.farmec.ro/compania/joburi/agent-vanzari-harghita/`
- `https://www.farmec.ro/compania/joburi/responsabil-achizitii-cluj-2-3-2-2-2-2-2-2-3/`
- `https://www.farmec.ro/compania/joburi/manipulant-marfuri-bucuresti/`

## Scraping Steps

1. **Navigate to FARMEC careers page**:
   `https://www.farmec.ro/compania/cariere/`

2. **Accept cookies** (if shown):
   Click "ACCEPTĂ TOATE" or "Accept All"

3. **Find job listings**:
   - Look for "Joburi disponibile" (Available Jobs) section
   - Each job is a clickable link

4. **Extract job list from main page**:
   - job title from link text
   - job URL from href

5. **Click on each job** to get full details:
   - Location from "Locații şi detalii" section
   - Work schedule from "Programul de muncă"
   - Number of positions from "Număr posturi vacante"

6. **Extract job data**:
   - title: From heading
   - location: From location field
   - workmode: "on-site" (default, no remote options)

7. **Push to Solr** after each job or in batches

## Solr Schema
Push to Solr at `http://localhost:8983/solr/job/update` with credentials `solr:SolrRocks`:
```json
{
  "add": {
    "doc": {
      "url": "{JOB_URL}",
      "title": "{TITLE}",
      "company": "FARMEC SA",
      "cif": "199150",
      "location": ["{CITY}"],
      "workmode": "on-site",
      "date": "{ISO8601_DATE}",
      "status": "scraped"
    }
  }
}
```

## TAG EXTRACTION (IMPORTANT)

The `tags` field is an array of lowercase strings (NO DIACRITICS). Extract these from the job detail page:

### 1. Seniority Level (experience)
Extract from job requirements and title:

| Keyword in Requirements/Title | Description | Tag Value |
|---------------------------|-------------|-----------|
| "minim 2 ani" / "2+ years" / "minimum 2 years" | Senior level | "senior" |
| "minim 1 an" / "1+ years" | Mid level | "mid" |
| "studii medii" | Entry level | "entry-level" |
| "studii superioare" | University degree | "mid" |
| "fără experiență" / "no experience" | Entry level | "entry-level" |
| Default (no experience mentioned) | Entry level | "entry-level" |

### 2. Department/Field Targeting
Extract from job title and responsibilities:

| Department/Field Found | Field Tag | Notes |
|----------------------|-----------|-------|
| Producție, mașini-unelte, utilaje | "productie" | Production |
| Vânzări, Sales, Agent | "vanzari" | Sales |
| Achiziții, Procurement | "achizitii" | Procurement |
| Beauty Adviser, cosmetice, retail | "retail" | Retail |
| Contabilitate, Finance | "contabilitate" | Accounting |
| Marketing | "marketing" | Marketing |
| HR, Resurse Umane | "hr" | Human Resources |
| IT, IT Specialist | "it" | IT |
| Depozit, Logistică, Manipulant | "logistica" | Logistics |
| Laborator, Calitate | "calitate" | Quality |
| Proiect, Project | "proiect" | Project |

### Example Tags Extraction

**Job**: "Reglor mașini-unelte–Secțiile de producție Cluj – Napoca"
- From requirements: "minimum 2 ani" → "senior"
- From title: "mașini-unelte", "producție" → "productie"
- Tags: `["senior", "productie"]`

**Job**: "Beauty Adviser Gerovital Cluj-Napoca"
- From requirements: "minim 2 ani" → "senior"
- From title: "Beauty Adviser", "cosmetice" → "retail"
- Tags: `["senior", "retail"]`

**Job**: "Agent de vânzări -TT – Harghita"
- From requirements: "minim 2 ani" → "senior"
- From title: "vânzări" → "vanzari"
- Tags: `["senior", "vanzari"]`

**Job**: "Responsabil achiziții, Cluj-Napoca"
- From requirements: "Minim un an" → "mid"
- From title: "achiziții" → "achizitii"
- Tags: `["mid", "achizitii"]`

**Job**: "Manipulant mărfuri – București"
- From requirements: "studii medii" (no experience) → "entry-level"
- From title: "mărfuri", "depozit" → "logistica"
- Tags: `["entry-level", "logistica"]`

### Tags Field Rules (per SCHEMAS.md)
- **lowercase only** - NO UPPERCASE
- **no diacritics** - use "productie" not "producție", "vanzari" not "vânzări"
- **max 20 entries** - don't exceed
- **array format** - ["tag1", "tag2"]
- **standardized values only** - use consistent naming

## Current Job List with Tags (Feb 2026)

1. **Reglor mașini-unelte–Secțiile de producție Cluj – Napoca**
   - URL: https://www.farmec.ro/compania/joburi/reglor-utilaje-cluj-2-3-2-2-2-2-2-2/
   - Location: Cluj-Napoca
   - Workmode: on-site
   - Tags: ["senior", "productie"]

2. **Beauty Adviser Gerovital Cluj-Napoca**
   - URL: https://www.farmec.ro/compania/joburi/beauty-adviser-cluj-2-3-2-2-2-2-2-2/
   - Location: Cluj-Napoca
   - Workmode: on-site
   - Tags: ["senior", "retail"]

3. **Agent de vânzări -TT – Harghita**
   - URL: https://www.farmec.ro/compania/joburi/agent-vanzari-harghita/
   - Location: Harghita
   - Workmode: on-site
   - Tags: ["senior", "vanzari"]

4. **Responsabil achiziții, Cluj-Napoca**
   - URL: https://www.farmec.ro/compania/joburi/responsabil-achizitii-cluj-2-3-2-2-2-2-2-2-3/
   - Location: Cluj-Napoca
   - Workmode: on-site
   - Tags: ["mid", "achizitii"]

5. **Manipulant mărfuri – București**
   - URL: https://www.farmec.ro/compania/joburi/manipulant-marfuri-bucuresti/
   - Location: București
   - Workmode: on-site
   - Tags: ["entry-level", "logistica"]

## Solr Format

Push to Solr using curl:
```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  "http://localhost:8983/solr/job/update?commit=true" \
  -d '[{"url":"{JOB_URL}","title":"{TITLE}","company":"FARMEC SA","cif":"199150","location":["{LOCATION}"],"workmode":"on-site","tags":["{tag1}","{tag2}"],"date":"{ISO8601_DATE}","status":"scraped"}]'
```

Example with tags:
```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  "http://localhost:8983/solr/job/update?commit=true" \
  -d '[{"url":"https://www.farmec.ro/compania/joburi/reglor-utilaje-cluj-2-3-2-2-2-2-2-2/","title":"Reglor mașini-unelte–Secțiile de producție Cluj – Napoca","company":"FARMEC SA","cif":"199150","location":["Cluj-Napoca"],"workmode":"on-site","tags":["senior","productie"],"date":"2026-02-17T00:00:00Z","status":"scraped"}]'
```

## Important Notes
- **Follow Job Model exactly** - See SCHEMAS.md for required fields. DO NOT include "description" field - it doesn't exist in the Job model!
- All jobs are on-site (no remote work available)
- Company name must be exactly: "FARMEC SA"
- CUI is: "199150"
- tags must be lowercase, no diacritics, max 20 entries
- Commit to Solr after each job or in batches
- Verify count in Solr matches expected 5 jobs
- Verify tags are present in the documents
