import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const WEBSITES_PATH = path.join(__dirname, "..", "webscraper", "websites.md");

test("add-website command works - adds company to websites.md", () => {
    const testCompany = "TEST COMPANY ADD WEBSITE";
    const testWebsite = "https://testbrand.com";
    const testCareers = "https://careers.testbrand.com";

    const originalContent = fs.readFileSync(WEBSITES_PATH, "utf8");

    const lines = originalContent.split("\n");
    const tableStartIndex = lines.findIndex(line => line.includes("| Company |"));
    
    const newRow = `| ${testCompany} | ${testWebsite} | ${testCareers} | |`;
    lines.splice(tableStartIndex + 2, 0, newRow);
    
    const updatedContent = lines.join("\n");
    fs.writeFileSync(WEBSITES_PATH, updatedContent);

    const finalContent = fs.readFileSync(WEBSITES_PATH, "utf8");
    expect(finalContent).toContain(testCompany);
    expect(finalContent).toContain(testWebsite);
    expect(finalContent).toContain(testCareers);

    fs.writeFileSync(WEBSITES_PATH, originalContent);
});
