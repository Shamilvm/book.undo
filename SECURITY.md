# Security policy

## Supported versions

Security fixes are applied to the latest release on the `main` branch.

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security issue, report it privately by:

1. Opening a [GitHub Security Advisory](https://github.com/Shamilvm/book.undo/security/advisories/new) (preferred), or
2. Contacting the repository maintainers through GitHub with minimal details and asking for a private channel.

Include:

- A description of the vulnerability and its impact
- Steps to reproduce
- Affected versions or commits, if known
- Any suggested fix, if you have one

We will acknowledge your report as soon as possible and work on a fix. We ask that you allow reasonable time for a patch before public disclosure.

## Security practices for deployments

When self-hosting Book Undo:

- Change default `ADMIN_USERNAME` and `ADMIN_PASSWORD` before going to production
- Set a strong, unique `ADMIN_SECRET`
- Use TLS (HTTPS) in production
- Restrict MongoDB network access and use authentication
- Keep dependencies updated (`npm audit`)
