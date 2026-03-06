---
description: Add a new company to Solr company core with automatic research
agent: build
---

Add a new company to the Solr company core by automatically researching company details online.

Steps:
1. Parse the company name from arguments (e.g., "EPAM")
2. Search for company CUI using WebSearch: "EPAM Romania CUI"
3. Navigate to targetare.ro direct URL: https://www.targetare.ro/{CUI}/{company-slug}
4. Extract company details from targetare.ro:
   - Full legal company name in Romania
   - CUI/CIF (fiscal code) - REQUIRED
   - Registration number
5. Search for the company's official website:
   - **IMPORTANT**: When multiple websites are found, PRIORITIZE .ro domains
   - First, search for: "COMPANY NAME Romania official website" and look for .ro domains
   - Only use other TLDs (.com, .eu, etc.) if NO .ro domain exists
   - A company may have multiple websites - list ALL of them in the website array
   - Example: If company has both ziramarketing.com and ziramarketing.ro, use only ziramarketing.ro
6. Find the company's careers/jobs page:
   - Search for careers page using .ro domain if available
   - Look for "/careers", "/jobs", "/join-us", "/work-with-us" paths
   - A company may have multiple careers pages - list ALL of them in the career array
7. Verify all data with the user before saving
8. Add the company to Solr company core with all required fields

Usage:
- Add a company: /add-website EPAM

Arguments:
- Company brand name (e.g., "EPAM", "Amazon", "Softlead")

## Company Model Schema (for Solr):
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
| lastScraped | string | No | Date of last scrape (leave empty for new) |
| scraperFile | string | No | Name of scraper file |

Workflow:
1. Search for CUI using WebSearch: "COMPANY NAME Romania CUI"
2. Navigate to targetare.ro direct URL: https://www.targetare.ro/{CUI}/{company-slug}
3. Extract company details: full name, CUI (REQUIRED), registration number
4. Search for the company's official careers page
5. Present the found data to the user for verification:
   - Full company name
   - Brand name
   - Website URL
   - Careers page URL
   - CUI/CIF (REQUIRED - will be saved to Solr)
   - Group (if applicable)
6. Ask user: "Is this data correct? Should I save it to Solr?"
7. Only save after user confirmation

## Solr Update Command:
To add company to Solr, use atomic upsert (this will add if not exists, or merge if exists):
```bash
curl -u solr:SolrRocks -X POST "https://solr.peviitor.ro/solr/company/update/json?commit=true" \
  -H "Content-Type: application/json" \
  -d '[{
    "id": "33159615",
    "company": "EPAM SYSTEMS INTERNATIONAL SRL",
    "brand": "EPAM",
    "group": "EPAM Systems",
    "status": "activ",
    "website": ["https://www.epam.com", "https://www.epam.ro"],
    "career": ["https://www.epam.com/careers/locations/romania", "https://careers.epam.com"],
    "lastScraped": "",
    "scraperFile": "epam.md"
  }]'
```

**Important - Website Priority Rules:**
- website[] and career[] arrays can contain multiple URLs
- **ALWAYS prioritize .ro domains** over other TLDs
- Put .ro domains FIRST in the array, then other TLDs
- Example: `["https://www.company.ro", "https://www.company.com"]`

**Note**: Solr automatically performs atomic update - if the company id already exists, it will merge the fields (not overwrite). Only include fields you want to update.

Data Collection:
- Use WebSearch to find CUI: "COMPANY NAME Romania CUI"
- Navigate to targetare.ro direct URL: https://www.targetare.ro/{CUI}/{company-slug}
- Search Google or company website for careers page
- **IMPORTANT**: When searching for websites, prioritize .ro domains
- **ALWAYS put .ro domains first** in website[] and career[] arrays
- If multiple careers pages exist, include all of them
- Verify URLs are accessible before presenting

How to Extract Data from targetare.ro:
1. First, use WebSearch to find the CUI for the company:
   - Search: "COMPANY NAME Romania CUI" (e.g., "EPAM Romania CUI")
   - Find CUI from results (listafirme.ro, risco.ro, or targetare.ro)
2. Once you have the CUI, navigate directly to:
   - https://www.targetare.ro/{CUI}/{company-slug}
   - Example: https://www.targetare.ro/33159615/epam-systems-international-srl
3. Extract from the page:
   - Full company name (title)
   - CUI (shown as "Codul fiscal")
   - Reg. Comerțului
   - Address
   - Phone, email, website (if available)
4. For careers page, search: "COMPANY careers Romania"

Note:
- ALWAYS save company to Solr company core - this is REQUIRED
- Use "activ" as default status for new companies
- Run start-chrome.ps1 first if Chrome is not running with debug port
- The lastScraped field will be left empty for new entries
- Do NOT overwrite existing entries - only add new ones
- Verify all URLs are working before proposing to save
- Check company status on targetare.ro - if status is "suspendat", "inactiv", or "radiat", warn the user (according to Company Model Schema, non-active companies should have their jobs removed)
- **IMPORTANT**: When websites are found, ALWAYS prioritize .ro domains and put them FIRST in arrays

Example Flow:
1. User runs: /add-website EPAM
2. AI searches: "EPAM Romania CUI"
3. AI finds: EPAM SYSTEMS INTERNATIONAL SRL, CUI: 33159615
4. AI navigates to: https://www.targetare.ro/33159615/epam-systems-international-srl
5. AI extracts details and searches for careers page
6. AI presents to user:
   - Full Name: EPAM SYSTEMS INTERNATIONAL SRL
   - Brand: EPAM
   - Website: https://www.epam.com
   - Careers: https://www.epam.com/careers/locations/romania
   - CUI: 33159615
   - Group: EPAM Systems
7. User confirms: "Yes, save it"
8. AI adds the company to Solr company core:
   [{
     "id": "33159615",
     "company": "EPAM SYSTEMS INTERNATIONAL SRL",
     "brand": "EPAM",
     "group": "EPAM Systems",
     "status": "activ",
     "website": ["https://www.epam.com"],
     "career": ["https://www.epam.com/careers/locations/romania"]
   }]
