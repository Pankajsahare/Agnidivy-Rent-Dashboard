# Changelog

## 7.0.2 — Legacy rent waiver / credit accounting

- Reclassified all 58 user-confirmed legacy `Amount Paid` values as approved Rent Waiver/Credit Adjustments, total ₹2,83,606.60.
- Added an append-first `Adjustment Ledger`; legacy credits are no longer imported into `Payment Ledger`.
- Historical bill outstanding, future monthly billing, payment verification refresh and dashboard now subtract approved credits separately from verified cash receipts.
- Reclassified linked legacy file uploads as adjustment evidence, not payment receipts.
- Updated the C2 November correction audit to record one ₹5,683.60 credit adjustment, retaining the existing override key as a backward-compatible alias.
- Added unit tests for credit settlement, partial credits, excess-credit review and outstanding calculations.

## 7.0.1 — Agreement renderer correction

- Removed DOCX-derived placeholder dependency from agreement generation.
- Restored the v6.1 native DocumentApp agreement structure: title, subtitle, owner/tenant table, property table, deposit/tenure table, 8 clauses, witness text and signature table.
- Kept the supplied Live Google Docs document as the configured master source. Each agreement is generated from a copy; only the copy is rebuilt, and the Live Master is never edited.
- Added additive-only `RentDeposit` and `ElectricityDeposit` Room Master columns and migration mapping.
- Added two unit tests for v6.1 agreement model structure and deposit split fallback.
- Existing financial ledger, payment verification, email queue, audit trail and migration protections remain unchanged.

## 7.0.0

- Initial modular v7 architecture, migration preview/apply, ledgers, notification queue, configuration and GitHub Actions CI.
