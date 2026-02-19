# ORANGE Romania Scraping

## Company Info

- **Brand**: ORANGE
- **Company**: ORANGE ROMANIA SA
- **CIF**: 9010105
- **Website**: https://www.orange.ro
- **Careers Page**: https://cariere.orange.ro/

## Data Source

The jobs are hosted on an eRecruiter platform at:
- URL: https://skk.erecruiter.pl/css/directsearch/OrangeRumunia/skk.aspx
- Config ID: 41047e2fd2174db0b85f4d987074bf49
- Company ID: 20136094

## Tags Extraction Rules

Department (Arie) is extracted from the job listing and used as tags:
- "Vânzări Retail" → vanzari, retail
- "IT" → it
- "Tehnic" → tehnic
- "Business to Business" → business-to-business, b2b
- "Achiziții" → achizitii, procurement
- "Marketing și Comunicare" → marketing, comunicare
- "Relații Clienți / Call Center" → relatii-clienti
- "Financiar" → financiary, finance
- "Altele" → altele

Additional tags based on job title keywords:
- "Reprezentant Vanzari" → vanzari, retail
- "Engineer" → engineering
- "Security" → security
- "Manager" → manager
- "Specialist" → specialist
- "Developer" / "DevOps" → devops
- "Data" → data
- "AI" / "Machine Learning" → ai, machine-learning
- "Sales" → sales

## Work Mode

All ORANGE jobs are on-site (retail stores, offices).

## Job URL Pattern

```
https://skk.erecruiter.pl//Offer.aspx?oid={offerId}&cfg=41047e2fd2174db0b85f4d987074bf49&ejoId={externalJobOfferId}&ejorId={externalJobOfferRegionId}&comId=20136094
```

## Notes

- ORANGE uses eRecruiter platform with direct search functionality
- Job listings can be fetched via GetHtml.ashx API
- Total jobs available: 51 (as of 2026-02-17)
- Most jobs are for retail positions (Orange Shop representatives)
- IT and technical positions are based primarily in Bucharest
