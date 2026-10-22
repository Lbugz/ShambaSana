(() => {
  const status = document.querySelector('#share-status');
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-share-url], [data-copy-url]');
    if (!button) return;
    const url = button.dataset.shareUrl || button.dataset.copyUrl;
    try {
      if (button.dataset.shareUrl && navigator.share) {
        await navigator.share({ title: button.dataset.shareTitle, text: 'Register with the Shamba Sana Institute. Admission is reviewed before payment.', url });
        status.textContent = 'Registration link shared.';
      } else {
        await navigator.clipboard.writeText(url);
        status.textContent = 'Link copied. Paste it into your message.';
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      const field = button.closest('article').querySelector('input');
      field.focus(); field.select();
      status.textContent = 'Select and copy the link above to send it.';
    }
  });
})();
