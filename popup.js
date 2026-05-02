const statusEl = document.getElementById('status');
const taxRateEl = document.getElementById('taxRate');
const extraColsEl = document.getElementById('extraCols');

chrome.storage.sync.get(['taxRate', 'extraCols'], (saved) => {
  if (saved.taxRate !== undefined) taxRateEl.value = saved.taxRate;
  if (saved.extraCols) extraColsEl.value = saved.extraCols;
});

document.getElementById('startBtn').addEventListener('click', async () => {
  const taxRate = Number(taxRateEl.value || 0);
  const extraCols = extraColsEl.value.trim();

  chrome.storage.sync.set({ taxRate, extraCols });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(
    tab.id,
    { type: 'EXPORT_GREENPAL', taxRate, extraCols },
    (response) => {
      if (chrome.runtime.lastError) {
        statusEl.textContent = 'Open GreenPal customers page first.';
        return;
      }
      statusEl.textContent = response?.message || 'Done.';
    }
  );
});
