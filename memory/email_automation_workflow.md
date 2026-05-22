---
name: Email Automation Workflow
description: Outlook automation using Playwright for admin tasks
type: project
---

**Fact:** We use Playwright to automate Outlook login and session management.
**Weekly Schedule:** Teacher meetings on Mon/Tue/Fri.
**Routine:** Marie (Marine) sends presentation `.docx` files via email.
**Task:** Monitor email, download docx, analyze content, and extract key points.
**Constraint:** The `waitForSelector` timeout must be set to at least 15 seconds (15000ms) to accommodate network latency.
**Why:** To ensure stability during page loading for email automation tasks.
**How to apply:** Use the `email_filter.js` script. Ensure any new `waitForSelector` calls respect the 15s timeout.
