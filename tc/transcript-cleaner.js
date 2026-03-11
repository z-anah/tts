// transcript-cleaner.js

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('cleanerInput');
  const copyBtn = document.getElementById('copyBtn');
  const status = document.getElementById('copyStatus');
  const charCount = document.getElementById('charCount');

  function updateCharCount() {
    charCount.textContent = `${textarea.value.length} characters`;
  }

  // Replace Enter with space as user types or pastes
  textarea.addEventListener('input', () => {
    const newValue = textarea.value.replace(/\n/g, ' ');
    if (textarea.value !== newValue) {
      textarea.value = newValue;
    }
    updateCharCount();
  });

  // Initial count
  updateCharCount();

  // Copy to clipboard
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(textarea.value);
      status.textContent = 'Copied to clipboard!';
      status.classList.remove('text-red-600');
      status.classList.add('text-green-600', 'dark:text-green-400');
    } catch (err) {
      status.textContent = 'Failed to copy.';
      status.classList.remove('text-green-600', 'dark:text-green-400');
      status.classList.add('text-red-600');
    }
    setTimeout(() => { status.textContent = ''; }, 1500);
  });
});
