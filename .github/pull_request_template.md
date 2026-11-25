<!-- Open pull requests into `dev`, from a branch named type/short-name (feature/, fix/, chore/, docs/, ci/, hotfix/). -->

Before: <!-- what a creator, a visitor or a developer saw until now -->

After: <!-- what they see with this change -->

How: <!-- a short paragraph: what changed in the code, and why this way -->

Closes #<!-- issue number -->

### Checklist

- [ ] `npm run check`, `npm run build` and the tests pass
- [ ] Uses `--site-*` tokens only, and works in light, dark and a creator's own theme
- [ ] A new block is built on `<Block>`, takes the look props, is in `src/system/registry.ts` and is exported from `src/index.ts`
- [ ] Words a visitor sees can be changed with a `labels` prop
- [ ] Links go through `SiteLink`; nothing a creator types can run code
- [ ] Works with a keyboard and a screen reader; tap targets are at least 40 px (44 px on touch)
- [ ] A story with a play function, on phone, tablet and desktop
- [ ] No keys, tokens or private data in the code, stories or screenshots
