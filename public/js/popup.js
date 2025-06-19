let popupTimeout;

function showPopUp(result) {
	const title = result.title || "Message";
	const info = result.message || "Undefined";
	const messageBox = document.querySelector('.pop-up');
	const msgTitle = document.querySelector('.msg-title');
	const msgInfo = document.querySelector('.msg-info');

	// Set message content
	msgTitle.innerText = title;
	msgInfo.innerText = info;

	// Clear previous timeout and reset popup state
	clearTimeout(popupTimeout);
	messageBox.classList.remove('show');

	// Force reflow to restart animation
	void messageBox.offsetWidth;

	// Show the popup with fade-in
	messageBox.style.display = 'flex';
	messageBox.classList.add('show');

	// Set timeout for fade-out
	popupTimeout = setTimeout(() => {
		messageBox.classList.remove('show');

		// Wait for the fade-out transition to finish before hiding
		setTimeout(() => {
			messageBox.style.display = 'none';
		}, 300); // should match the CSS transition time
	}, 3000);
}
