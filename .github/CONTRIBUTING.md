# Contributing to Levuche UI

Thanks for helping make the blocks on Levuche pages better. Reports, ideas,
fixes and new blocks are all welcome.

## Where things go

| You want to…                                   | Go to                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Ask how to do something, or which block to use | [Discussions › Q&A](https://github.com/Levuche/ui/discussions)                             |
| Share an idea that isn't ready to be an issue  | [Discussions › Ideas](https://github.com/Levuche/ui/discussions)                           |
| Report something broken                        | [New issue › Something is broken](https://github.com/Levuche/ui/issues/new/choose)         |
| Report an accessibility problem                | [New issue › Accessibility problem](https://github.com/Levuche/ui/issues/new/choose)       |
| Ask for a new block or option                  | [New issue › Ask for a block or a change](https://github.com/Levuche/ui/issues/new/choose) |
| Report a security problem                      | Privately, as [SECURITY.md](SECURITY.md) says. Never in a public issue.                    |

Please search open issues and discussions first. A thumbs-up on an existing
issue tells us more people need it, and is better than a "+1" comment.

## How issues move

- **New issues** are read and labelled, usually within a few working days.
- **`good first issue`** marks small, well-described work for a first pull
  request. **`help wanted`** marks work we'd welcome help with.
- **`priority: high`** goes first. Accessibility and security problems are
  always high.
- An issue that needs more detail gets a question. If nobody answers in two
  weeks, it's closed; it can be reopened any time.

## Making a change

1. For anything bigger than a small fix, comment on the issue first, so
   nobody does the same work twice and we can agree on the approach.
2. Fork the repository and branch from `dev` as `type/short-name`:
   `feature/`, `fix/`, `chore/`, `docs/`, `ci/` or `hotfix/`, for example
   `fix/tip-jar-focus`.
3. Set up and run the checks (see "Work on it" in the [README](../README.md)):

   ```bash
   npm ci
   npm run check
   npm run build
   npx playwright install chromium
   npm run test:e2e
   npm run test:stories
   ```

4. Follow "Adding a block" in the README for a new block: built on the shared
   look, `--site-*` tokens only, words in a `labels` prop, links through
   `SiteLink`, a story with a play function, and a test of what it does.
5. Open a pull request into `dev` and fill in the template. CI runs the
   checks, the end-to-end tests and every story's accessibility test, and
   Storybook builds a preview of your change.
6. A maintainer reviews it. Pull requests into `dev` are squashed when merged,
   so the title becomes the commit message: write it as what the change does,
   as "Tip jar keeps focus on the picked amount".

## What we look for

- **It works for everyone.** WCAG 2.2 AA, keyboard and screen reader, 40 px
  tap targets with a mouse and 44 px on touch, and nothing that moves for
  visitors who ask for less motion.
- **The creator can change it.** Colours, size, corners and words come from
  props and the theme, never hard-coded.
- **It's safe with what creators type.** Addresses, colours and fonts are
  checked before they reach the page.
- **It's small.** Blocks render on the server where they can; add
  `'use client'` only for state. New dependencies need a good reason; say
  why in the pull request.
- **Plain words.** Docs, labels and messages are short and clear.

## Licence of contributions

This repository is not open source: see [LICENSE](../LICENSE). By opening a
pull request you confirm the work is your own and agree that it can be used
under the same terms as the rest of the repository.

## Be kind

Everyone taking part follows our [Code of Conduct](CODE_OF_CONDUCT.md).
