# Carrefour (Cora) Scraping Prompt

## Company Information

- **Brand**: CARREFOUR, CORA
- **Full Company Name**: CARREFOUR ROMANIA SA
- **CUI**: 11588780
- **Website**: https://carrefour.ro
- **Careers Page**: https://carrefour.ro/corporate/cariere
- **Note**: Cora was acquired by Carrefour in April 2024. Former Cora stores now operate under Carrefour brand. Both brands share the same careers page.

## Job Listing Page

- **URL**: https://carrefour.ro/corporate/cariere/cauta
- **Pagination**: 6 pages with ~8 jobs per page (~48 jobs total)
- **Page URL Format**: https://carrefour.ro/corporate/cariere/cauta?page={page_number}

## Scraping Instructions

1. Navigate to: https://carrefour.ro/corporate/cariere/cauta
2. Extract job listings from the page
3. For each job, click to get details:
   - Job title
   - Job URL (full URL)
   - Location (city)
   - Work mode (Full-time/Part-time)
4. Navigate through all pages using pagination links

### Job Data Extraction:

For each job found, extract:
- `url`: Full URL to job detail page (e.g., https://carrefour.ro/corporate/cariere/detalii/6745)
- `title`: Job title (exact as shown)
- `company`: "CARREFOUR ROMANIA SA"
- `cif`: "11588780"
- `location`: Array of Romanian cities (e.g., ["Sfantu Gheorghe"])
- `workmode`: "on-site" (retail jobs are typically on-site)
- `tags`: Extract from job title:
  - Entry-level jobs: "entry-level", "junior"
  - Experienced: "mid"
  - Senior roles: "senior"
  - Fields: "retail", "commerce", "sales", "customer-service", "logistics"
- `date`: Current ISO8601 date (e.g., "2026-02-18T00:00:00Z")
- `status`: "scraped"

### Common Job Titles at Carrefour:

- Lucrator Universal (General Worker)
- Lucrator Universal Receptie Marfa (Goods Reception Worker)
- Lucrator Universal Produse Proaspete (Fresh Products Worker)
- Brutar (Baker)
- Casier Comercial (Cashier)
- Agent Situatii de Urgenta (Emergency Situations Agent)
- Asistent Vanzari (Sales Assistant)
- Cofetar (Confectioner)
- Collector Comenzi Online (Online Orders Collector)

### Solr Schema Format:

```json
{
  "url": "https://carrefour.ro/corporate/cariere/detalii/6745",
  "title": "Lucrator Universal Receptie Marfa Hiper",
  "company": "CARREFOUR ROMANIA SA",
  "cif": "11588780",
  "location": ["Sfantu Gheorghe"],
  "workmode": "on-site",
  "tags": ["entry-level", "retail", "logistics"],
  "date": "2026-02-18T00:00:00Z",
  "status": "scraped"
}
```

### Important Rules:

- ALL jobs are in Romania (retail positions)
- Work mode is typically "on-site" for retail
- Use CUI 11588780 for the cif field
- Use exact company name: "CARREFOUR ROMANIA SA"
- Tags must be lowercase, no diacritics
- Diacritics are OK for location and title
