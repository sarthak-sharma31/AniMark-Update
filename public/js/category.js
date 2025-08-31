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


    const loaderBox = document.querySelector('.loaderBox');
    addClick();
    function addClick(){
        document.querySelectorAll('.a-card').forEach(card => {
            card.addEventListener('click', () => {
                const animeId = card.dataset.id;
                window.location.href = `/anime/${animeId}`;
            });
        });
    }
    let currentPage = 1;
    let isLoading = false; // Prevent multiple requests at the same time
    const animeCardsContainer = document.querySelector('.anime-cards-container');

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            if (!isLoading) {
                isLoading = true; // Mark as loading
                loaderBox.style.display = 'block';
                setTimeout(loadMoreAnimes, 2000); // Add 2-second delay before fetching
                addClick();
            }
        }
    });

    async function loadMoreAnimes() {
        currentPage++;
        addClick();
        try {
            const response = await fetch(`/category/new?page=${currentPage}`);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const html = await response.text();
            animeCardsContainer.insertAdjacentHTML('beforeend', html);
            addClick();
        } catch (error) {
            console.error('Error fetching more anime data:', error);
        } finally {
            isLoading = false; // Allow new requests after completion
            loaderBox.style.display = 'none';
        }
    }
});