---
description: Update Solr with new data
agent: build
---

Update the Solr index with new job or company data.

Steps:
1. First, verify Solr is running: curl -s http://localhost:8983/solr/admin/ping
2. If not running, start it: docker start peviitor-solr
3. Use the job or company core to add/update documents
4. Verify the update was successful

Example: Add a new job document to the job core using:
curl -u solr:SolrRocks -X POST -H "Content-Type: application/json" 'http://localhost:8983/solr/job/update' -d '{...}'

Use the Job/Company model schema from peviitor_core for proper formatting.
