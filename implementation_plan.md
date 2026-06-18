# Resident Payment Reporting & Admin Verification

The current system already allows Admins to record a payment, which instantly updates the resident's ledger and generates a receipt. To complete the loop ("vice versa"), we need to allow Residents to report their own payments (e.g., after doing a UPI transfer) so the Admin can verify it.

## Proposed Changes

### Resident View (`ResidentPaymentHistory.tsx`)
- Add a **"Report Payment"** button in the top banner if the user has pending dues.
- Clicking it opens a form where the user can enter:
  - Amount Paid
  - Payment Mode (UPI, Bank Transfer, etc.)
  - Transaction Reference ID (Required for verification)
  - Date
- This will save the payment to the database with a status of `Pending`.
- `Pending` payments will show up in their history with an orange "Verification Pending" badge.

### Admin View (`MaintenanceCollection.tsx`)
- The Admin dashboard will highlight flats that have `Pending` payments waiting for review.
- The Admin can click on these pending payments to see the user's Transaction Reference ID.
- The Admin will have two options:
  - **Approve**: Changes the status to `Paid`, updates the community's total collection, and automatically generates the receipt for the user.
  - **Reject**: Deletes the invalid pending payment report, prompting the user to try again.

## Verification Plan

### Automated Tests
- None required, rely on manual testing.

### Manual Verification
1. Log in as a resident (e.g., Smith) and report a payment via UPI with a test transaction ID.
2. Verify that Smith's dashboard shows "Verification Pending".
3. Log in as an Admin and view the Maintenance Collection page.
4. Verify that Smith's flat shows "Verify Payment".
5. Approve the payment and verify that Smith's balance drops, the community's collected amount increases, and a receipt is generated.
