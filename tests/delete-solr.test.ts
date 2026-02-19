import { test, expect } from "@playwright/test";
import { spawnSync } from "child_process";

function curl(args) {
    const result = spawnSync("curl", args, { encoding: "utf8" });
    return JSON.parse(result.stdout);
}

test("delete-solr command works - delete job by url", () => {
    const jobUrl = "https://example.com/test-solr-delete";
    
    const verifyResp = curl(["-s", "-u", "solr:SolrRocks", "http://localhost:8983/solr/job/select?q=url:%22" + encodeURIComponent(jobUrl) + "%22"]);
    expect(verifyResp.response.numFound).toBe(1);

    const deleteQuery = JSON.stringify({delete: {query: "url:\"" + jobUrl + "\""}});
    const deleteResp = curl([
        "-s", "-u", "solr:SolrRocks", 
        "-X", "POST", 
        "-H", "Content-Type: application/json", 
        "http://localhost:8983/solr/job/update?commit=true", 
        "-d", deleteQuery
    ]);
    expect(deleteResp.responseHeader.status).toBe(0);
    
    const afterResp = curl(["-s", "-u", "solr:SolrRocks", "http://localhost:8983/solr/job/select?q=url:%22" + encodeURIComponent(jobUrl) + "%22"]);
    expect(afterResp.response.numFound).toBe(0);
});
