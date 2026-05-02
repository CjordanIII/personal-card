function csvEscape(value) {
  const text = String(value ?? '');
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return '"' + text.replaceAll('"', '""') + '"';
  }
  return text;
}

function parsePrice(text) {
  const num = Number((text || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : 0;
}

function getRows() {
  const rows = [...document.querySelectorAll('.customer-boxes .customer-row')];
  return rows.map((row) => {
    const name = row.querySelector('.name')?.textContent?.trim() || '';
    const address = row.querySelector('.address')?.textContent?.trim() || '';
    const schedule = row.querySelector('.type-schedule')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const nextMowMatch = schedule.match(/Next mowing\s+([0-9/]+)/i);
    const nextMowDate = nextMowMatch ? nextMowMatch[1] : '';
    const priceText = row.querySelector('.price-box .green-box')?.textContent?.trim() || '';
    const baseCharge = parsePrice(priceText);

    return {
      exportDate: new Date().toLocaleDateString('en-US'),
      customerName: name,
      customerAddress: address,
      nextMowDate,
      schedule,
      baseCharge
    };
  });
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== 'EXPORT_GREENPAL') return;

  const taxRate = Number(msg.taxRate || 0);
  const extras = (msg.extraCols || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  const data = getRows();
  if (!data.length) {
    sendResponse({ message: 'No customer rows found.' });
    return;
  }

  const headers = [
    'Export Date',
    'Customer Name',
    'Customer Address',
    'Next Mow Date',
    'Schedule',
    'Base Charge',
    'Tax Rate %',
    'Tax Amount',
    'Total Charge (With Tax)',
    ...extras
  ];

  const lines = [headers.map(csvEscape).join(',')];

  for (const row of data) {
    const taxAmount = +(row.baseCharge * (taxRate / 100)).toFixed(2);
    const totalWithTax = +(row.baseCharge + taxAmount).toFixed(2);

    const values = [
      row.exportDate,
      row.customerName,
      row.customerAddress,
      row.nextMowDate,
      row.schedule,
      row.baseCharge.toFixed(2),
      taxRate.toFixed(2),
      taxAmount.toFixed(2),
      totalWithTax.toFixed(2),
      ...extras.map(() => '')
    ];

    lines.push(values.map(csvEscape).join(','));
  }

  downloadCsv(`greenpal-customers-${new Date().toISOString().slice(0, 10)}.csv`, lines.join('\n'));
  sendResponse({ message: `Exported ${data.length} customers to CSV.` });
});
