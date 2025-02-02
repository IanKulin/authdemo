# authdemo

Simplest possible Node/Express/Passport authentication setup to illustrate a blog post about using Passport

Don't use in production without
- checking the sessions and .users are outside of the public web root
- rate limiting the logon attempts
- dealing with CSRF attacks
- input validation
- error handling
- security headers etc...

