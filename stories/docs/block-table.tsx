import { BLOCKS, BLOCK_GROUPS, isPaidPack, type BlockGroup } from '../../src';

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
  page: 'Page',
};

/*
 * Every block in the registry, by group, with what it's for, its grid kind,
 * whether it's free and how many settings it has. Read from BLOCKS, so this
 * page never falls behind the code.
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
