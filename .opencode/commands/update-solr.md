---
description: Update Solr with new data
agent: build
---

# SOLR AUTHENTICATION REMINDER
**ALWAYS use credentials when pushing to Solr:**
- Username: `solr`
- Password: `SolrRocks`
- Example: `curl -u solr:SolrRocks "http://localhost:8983/solr/job/update/json?commit=true"`

---

Update the Solr index with new job or company data.

## Workflow

### Step 1: Verify Solr is Running
1. Check Solr status: `curl -s http://localhost:8983/solr/admin/ping`
2. If not running, start it: `docker start peviitor-solr`
3. Wait for Solr to be ready (port 8983 accessible)

### Step 2: Prepare Data
1. Format data according to Job or Company schema (see SCHEMAS.md)
2. Ensure all required fields are present
3. Use proper diacritics for Romanian text
4. Remember: DO NOT include "description" field - it doesn't exist in schema

### Step 3: Push to Solr
1. Use the correct core:
   - Job data: `/solr/job/update`
   - Company data: `/solr/company/update`
2. Use curl with credentials: `-u solr:SolrRocks`
3. Set Content-Type: `-H "Content-Type: application/json"`
4. Add `commit=true` to immediately commit changes

### Step 4: Verify Update
1. Query Solr to confirm documents were added
2. Check document count matches expected

## Examples

### Add job documents:
```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  "http://localhost:8983/solr/job/update?commit=true" \
  -d '[{"url":"https://example.com/job","title":"Software Engineer","company":"Example SRL","status":"scraped","date":"2026-02-19T00:00:00Z"}]'
```

### Add company documents:
```bash
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  "http://localhost:8983/solr/company/update?commit=true" \
  -d '[{"id":"12345678","company":"Example SRL","status":"activ","website":["https://example.com"],"career":["https://example.com/careers"]}]'
```

### Query to verify:
```bash
curl -s -u solr:SolrRocks "http://localhost:8983/solr/job/select?q=company:Example%20SRL"
```

## Important Notes

- Always use credentials: `-u solr:SolrRocks`
- Use `commit=true` or commit after batch
- DO NOT include "description" field in Job documents
- Follow Job/Company schema from SCHEMAS.md
- Use Romanian diacritics where required (ăâîșț)
- Tags should be lowercase, no diacritics
