document.addEventListener('DOMContentLoaded', () => {
	const animeId = window.location.pathname.split('/').pop();
	const watchlistBtn = document.getElementById('watchlist-btn');
	const markBtn = document.getElementById('mark-btn');
	const clearAllEpisodesBtn = document.getElementById('clear-all-episodes-btn');
	const episodeButtons = document.querySelectorAll('.episode-btn');
	const episodeRangeDropdown = document.getElementById('episode-range');
	const episodesContainer = document.getElementById('episodes-container');

	function filterEpisodes() {
	  const [start, end] = episodeRangeDropdown.value.split('-').map(Number);
	  episodeButtons.forEach(button => {
		const episodeNumber = Number(button.getAttribute('data-episode'));
		button.style.display = (episodeNumber >= start && episodeNumber <= end) ? 'inline-block' : 'none';
	  });
	}

	episodeRangeDropdown.addEventListener('change', filterEpisodes);
	filterEpisodes(); // Initial filter

	watchlistBtn.addEventListener('click', async () => {
	  const inWatchlist = watchlistBtn.getAttribute('data-in-watchlist') === 'true';
	  try {
		const response = await fetch('/api/user/watchlist', {
		  method: inWatchlist ? 'DELETE' : 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ animeId })
		});
		const result = await response.json();
		showPopUp(result);
		watchlistBtn.textContent = inWatchlist ? 'Add to Watchlist' : 'Remove from Watchlist';
		watchlistBtn.setAttribute('data-in-watchlist', !inWatchlist);
	  } catch (error) {
		console.error(error);
		showPopUp({ title: 'Error', message: `Failed to ${inWatchlist ? 'remove from' : 'add to'} watchlist.` });
	  }
	});

	markBtn.addEventListener('click', async () => {
	  const isMarked = markBtn.getAttribute('data-marked') === 'true';
	  try {
		const response = await fetch('/api/user/markedAnime', {
		  method: isMarked ? 'DELETE' : 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ animeId })
		});
		const result = await response.json();
		showPopUp(result);
		markBtn.textContent = isMarked ? 'Mark Anime' : 'UnMark Anime';
		markBtn.setAttribute('data-marked', !isMarked);
	  } catch (error) {
		console.error(error);
		showPopUp({ title: 'Error', message: `Failed to ${isMarked ? 'unmark' : 'mark'} anime.` });
	  }
	});

	episodeButtons.forEach(button => {
		button.addEventListener('click', async () => {
		  const episodeNumber = parseInt(button.getAttribute('data-episode'));
		  try {
			const response = await fetch('/api/user/ongoingAnime', {
			  method: 'POST',
			  headers: { 'Content-Type': 'application/json' },
			  body: JSON.stringify({ animeId, lastWatchedEpisode: episodeNumber })
			});
			const result = await response.json();
			showPopUp(result);

			// Explicitly add/remove watched class
			episodeButtons.forEach(btn => {
			  const epNum = parseInt(btn.getAttribute('data-episode'));
			  if (epNum <= episodeNumber) {
				btn.classList.add('watched');
			  } else {
				btn.classList.remove('watched');
			  }
			});

			if (episodeNumber === episodeButtons.length) {
			  markBtn.textContent = 'Mark Anime';
			  markBtn.setAttribute('data-marked', false);
			} else {
			  markBtn.textContent = 'UnMark Anime';
			  markBtn.setAttribute('data-marked', true);
			}
		  } catch (error) {
			console.error(error);
			showPopUp({ title: 'Error', message: 'Failed to mark episode.' });
		  }
		});
	  });


	clearAllEpisodesBtn.addEventListener('click', async () => {
	  try {
		const response = await fetch('/api/user/clear-all-episodes', {
		  method: 'DELETE',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ animeId })
		});
		const result = await response.json();
		showPopUp(result);

		if (response.ok) {
		  episodeButtons.forEach(btn => btn.classList.remove('watched'));
		  markBtn.textContent = 'Mark Anime';
		  markBtn.setAttribute('data-marked', false);
		}
	  } catch (error) {
		console.error(error);
		showPopUp({ title: 'Error', message: 'Failed to clear all episodes.' });
	  }
	});

	document.getElementById('comment-form').addEventListener('submit', async (event) => {
	  event.preventDefault();
	  const commentText = document.getElementById('comment-text').value;
	  try {
		const response = await fetch('/api/comments', {
		  method: 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({ animeId, comment: commentText })
		});
		const result = await response.json();
		showPopUp(result);
		document.getElementById('comment-text').value = '';
		loadComments();
	  } catch (error) {
		console.error(error);
		showPopUp({ title: 'Error', message: 'Failed to add comment' });
	  }
	});

	async function loadComments() {
	  try {
		const response = await fetch(`/api/comments/${animeId}`);
		const comments = await response.json();
		const commentsContainer = document.getElementById('comments-container');
		commentsContainer.innerHTML = '';
		comments.forEach(comment => {
		  const commentElement = document.createElement('div');
		  commentElement.classList.add('comment');
		  commentElement.innerHTML = `
			<p><strong>${comment.username}</strong> (${new Date(comment.date).toLocaleString()}):</p>
			<p>${comment.comment}</p>
			<button class="delete-comment" data-comment-id="${comment._id}">🗑️</button>
		  `;
		  commentsContainer.appendChild(commentElement);
		});

		document.querySelectorAll('.delete-comment').forEach(button => {
		  button.addEventListener('click', async (event) => {
			const commentId = event.target.getAttribute('data-comment-id');
			if (!commentId) return;
			await deleteComment(commentId);
		  });
		});
	  } catch (error) {
		console.error(error);
		showPopUp({ title: 'Error', message: 'Failed to fetch comments.' });
	  }
	}

	async function deleteComment(commentId) {
	  try {
		const response = await fetch(`/api/comments/${commentId}`, {
		  method: 'DELETE',
		  headers: { 'Content-Type': 'application/json' }
		});
		const result = await response.json();
		showPopUp(result);
		loadComments();
	  } catch (error) {
		console.error(error);
		showPopUp({ title: 'Error', message: 'Failed to delete comment.' });
	  }
	}

	loadComments();
  });
