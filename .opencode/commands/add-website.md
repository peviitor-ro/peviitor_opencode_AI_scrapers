---
description: Add a new company website to websites.md with automatic research
agent: build
---

Add a new company to the websites.md file by automatically researching company details online.

Steps:
1. Parse the company name from arguments (e.g., "EPAM")
2. Search for company CUI using WebSearch: "EPAM Romania CUI"
3. Navigate to targetare.ro direct URL: https://www.targetare.ro/{CUI}/{company-slug}
4. Extract company details from targetare.ro:
   - Full legal company name in Romania
   - CUI/CIF (fiscal code) - REQUIRED
   - Registration number
5. Search for the company's official website
6. Find the company's careers/jobs page
7. Verify all data with the user before saving
8. Add the company to websites.md with CUI column

Usage:
- Add a company: /add-website EPAM

Arguments:
- Company brand name (e.g., "EPAM", "Amazon", "Softlead")

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
   - CUI/CIF (REQUIRED - must be saved to websites.md)
6. Ask user: "Is this data correct? Should I save it to websites.md?"
7. Only save after user confirmation

Data Collection:
- Use WebSearch to find CUI: "COMPANY NAME Romania CUI"
- Navigate to targetare.ro direct URL: https://www.targetare.ro/{CUI}/{company-slug}
- Search Google or company website for careers page
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
- ALWAYS save CUI/CIF to websites.md - this is REQUIRED
- The websites.md table has a CUI column - use it
- Run start-chrome.ps1 first if Chrome is not running with debug port
- The Last Scraped column will be left empty for new entries
- Do NOT overwrite existing entries - only add new ones
- Verify all URLs are working before proposing to save
- Check company status on targetare.ro - if status is "suspendat", "inactiv", or "radiat", warn the user (according to Company Model Schema, non-active companies should have their jobs removed)

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
7. User confirms: "Yes, save it"
8. AI adds the company to websites.md with CUI column
