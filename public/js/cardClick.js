document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.a-card').forEach(card => {
		card.addEventListener('click', async () => {
		  try {
			const statusRes = await fetch('/api/auth/status');

			if (statusRes.ok) {
			  // User is logged in ✅
			  const animeId = card.dataset.id;
			  window.location.href = `/anime/${animeId}`;
			} else {
			  // Not logged in ❌ => show login popup
			  openLoginModal();
			}
		  } catch (err) {
			console.error('Error checking auth status:', err);
			openLoginModal(); // Fallback
		  }
		});
	  });

	  document.querySelectorAll('.slide-image-container').forEach(container => {
  container.addEventListener('click', async () => {
    try {
      const statusRes = await fetch('/api/auth/status');

      if (statusRes.ok) {
        const animeId = container.closest('.slide').dataset.id;
        window.location.href = `/anime/${animeId}`;
      } else {
        openLoginModal();
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      openLoginModal();
    }
  });
});

	  document.querySelectorAll('.slide-btn.detail').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault(); // prevent default link behavior
    try {
      const statusRes = await fetch('/api/auth/status');

      if (statusRes.ok) {
        const animeId = btn.closest('.slide').dataset.id;
        window.location.href = `/anime/${animeId}`;
      } else {
        openLoginModal();
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      openLoginModal();
    }
  });
});

});