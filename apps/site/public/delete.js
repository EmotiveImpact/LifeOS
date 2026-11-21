// Deletes a Life account from the web, for people who no longer have the app (Google Play's account deletion rule).
// The same three calls the app makes: an emailed code, signing in with it, then POST /account/delete. The session
// token lives only in this page's memory and is gone when the page closes.
(function () {
  var meta = document.querySelector('meta[name="life-api"]');
  var api = meta ? meta.getAttribute('content').trim().replace(/\/+$/, '') : '';
  if (!/^https:\/\//.test(api)) return; // Not set up yet: the page offers email only.

  var box = document.getElementById('by-code');
  var stepEmail = document.getElementById('step-email');
  var stepCode = document.getElementById('step-code');
  var emailInput = document.getElementById('email');
  var codeInput = document.getElementById('code');
  var status = document.getElementById('status');
  var sentTo = document.getElementById('sent-to');
  var email = '';
  box.hidden = false;

  function say(text) { status.textContent = text; }
  function busy(form, on) { Array.prototype.forEach.call(form.querySelectorAll('button, input'), function (el) { el.disabled = on; }); }
  function post(path, body, token) {
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    return fetch(api + path, { method: 'POST', headers: headers, body: JSON.stringify(body), credentials: 'omit' });
  }

  stepEmail.addEventListener('submit', function (event) {
    event.preventDefault();
    email = emailInput.value.trim().toLowerCase();
    if (!email) return;
    busy(stepEmail, true); say('Sending a code…');
    post('/auth/email-otp/send-verification-otp', { email: email, type: 'sign-in' }).then(function (response) {
      if (!response.ok) throw new Error('send');
      stepEmail.hidden = true; stepCode.hidden = false;
      sentTo.textContent = 'We sent a six-digit code to ' + email + '. It works for 10 minutes.';
      say(''); codeInput.focus();
    }).catch(function () {
      say('The code couldn’t be sent. Try again in a moment, or email us instead.');
    }).then(function () { busy(stepEmail, false); });
  });

  stepCode.addEventListener('submit', function (event) {
    event.preventDefault();
    var code = codeInput.value.replace(/\D/g, '');
    if (code.length !== 6) { say('The code has six digits.'); return; }
    if (!window.confirm('Delete your Life account? It closes now and is deleted for good after 30 days.')) return;
    busy(stepCode, true); say('Checking the code…');
    post('/auth/sign-in/email-otp', { email: email, otp: code }).then(function (response) {
      var token = response.headers.get('set-auth-token');
      if (!response.ok || !token) throw new Error('code');
      say('Deleting…');
      return post('/account/delete', { confirm: 'DELETE' }, token);
    }).then(function (response) {
      if (!response.ok) throw new Error('delete');
      return response.json();
    }).then(function (result) {
      var when = result && result.deleteAfter ? new Date(result.deleteAfter) : null;
      var date = when && !isNaN(when.getTime()) ? when.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'in 30 days';
      stepCode.hidden = true;
      say('Your account is closed and you’re signed out everywhere. Everything will be deleted on ' + date + '. Signing in before then reopens it.');
    }).catch(function (error) {
      busy(stepCode, false);
      say(error && error.message === 'code'
        ? 'That code didn’t work. Check it, or go back and send a new one.'
        : 'Your account wasn’t deleted. Try again in a moment, or email us instead.');
    });
  });
})();
