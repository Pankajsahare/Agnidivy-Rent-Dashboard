# Sahare Properties — Rent & Collection Auto-Pilot v7

**Version:** 7.0.0  
**Runtime:** Google Apps Script V8  
**Timezone:** Asia/Kolkata  
**Architecture:** Container-bound Apps Script + Google Sheets + Google Forms + Google Drive/Docs + Gmail; GitHub is the source-control and validation layer.

## v7 मध्ये काय तयार केले आहे

- `Batch Read / Batch Write` वापरून अनावश्यक Google Sheets service calls कमी केले आहेत.
- `getColumnMap(headers)` हा एकच shared header-map helper आहे. Duplicate headers आढळल्यास प्रक्रिया थांबते.
- WhatsApp billing text साठी एकच `buildBillingMessage()` source आहे. Historical migration, नवीन बिल आणि payment verification या तिन्ही ठिकाणी त्याच logic चा वापर होतो.
- `System Config` आणि `Migration Overrides` Sheets मधून बदलणारी व्यावसायिक माहिती व confirmed exceptions वाचली जाते. Critical switches (`MIGRATION_APPROVED`, `MAIL_ENABLED`, `AUTO_CREATE_MONTHLY_BILLS`, `ENABLE_EXTERNAL_QR`) नेहमी live sheet मधून वाचले जातात; stale cache वर अवलंबून नाहीत.
- `LockService` आणि row-based idempotency keys वापरून form submit आणि billing duplicate processing नियंत्रित केले आहे.
- प्रत्येक payment स्वतंत्र `Payment Ledger` row आहे. Form मधील payment हा `REPORTED_UNVERIFIED` असतो; administrator verification नंतरच तो `VERIFIED` होतो.
- जुने room-wise `Amount Paid` records `LEGACY_UNVERIFIED` म्हणून import होतात. जुना QR किंवा `PAID` label पाहून payment verified मानले जात नाही.
- Migration ही append-only आहे. Dry-run आधी; `MIGRATION_APPROVED=YES` आणि UI confirmation नंतरच Apply होते. जुने tabs clear किंवा delete केले जात नाहीत.
- Tenant receipts / agreements साठी `Anyone with the link` permission दिली जात नाही. Legacy Drive permissions आपोआप बदलले जात नाहीत.
- Google Docs live master template मधून agreement copy तयार होते. PDF tenant-specific file म्हणून Drive मध्ये जतन होते; duplicate generation साठी lock + tenant/room/start-date key आहे आणि failure झाल्यास unregistered temporary copies साफ केल्या जातात.
- `Sync Form Room Choices` मेनूमधून Room Master वरून Room dropdown आणि Billing Period (`YYYY-MM`) choices अद्ययावत करता येतात; जुन्या Form responses बदलत नाहीत. Legacy choice `B2 - Aifaz (Meter: J0044)` मधून room code वेगळा ओळखला जातो.
- Agreement expiry पूर्वी `RENEWAL_REMINDER_DAYS` (default 30) मध्ये येणाऱ्या active tenants साठी duplicate-safe email reminder queue तयार होते.
- Email queue, retry count, error log, audit log आणि dashboard समाविष्ट आहेत.
- External UPI QR generation default ने बंद (`ENABLE_EXTERNAL_QR=NO`) आहे. वापरायचे असल्यास QuickChart QR URL तयार होतो.
- WhatsApp हा `wa.me` click-to-chat link आहे; WhatsApp Business API द्वारे स्वयंचलित संदेश पाठवण्याचा समावेश नाही.

## Source bundle मधून ओळखलेली मूळ रचना

दिलेल्या workbook मध्ये 9 tabs होते: `Form Responses`, `Dashboard`, `Tenant Master`, `D`, `C2`, `B1`, `B2`, `B3`, `B4`. सहा room tabs चे headers पूर्णपणे समान नव्हते; उदा. B1 मध्ये `Old Ele Reading` अतिरिक्त column होता. Migration header-based आहे, fixed column positions वर अवलंबून नाही.

### वापरकर्त्याने पुष्टी केलेले Migration नियम

`Migration Overrides` मध्ये खालील नोंदी `setupV7Structure()` दरम्यान seed होतात:

1. November 2026 मध्ये B2 — Aifaz.
2. November 2026 मध्ये B3 — Aman.
3. C2 November 2026 मधील ₹5,500 → ₹5,683 → ₹5,683.60 या तीन Form amounts या एकाच व्यवहाराच्या सुधारित नोंदी आहेत. अंतिम ₹5,683.60 एकदाच import होते; आधीच्या Form values स्वतंत्र payments म्हणून import होत नाहीत.

