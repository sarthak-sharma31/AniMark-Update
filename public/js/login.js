document.getElementById('loginForm').addEventListener('submit', async function (e) {
	e.preventDefault();

	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;

	try {
		const response = await fetch('/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email, password })
		});

		const data = await response.json();

		if (data.status === 200) {
			closeLoginModal(); // ✅
			window.location.reload(); // ✅ force session re-check
		}else {
			alert(data.message);
		}
	} catch (err) {
		console.error('Login error:', err);
		alert("Login failed. Try again.");
	}
});


//Register Here

document.getElementById('registerForm').addEventListener('submit', async (event) => {
	event.preventDefault();

	const username = document.getElementById('username').value;
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;

	const response = await fetch('/api/auth/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, email, password })
	});

	if (response.ok) {
		const data = await response.json();
		localStorage.setItem('token', data.token);
		window.location.href = '/';
	} else {
		alert('Registration failed');
	}
});


async function handleNavigation(event, route) {
	event.preventDefault();

	try {
		const response = await fetch('/api/auth/check-auth', {
			method: 'GET',
			credentials: 'include' // VERY important for cookies
		});

		if (response.ok) {
			window.location.href = route;
		} else {
			openLoginModal();
		}
	} catch (err) {
		console.error('Auth check failed:', err);
		openLoginModal();
	}
}


function openLoginModal() {
	document.querySelector('.loginPopup').style.display = 'block';
	document.querySelector('.loginHere').style.display = 'block';
	document.querySelector('.registerHere').style.display = 'none';
}

function closeLoginModal() {
	document.querySelector('.loginPopup').style.display = 'none';
}

function toggleForm(type) {
	if (type === 'register') {
		document.querySelector('.loginHere').style.display = 'none';
		document.querySelector('.registerHere').style.display = 'block';
	} else {
		document.querySelector('.loginHere').style.display = 'block';
		document.querySelector('.registerHere').style.display = 'none';
	}
}