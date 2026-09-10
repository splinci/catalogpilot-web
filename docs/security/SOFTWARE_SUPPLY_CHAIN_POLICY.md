# SPLINCI COMMERCE OS — SOFTWARE SUPPLY CHAIN & DEPENDENCY POLICY

## 1. Dependency Integrity
- All production builds verify package lockfile integrity (`package-lock.json`).
- Direct dependency versions are pinned to prevent unreviewed upstream updates.

## 2. Automated Vulnerability Scanning
- Continuous automated dependency vulnerability scanning via `npm audit`.
- High and Critical CVE vulnerabilities require immediate patch deployment within 24 hours of notification.
