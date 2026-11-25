# Security

Levuche UI renders what creators type (links, colours, fonts and text) on
pages anyone can visit, so we take problems that let that content do harm
seriously.

## Reporting a problem

Please report it privately: on the repository's **Security** tab, choose
**Report a vulnerability**
([direct link](https://github.com/Levuche/ui/security/advisories/new)).
Don't open a public issue, discussion or pull request about it.

Tell us:

- which block or function, and which version (tag)
- what someone could do with it
- the steps or the smallest code that shows it

## What happens next

- We confirm we've got it within 3 working days.
- We tell you what we found and our plan within 10 working days.
- We fix it on a private branch, release a new tag, and then publish the
  advisory. We credit you, unless you'd rather we didn't.

## Versions

Fixes go into the latest release. Apps pin a tag
(`github:Levuche/ui#v0.1.0`), so the advisory says which tag to move to.

## Examples of what counts

- A creator's link, colour, font or text that runs script, loads something
  it shouldn't, or breaks out of its block
- A block that sends visitor data somewhere the creator didn't choose
- A dependency with a known vulnerability that affects the blocks

Out of scope: problems in the Levuche apps themselves (report those in the
app's own repository) and findings from automated scanners with no way to
use them.
