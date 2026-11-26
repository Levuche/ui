import {
  BLOCKS,
  BLOCK_GROUPS,
  OUTSIDE_SERVICES,
  isPaidPack,
  type BlockGroup,
  type BlockPrivacy,
} from '../../src';

/** Each group's name in the editor's menu. */
const GROUP_NAMES: Record<BlockGroup, string> = {
  profile: 'Profile',
  links: 'Links',
  selling: 'Selling',
  offers: 'Offers',
  media: 'Media',
  trust: 'Trust',
  forms: 'Forms',
  feeds: 'Feeds',
  developer: 'Developer',
  text: 'Text',
  page: 'Page',
};

/** The sites a block loads from, and the most it may set. */
function loadsFrom(privacy: BlockPrivacy) {
  const sites = privacy.services.map((id) => OUTSIDE_SERVICES[id].name);
  const cookies =
    privacy.cookies === 'none' ? 'no cookies' : `cookies: ${privacy.cookies}`;
  return sites.length
    ? `${sites.join(', ')} (${cookies})`
    : `Nothing (${cookies})`;
}

/*
 * Every block in the registry, by group, with what it's for, its grid kind,
 * whether it's free, how many settings it has, what it loads from other
 * sites and how it works with a keyboard and a screen reader. Read from
 * BLOCKS, so this page never falls behind the code.
 */
export function BlockTable() {
  return (
    <div>
      {BLOCK_GROUPS.map((group) => {
        const blocks = BLOCKS.filter((block) => block.group === group);
        if (blocks.length === 0) return null;
        return (
          <section key={group}>
            <h3>
              {GROUP_NAMES[group]} ({blocks.length})
            </h3>
            <table>
              <thead>
                <tr>
                  <th>Block</th>
                  <th>What it's for</th>
                  <th>Grid kind</th>
                  <th>In Levuche</th>
                  <th>Settings</th>
                  <th>Loads from</th>
                  <th>Keyboard and screen reader</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block) => (
                  <tr key={block.id}>
                    <td>
                      <code>{block.component}</code>
                    </td>
                    <td>{block.summary}</td>
                    <td>{block.kind}</td>
                    <td>
                      {isPaidPack(block.pack)
                        ? `Paid (${block.pack} pack)`
                        : 'Free'}
                    </td>
                    <td>{block.settings.length}</td>
                    <td>{loadsFrom(block.privacy)}</td>
                    <td>
                      <p>{block.accessibility.keyboard}</p>
                      <p>{block.accessibility.screenReader}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}
