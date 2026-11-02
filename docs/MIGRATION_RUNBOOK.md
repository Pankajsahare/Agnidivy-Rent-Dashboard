# Migration Runbook — v6.1 to v7

## Safety guarantees

- No legacy tab is cleared, renamed, or deleted.
- Migration preview is generated before ledger writes.
- Apply is blocked unless `MIGRATION_APPROVED=YES` and an administrator confirms.
- Migration writes only to v7 target sheets.
- Target records use deterministic IDs; rerunning an already applied preview does not append the same primary IDs again.
- Payments are imported as `LEGACY_UNVERIFIED`; no auto-verification.
- Form payment amount responses are not imported as independent payments during legacy migration. The room tab is the canonical monthly snapshot.
- C2 November 2026 corrections are imported once as ₹5,683.60. The earlier form values are recorded as superseded evidence in Audit Log / Receipt Register where relevant.
- Meter readings are imported from room tabs as canonical values. Form photos are retained as evidence and are not double-counted as extra readings.

## Steps

1. Take a copy of the live workbook.
2. Open the copy and bind this Apps Script project.
3. Run `setupV7Structure`.
4. Verify `Migration Overrides` (B2 = Aifaz, B3 = Aman, C2 = ₹5,683.60).
5. Run `runMigrationDryRun`.
6. Review `Migration Preview` by `RunID`. Search for `LEGACY_INCOMPLETE`, `LEGACY_UNVERIFIED`, C2 2026-11 and room assignment records.
7. Set `MIGRATION_APPROVED` to `YES`.
8. Run `applyMigrationPreview` and confirm.
9. Confirm row counts and totals in v7 ledgers; verify that legacy tabs are unchanged.
10. Reconcile old payment rows manually against payment statements and verify only valid entries.
11. Do not switch form triggers until v7 has passed test submissions in the backup workbook.

## Important reconciliation points from the supplied source workbook

- Tenant Master had six room records and a total base rent of ₹27,700 per month.
- The master electricity rate was ₹13.50/unit.
- C2 November 2026 room-tab amount paid was ₹5,683.60, matching the user-confirmed final correction.
- November 2026 room-tab bill totals added to ₹31,022.35.
- Some early historical rows have blank `Total Rent`; these are imported as `LEGACY_INCOMPLETE`, not filled by assumption.
- The room-tab current meter values are preferred over repeated Form Responses values when building the canonical legacy meter ledger.
