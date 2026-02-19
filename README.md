# Peviitor OpenCode AI Scrapers

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

Automation project for scraping job data from [peviitor.ro](https://peviitor.ro) platform using OpenCode AI agents.

## About

This project is developed and maintained by **Asociația Opportunități și Cariere** - a Romanian NGO dedicated to simplifying the job search process in Romania.

Our mission is to help people find jobs from hundreds of companies through our free platform [peviitor.ro](https://peviitor.ro).

## Features

- **Automated Job Scraping** - Scrape jobs from 25+ company career pages
- **Solr Integration** - Push job data to Solr search engine
- **URL Validation** - Validate job URLs and remove 404/inactive jobs
- **Company Management** - Add and manage company scraping prompts

## Quick Start

### Prerequisites

- PowerShell 5.1+ or PowerShell 7+
- Google Chrome (for automation)
- Docker Desktop (for Solr)
- Node.js 18+ (for Playwright tests)

### Setup

1. **Start Chrome with debugging:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File start-chrome.ps1
   ```

2. **Start Solr:**
   ```powershell
   docker start peviitor-solr
   ```

3. **Install test dependencies:**
   ```powershell
   cd tests && npm install
   ```

## Commands

| Command | Description |
|---------|-------------|
| `/scrape [company]` | Scrape jobs from a company |
| `/add-website` | Add new company to websites.md |
| `/remove-404` | Validate job URLs and remove inactive |
| `/update-solr` | Update Solr with new data |
| `/delete-solr` | Delete jobs from Solr |
| `/clean-project` | Clean temp files and update docs |

## Project Structure

```
peviitor_opencode_AI_scrapers/
├── docs/                  # HTML documentation
├── .opencode/commands/    # OpenCode commands
├── webscraper/            # Company scraping prompts
├── tests/                 # Playwright tests
├── start-chrome.ps1       # Chrome startup script
├── SCHEMAS.md             # Data schemas
├── AGENTS.md              # Agent instructions
└── INSTRUCTIONS.md        # Workflow instructions
```

## Documentation

- [Setup Guide](docs/setup.html)
- [Commands](docs/commands.html)
- [Data Schemas](docs/schemas.html)
- [Tests](docs/tests.html)

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

