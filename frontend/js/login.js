document.getElementById('register-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const usernameEl = document.getElementById('register-username');
    const passwordEl = document.getElementById('register-password');

    const username = usernameEl.value;
    const password = passwordEl.value;


    const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'same-origin',
    })

    // *if the registration worked
    if (response.ok) {
        window.location.href = '/frontend/html/login.html';
        return;
    }

    // *if registration did not work

    const data = await response.text();
    const error = document.createElement('p');
    error.style.color = 'red';
    error.textContent = data;

    document.getElementById('error-container').innerHTML = '';
    document.getElementById('error-container').appendChild(error);

    usernameEl.value = '';
    passwordEl.value = '';
});

    // LOGIN

    document.getElementById('login-form').addEventListener('submit', async function (event) {
        event.preventDefault();

        const usernameEl = document.getElementById('login-username');
        const passwordEl = document.getElementById('login-password');

        const username = usernameEl.value;
        const password = passwordEl.value;

        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });

        if (response.ok) {
            window.location.href = '/';
            return;
        }

        const data = await response.text();
        const error = document.createElement('p');
        error.style.color = 'red';
        error.textContent = data;

        document.getElementById('error-container').innerHTML = '';
        document.getElementById('error-container').appendChild(error);

        usernameEl.value = '';
        passwordEl.value = '';
    });