# Changelog

## 7.0.1 — Agreement renderer correction

- Removed DOCX-derived placeholder dependency from agreement generation.
- Restored the v6.1 native DocumentApp agreement structure: title, subtitle, owner/tenant table, property table, deposit/tenure table, 8 clauses, witness text and signature table.
- Kept the supplied Live Google Docs document as the configured master source. Each agreement is generated from a copy; only the copy is rebuilt, and the Live Master is never edited.
- Added additive-only `RentDeposit` and `ElectricityDeposit` Room Master columns and migration mapping.
- Added two unit tests for v6.1 agreement model structure and deposit split fallback.
- Existing financial ledger, payment verification, email queue, audit trail and migration protections remain unchanged.

## 7.0.0

- Initial modular v7 architecture, migration preview/apply, ledgers, notification queue, configuration and GitHub Actions CI.
