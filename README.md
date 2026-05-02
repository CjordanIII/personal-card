# GreenPal Customer Exporter (Chrome Extension)

This extension adds a popup button to export customer data from:

- `https://www.yourgreenpal.com/vendor/my_customers`

It collects for each customer row:

- Export date (today)
- Customer name
- Customer address
- Next mow date (if available)
- Full schedule text
- Base charge
- Tax rate
- Tax amount
- Total charge including tax
- Any extra custom columns you define

## Install locally

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this project folder.

## Use

1. Open the GreenPal customers page.
2. Click the extension icon.
3. Enter tax rate (example: `8.25`).
4. (Optional) Enter extra column titles separated by commas (example: `Route,Notes,Paid`).
5. Click **Start Export**.
6. A CSV file downloads automatically and can be opened in Google Sheets.

## Notes

- If a customer says `None Scheduled`, next mow date is left blank.
- The extension uses your current page DOM structure (`.customer-row`, `.name`, `.address`, `.type-schedule`, `.price-box .green-box`).