C2 चा अंतिम Payment Ledger record देखील `LEGACY_UNVERIFIED` असतो. प्रत्यक्ष UPI/bank transaction तपासून administrator ने verify करणे आवश्यक आहे.

## महत्त्वाची मर्यादा

Google Workspace च्या Live Sheet, Form, Docs आणि Drive links या session मधून थेट वाचता आले नाहीत; Google Drive connector उपलब्ध नव्हता. म्हणून हा code bundle दिलेल्या ZIP workbook, uploaded v6.1 Apps Script आणि वापरकर्त्याने दिलेल्या पुष्टींवर आधारित आहे. Live Google Docs template चा ID config मध्ये ठेवला आहे; परंतु त्याचा live content deployment वेळी access व placeholders तपासले जातील. Agreement generation अपेक्षित placeholders नसल्यास थांबते.

---

## Browser-only setup (शिफारस केलेली पद्धत)

### A. आधी backup घ्या

1. Existing Google Spreadsheet उघडा.
2. `File → Make a copy` वापरून स्वतंत्र backup तयार करा.
3. मूळ workbook मधील tabs, formulas, Drive uploads किंवा historical rows delete करू नका.
4. प्रथम v7 ची चाचणी backup copy वर करा.

### B. GitHub repository तयार करा

1. GitHub मध्ये `sahare-properties-autopilot-v7` नावाचे private repository तयार करा.
2. या ZIP मधील सर्व files repository मध्ये upload करा.
3. `Actions` tab मध्ये `Validate Sahare Properties v7` workflow चालल्याचे तपासा.
4. CI मध्ये syntax check आणि unit tests pass झाले पाहिजेत.

### C. Google Apps Script जोडणी

1. Backup Google Sheet उघडा.
2. `Extensions → Apps Script` निवडा. त्यामुळे container-bound Apps Script project तयार होईल.
3. Default `Code.gs` मधील मजकूर काढून `dist/Code.gs` मधील पूर्ण source paste करा.
4. Apps Script Editor मधील `Project Settings` मध्ये `Show "appsscript.json" manifest file in editor` सुरू करा.
5. `appsscript.json` मध्ये `src/appsscript.json` मधील मजकूर paste करा.
6. Save करा.
7. Function dropdown मधून `setupV7Structure` निवडा आणि Run करा. Permissions मागितल्यास तुमच्या Google account मधून review करून authorize करा.

`setupV7Structure()` फक्त v7 चे नवीन tabs/config तयार करते. ती legacy tabs overwrite किंवा delete करत नाही.

### D. Initial configuration तपासा

नवीन `System Config` tab मध्ये तपासा:

| KEY | सुरुवातीची value / कृती |
|---|---|
| `UPI_ID` | Source script मधील existing UPI ID prefilled |
| `UPI_NAME` | Sahare Properties |
| `ADMIN_EMAIL` | योग्य admin email स्वतः भरा |
| `AGREEMENT_TEMPLATE_ID` | दिलेल्या Live Google Docs Master Template चा ID prefilled |
| `AGREEMENT_FOLDER_ID` | दिलेल्या Drive folder ID ने prefilled; folder permissions तपासा |
| `FORM_ID` | दिलेल्या Google Form ID ने prefilled; Form edit access तपासा |
| `RENEWAL_REMINDER_DAYS` | Default 30 दिवस; गरजेनुसार बदला |
| `MAIL_ENABLED` | सुरुवातीला `NO` ठेवा; या अवस्थेत emails queue होतात पण पाठवले जात नाहीत |
| `ENABLE_EXTERNAL_QR` | सुरुवातीला `NO` ठेवा; QuickChart वापरायचा असल्यास नंतर `YES` |
| `MIGRATION_APPROVED` | `NO` ठेवा; preview तपासल्यानंतरच `YES` करा |
| `AUTO_CREATE_MONTHLY_BILLS` | सुरुवातीला `NO` ठेवा |

### E. Migration — दोन टप्पे

