# Go-live Checklist

## Before setup
- [ ] Download / copy the existing workbook.
- [ ] Confirm backup copy opens and formulas are present.
- [ ] Confirm Apps Script project is bound to the backup workbook.

## Before migration apply
- [ ] `System Config` populated and `MIGRATION_APPROVED=NO` by default.
- [ ] `Migration Overrides` confirms B2 Aifaz, B3 Aman and C2 final amount ₹5,683.60.
- [ ] Dry-run row count and payload JSON reviewed.
- [ ] Legacy-incomplete rows accepted as incomplete, not guessed.
- [ ] All legacy payments remain unverified.

## Before emails
- [ ] Tenant emails reviewed.
- [ ] `ADMIN_EMAIL` set.
- [ ] `MAIL_ENABLED` remains NO until a test queue item is reviewed.
- [ ] Send a test email to a controlled address before enabling tenant messages.

## Before agreements
- [ ] Live Docs template accessible to script account.
- [ ] All expected placeholders exist.
- [ ] Agreement folder is private and access is correct.
- [ ] Test one room only and inspect the resulting PDF before emailing.

## Before Form synchronization
- [ ] `FORM_ID` matches the supplied Google Form.
- [ ] Run `Sync Form Room Choices` only after Room Master has been reviewed.
- [ ] Confirm the Form Room question is a dropdown or multiple-choice item.
- [ ] Verify that existing Form responses remain unchanged.

## Before triggers
- [ ] Test a form row with meter reading only.
- [ ] Test a form row with payment only.
- [ ] Test a row with both and a receipt image.
- [ ] Resubmit/reprocess the same row and confirm idempotency.
- [ ] Verify payment from the ledger and check bill balance.
- [ ] Review old v6.1 triggers; disable old duplicate handlers manually at go-live.
- [ ] Confirm `RENEWAL_REMINDER_DAYS` and tenant email addresses. Renewal emails are queued once per room/tenant/expiry date.
- [ ] Enable v7 triggers.
- [ ] Enable auto monthly billing only after one complete manual billing cycle is reconciled.
