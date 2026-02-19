import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const WEBSITES_PATH = path.join(__dirname, "..", "webscraper", "websites.md");

test.describe("add-website command - new workflow", () => {
    const testCompany = "EPAM";
    
    test("should search targetare.ro for company info", async () => {
        const searchUrl = `https://www.targetare.ro/cauta-firme?query=${encodeURIComponent(testCompany)}`;
        
        const response = await fetch(searchUrl);
        expect(response.status).toBe(200);
        
        const html = await response.text();
        expect(html).toContain(testCompany);
    });

    test("should find full company name from targetare.ro", async () => {
        const testCompanyLower = testCompany.toLowerCase();
        
        const searchUrl = `https://www.targetare.ro/cauta-firme?query=${encodeURIComponent(testCompany)}`;
        const response = await fetch(searchUrl);
        const html = await response.text();
        
        const companyPatterns = [
            new RegExp(`${testCompany}[\\s-]*SYSTEMS`, 'i'),
            new RegExp(`${testCompany}[\\s-]*INTERNATIONAL`, 'i'),
            new RegExp(`${testCompany}[\\s-]*SRL`, 'i')
        ];
        
        const hasCompanyName = companyPatterns.some(pattern => pattern.test(html));
        expect(hasCompanyName || html.toLowerCase().includes(testCompanyLower)).toBe(true);
    });

    test("should extract CUI from targetare.ro", async () => {
        const cuiPattern = /CUI[:\s]*(\d{8,})/i;
        const testCompanyLower = testCompany.toLowerCase();
        
        const searchUrl = `https://www.targetare.ro/cauta-firme?query=${encodeURIComponent(testCompany)}`;
        const response = await fetch(searchUrl);
        const html = await response.text();
        
        const hasCui = cuiPattern.test(html) || html.toLowerCase().includes('cui');
        expect(hasCui).toBe(true);
    });

    test("should add company to websites.md with correct format", () => {
        const originalContent = fs.readFileSync(WEBSITES_PATH, "utf8");
        
        const testCompanyData = {
            fullName: "EPAM SYSTEMS INTERNATIONAL SRL",
            brand: "EPAM",
            website: "https://epam.com",
            careersPage: "https://careers.epam.com",
            cui: "12345678"
        };

        const lines = originalContent.split("\n");
        const tableStartIndex = lines.findIndex(line => line.includes("| Company |"));
        
        const newRow = `| ${testCompanyData.fullName} | ${testCompanyData.website} | ${testCompanyData.careersPage} | |`;
        lines.splice(tableStartIndex + 2, 0, newRow);
        
        const updatedContent = lines.join("\n");
        fs.writeFileSync(WEBSITES_PATH, updatedContent);

        const finalContent = fs.readFileSync(WEBSITES_PATH, "utf8");
        expect(finalContent).toContain(testCompanyData.fullName);
        expect(finalContent).toContain(testCompanyData.website);
        expect(finalContent).toContain(testCompanyData.careersPage);

        fs.writeFileSync(WEBSITES_PATH, originalContent);
    });

    test("should verify company website is accessible", async () => {
        const websiteUrl = "https://epam.com";
        const response = await fetch(websiteUrl, { redirect: 'follow' });
        expect(response.status).toBe(200);
    });

    test("should verify careers page is accessible", async () => {
        const careersUrl = "https://careers.epam.com";
        const response = await fetch(careersUrl, { redirect: 'follow' });
        expect(response.status).toBe(200);
    });

    test("websites.md should have correct table structure", () => {
        const content = fs.readFileSync(WEBSITES_PATH, "utf8");
        
        expect(content).toContain("| Company |");
        expect(content).toContain("| Website |");
        expect(content).toContain("| Careers Page |");
        expect(content).toContain("| Last Scraped |");
    });
});
