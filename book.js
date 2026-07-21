const form = document.getElementById('book-waitlist-form');
const toast = document.getElementById('book-toast');
const submitButton = form?.querySelector('button[type="submit"]');
const turnstileNode = form?.querySelector('.cf-turnstile');
let toastTimer;

function showToast(message, state = 'success') {
  if (!toast) return;
  toast.hidden = false;
  toast.dataset.state = state;
  toast.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
    toast.textContent = '';
  }, 5000);
}

function setLoading(isLoading) {
  if (!submitButton) return;
  submitButton.disabled = isLoading;
  submitButton.classList.toggle('is-loading', isLoading);
  submitButton.textContent = isLoading ? 'Joining...' : 'Join the Waitlist';
}

function updateTurnstileTheme() {
  if (!turnstileNode) return;
  turnstileNode.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

async function submitWaitlist(event) {
  event.preventDefault();
  if (!form) return;

  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim();
  const firstName = String(formData.get('first_name') || '').trim();
  const company = String(formData.get('company') || '').trim();
  const turnstileToken = String(formData.get('cf-turnstile-response') || '').trim();

  if (!email) {
    showToast('Please add your email address first.', 'error');
    return;
  }

  if (!turnstileToken) {
    showToast('Please complete the spam check first.', 'error');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('/api/book-waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        company,
        turnstileToken,
        source_page: '/book'
      })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || 'Something went wrong. Please try again.');
    }

    form.reset();
    if (window.turnstile) {
      window.turnstile.reset();
    }
    showToast(payload.message || 'You are on the waitlist now. Thank you for joining me early.');
  } catch (error) {
    showToast(error.message || 'Something went wrong. Please try again.', 'error');
  } finally {
    setLoading(false);
  }
}

if (form) {
  form.addEventListener('submit', submitWaitlist);
}

updateTurnstileTheme();

const observer = new MutationObserver(updateTurnstileTheme);
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
