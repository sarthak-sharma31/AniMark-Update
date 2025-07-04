document.addEventListener('DOMContentLoaded', () => {
    clearInterval(window.lazyLoadInterval);
    const pageType = document.body.dataset.pageType;
    const animeContainer = document.querySelector('.anime-cards-container');
    const animeIdsElement = document.getElementById('animeIds');
    const loaderBox = document.querySelector('.loaderBox');

    if (!animeContainer || !animeIdsElement || !loaderBox) return;

    const animeIds = JSON.parse(animeIdsElement.dataset.ids);
    let loadedCount = 0;

    async function loadMoreAnime() {
    if (loadedCount >= animeIds.length) {
        clearInterval(window.lazyLoadInterval);
        return;
    }

    const animeId = animeIds[loadedCount];
    loadedCount++;

    try {
        await delay(950);

        const response = await fetch(`/api/anime/fetchAnime?id=${animeId}`);
        if (!response.ok) throw new Error(`Failed to load anime ${animeId}`);

        const html = await response.text();

        // ✅ Create a temporary wrapper to extract new card(s)
        const tempWrapper = document.createElement('div');
        tempWrapper.innerHTML = html.trim();

        const newCards = tempWrapper.querySelectorAll('.a-card');

        newCards.forEach(card => {
            // Append each new card
            animeContainer.appendChild(card);

            // Add click listener immediately
            card.addEventListener('click', async () => {
                try {
                    const statusRes = await fetch('/api/auth/status');

                    if (statusRes.ok) {
                        const animeId = card.dataset.id;
                        window.location.href = `/anime/${animeId}`;
                    } else {
                        openLoginModal();
                    }
                } catch (err) {
                    console.error('Error checking auth status:', err);
                    openLoginModal(); // Fallback
                }
            });
        });

        if (loadedCount >= animeIds.length) {
            loaderBox.style.display = 'none';
        }
    } catch (error) {
        console.error(`Error fetching anime (${pageType}):`, error);
    }
}




    if (window.lazyLoadInterval) clearInterval(window.lazyLoadInterval);
    window.lazyLoadInterval = setInterval(loadMoreAnime, 950);
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}