1. Menu `Sahare Properties v7 → 3. Run Migration Dry Run` चालवा.
2. `Migration Preview` tab तपासा. प्रत्येक row मध्ये Target Sheet, Record ID, Source Row, Warning आणि JSON payload असतो.
3. विशेषतः `C2 2026-11`, `B2`, `B3`, `LEGACY_UNVERIFIED` आणि `LEGACY_INCOMPLETE` records तपासा.
4. सगळे बरोबर असल्यावर `System Config` मध्ये `MIGRATION_APPROVED` ची value `YES` करा.
5. Menu `Apply Approved Migration` चालवा आणि confirmation द्या.
6. Apply झाल्यावर script `MIGRATION_APPROVED` परत `NO` करतो.

Migration पुन्हा चालवावी लागल्यास नवीन Dry Run तयार होईल. Record IDs deterministic आहेत; आधीच असलेले IDs पुन्हा append होत नाहीत.

### F. Payment verification

1. `Payment Ledger` उघडा.
2. संबंधित payment row निवडा.
3. `Sahare Properties v7 → Verify Selected Payment` चालवा.
4. UPI/bank statement/transaction reference तपासूनच `YES` द्या.
5. Verified झाल्यानंतर संबंधित bill चे verified total, outstanding, UPI link आणि WhatsApp link पुन्हा मोजले जातात.

### G. Agreement generation

1. `System Config` मधील `AGREEMENT_TEMPLATE_ID` तपासा.
2. Live Google Docs template मध्ये uploaded DOCX template प्रमाणे पुढील placeholders असणे आवश्यक आहे: `{{TenantName}}`, `{{RoomNo}}`, `{{MobileNumber}}`, `{{Rent}}`, `{{Deposit}}`, `{{DepositMode}}`, `{{DepositDate}}`, `{{StartDate}}`, `{{EndDate}}`.
3. `Sahare Properties v7 → Generate Agreement` निवडा आणि Room No भरा.
4. PDF व Google Docs copy खाजगी permissions सह तयार होतात. Email queue मध्ये नोंद `MAIL_ENABLED=NO` असतानाही होऊ शकते; परंतु `YES` होईपर्यंत worker कोणतेही Email पाठवत नाही.

### H. Go-live triggers

1. आधी manual billing, payment verification, agreement generation आणि email queue तपासा.
2. `MAIL_ENABLED=YES` करण्यापूर्वी Admin Email आणि प्रत्येक Tenant Email तपासा.
3. `Install v7 Triggers` चालवा.
4. Go-live पूर्वी Apps Script → Triggers मध्ये जुन्या v6.1 `onFormSubmit` / monthly report triggers तपासा. v7 installer जुन्या triggers ना delete करत नाही. जुनी automation बंद न केल्यास v6 आणि v7 दोन्ही एकाच Form Submission वर चालू शकतात.
5. सर्व पडताळणी झाल्यावरच `AUTO_CREATE_MONTHLY_BILLS=YES` करा. Daily maintenance task current month चे bill available meter readings वरूनच तयार करेल.

---

## Optional clasp deployment

Repository मध्ये `deploy.yml` manual workflow आहे. वापरण्यासाठी GitHub repository secrets मध्ये `CLASPRC_JSON` आणि `SCRIPT_ID` configure करावे लागतील. हे browser-only first-time setup पेक्षा advanced आहे; Google Apps Script Editor मधून paste/publish करणे हा अधिक सोपा पर्याय आहे.

## Local validation

Node.js 20+ असलेल्या environment मध्ये:

```bash
npm run validate
```

Google Apps Script services (SpreadsheetApp, DriveApp, DocumentApp, MailApp, LockService) साठी Live integration test Apps Script Editor मधूनच करणे आवश्यक आहे.

## Module index

- `src/00_Constants.gs` — sheet schemas and defaults
- `src/01_Utilities.gs` — `getColumnMap`, period and billing message helpers
- `src/02_ConfigAndSchema.gs` — safe setup and config
- `src/03_AuditAndError.gs` — centralized audit/error logging
- `src/04_TenantService.gs` — Room Master read services
- `src/05_MeterService.gs` — meter ledger and indexed reads
- `src/06_BillingService.gs` — monthly bill creation
- `src/07_PaymentService.gs` — payment intake and manual verification
- `src/08_FormHandler.gs` — exact-row form trigger
- `src/09_NotificationService.gs` — queued email, retry and attachments
- `src/10_AgreementService.gs` — Google Docs copy → PDF
- `src/11_MigrationService.gs` — dry-run and append-only apply
- `src/12_DashboardService.gs` — V7 dashboard
- `src/13_TriggerService.gs` — opt-in time/form triggers and agreement-renewal reminders
