# Book Undo — Code of Conduct

Book Undo exists so books move between people instead of sitting unused — donated, borrowed, exchanged, sponsored to schools, and discovered on a map. Everyone who works on the project, reports issues, or runs a deployment is part of that same idea: **more people reading, fewer books wasted.**

This document describes how we expect people to behave in Book Undo spaces (GitHub, discussions, demos, and events where the project is represented).

## What we stand for

- **Access over hoarding.** The product is built around sharing. Contributions should make it easier for real communities to list, find, and pass on books — not harder.
- **Trust on the ground.** Donors, borrowers, school sponsors, and library curators rely on honest listings and respectful contact. Code and copy should support that trust, not undermine it.
- **Moderation with care.** Admins approve books, libraries, digital titles, and sponsorships before they go public (or can be configured to). People working on admin features should treat approval workflows and user-submitted data responsibly.
- **Privacy by default.** Listings can include names, contact details, and location. Do not scrape, expose, or reuse contributor data from issues, logs, or screenshots. Never commit real `.env` secrets or production database dumps.
- **Room for every reader.** Book Undo serves neighbourhoods, classrooms, and libraries with different languages, boards, and formats. Be respectful in reviews and discussions — especially when feedback touches regional content, school needs, or how families access books.

## Expected behaviour

**Do**

- Give clear, kind feedback on pull requests and issues.
- Explain *why* a change helps donors, borrowers, schools, or admins — not only that it compiles.
- Test flows that touch real user journeys: donate → manage link, borrow request → status update, library report → admin approval.
- Report bugs with enough detail to reproduce (page, action, browser, whether MongoDB was seeded).
- Credit others when you build on their work.

**Don't**

- Harass, insult, or discriminate against anyone participating in the project.
- Share private manage tokens, borrow request links, or admin credentials in public threads.
- Submit fake listings, spam sponsorships, or test data that could be mistaken for real schools or libraries in a shared demo.
- Open public GitHub issues for security problems — use [SECURITY.md](SECURITY.md) instead.
- Dismiss contributions because someone is new to Next.js, MongoDB, or open source.

## Scope

This applies to:

- This repository and its issue tracker, pull requests, and discussions
- Maintainers and contributors representing Book Undo in public
- Community members testing or demoing the app together

It does not replace the rules of a **self-hosted instance** you run for your town or school. Deployments should set their own local policies for end users; this document governs collaboration on the **open source project**.

## Running your own instance

Forks and deployments are welcome. If you operate Book Undo for a community:

- Change default admin credentials before going live.
- Tell your users how listings, borrows, and sponsorships are moderated on *your* site.
- Do not imply your deployment is officially operated by the upstream maintainers unless that is true.

## Reporting concerns

If someone’s behaviour in project spaces makes you uncomfortable or violates this code:

1. Note what happened, where (issue/PR/discussion), and when.
2. Contact a repository maintainer privately — via GitHub if no other channel is listed.
3. Maintainers will review the report, may ask for more context, and will decide on a proportionate response (warning, comment removal, issue closure, or ban from project spaces).

Retaliation against anyone who reports in good faith is not acceptable.

## Maintainer responsibilities

Maintainers keep the repository usable for contributors: triage issues, review PRs, protect `main`, and enforce this code when needed. They are not required to merge every contribution, but they should explain blocking feedback when possible.

---

By participating in Book Undo, you agree to follow this code. Thank you for helping keep books — and this project — in circulation.
