---
description: Delete job documents from Solr by key
agent: build
---

Delete job documents from Solr based on a specific key (default: url).

Steps:
1. Verify Solr is running: curl -s http://localhost:8983/solr/admin/ping
2. Parse the key and value from the arguments
3. Default to "url" if no key is specified
4. Delete the document(s) matching the key from the job core
5. Verify the deletion was successful

Usage:
- Delete by URL: /delete-solr url:https://example.com/job
- Delete by company: /delete-solr company:Test Company
- Delete by title: /delete-solr title:Software Engineer

The key can be any field from the Job schema (url, company, title, etc.).
The value should be URL-encoded if it contains special characters.

Example API call (using delete by query):
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" \
  'http://localhost:8983/solr/job/update?commit=true' \
  -d '{"delete":{"query":"url:\"https://example.com/job\""}}'

Note: Always use the delete-by-query format shown above. Do NOT use "_delete_:true" as it does not work properly.

Always delete what is asked. if you don't find the one the user told you to delete, DO NOT DELETE other instead. Exact match is really important!