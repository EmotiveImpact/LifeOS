// Maestro script: the newest sign-in code the local API printed for EMAIL, served by sync/codes.js.
const response = http.get(CODES_URL + '/code?email=' + encodeURIComponent(EMAIL));
if (response.status !== 200) throw new Error('No sign-in code for ' + EMAIL + ' yet');
output.code = json(response.body).code;
