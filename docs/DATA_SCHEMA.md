[Uploading DATA_SCHEMA.md…]()
# v7 Data Schema

All v7 sheets are append-first. Legacy source tabs are read-only migration sources.

| Sheet | Primary key | Main purpose |
|---|---|---|
| System Config | KEY | UPI, email, rates, template ID, safety flags |
| Migration Overrides | OverrideID | User-approved, period-scoped migration exceptions |
| Room Master | RoomNo | Current room, meter, rent and tenant snapshot |
| Tenant History | TenantID | Current-state tenant snapshot and future movement history |
| Billing Ledger | BillID | One bill per room and `YYYY-MM` |
| Payment Ledger | PaymentID | One row per payment submission / legacy payment record |
| Meter Reading Ledger | ReadingID | One row per submitted/canonical reading |
| Receipt Register | ReceiptID | Multiple meter/payment receipt references |
| Agreement Register | AgreementID | Generated Doc/PDF and validity period |
| Notification Queue | NotificationID | Queued email, retries, attachment file IDs |
| Audit Log | LogID | Important actor/action/entity change history |
| Error Log | ErrorID | Exceptions and context |
| Migration Preview | RunID + RecordID | Reviewable append-only migration payloads |
| V7 Dashboard | layout | Current period management summary |

## Status semantics

- `REPORTED_UNVERIFIED`: tenant submitted a payment; not yet verified.
- `LEGACY_UNVERIFIED`: amount was recorded in a legacy room tab; not verified against bank/UPI evidence.
- `VERIFIED`: administrator reconciled the payment.
- `OVERPAID_REVIEW`: verified payments exceed the bill total and require manual credit/refund reconciliation.
- `NOT_YET_VERIFIED`: a bill exists but no payment has been verified.
- `LEGACY_NOT_RECONCILED`: old bill imported; amount paid/old balance has not been reconciled in v7.
- `LEGACY_INCOMPLETE`: source bill total was blank; do not infer a total from rent alone.
- `PLANNED`: future-period placeholder; it is converted to `ISSUED` only when the required current and previous readings exist.

## Financial rule

Only `VERIFIED` rows contribute to `Billing Ledger.VerifiedPayments` and reduce `OutstandingAmount`. The dashboard shows reported/unverified amounts separately. No migration routine marks a payment as verified merely because a legacy QR cell says `PAID` or a historical balance says zero.
