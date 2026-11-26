import { useId, type ReactNode } from 'react';
import {
  SiteInput,
  SiteTextarea,
  settingIcon,
  settingsPanel,
  siteInputClasses,
  type SettingField,
} from '../src';
import * as ui from '../src';

/*
 * A rough preview of the settings panel the page editor (Levuche/app) builds
 * from a block's settings: one control per field, then the shared look. Not
 * part of the package: the editor draws its own, with its own controls for
 * pictures, products, lists and colours.
 */

const asText = (value: unknown) =>
  value === undefined || value === null ? undefined : String(value);

/** Small notes beside a field's label: its icon, and how the editor treats it. */
function Marks({ field }: { field: SettingField }) {
  const marks = [
    `icon: ${settingIcon(field)}`,
    field.required ? 'required' : null,
    field.slow ? 'waits until typing stops' : null,
    field.type === 'link' && field.main ? 'pasted links go here' : null,
    field.forApp ? 'read by the app' : null,
  ].filter(Boolean);
  return (
    <span className="text-site-text-2 text-xs font-normal">
      {' '}
      ({marks.join(', ')})
    </span>
  );
}

function Help({ id, field }: { id: string; field: SettingField }) {
  return field.help ? (
    <p id={id} className="text-site-text-2 m-0 text-xs">
      {field.help}
    </p>
  ) : null;
}

function Label({ htmlFor, field }: { htmlFor: string; field: SettingField }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold">
      {field.label}
      <Marks field={field} />
    </label>
  );
}

function Group({
  field,
  children,
}: {
  field: SettingField;
  children: ReactNode;
}) {
  return (
    <fieldset
      className="border-site-border rounded-block-inner m-0 flex flex-col gap-3 border-2 p-3"
      data-setting={field.name}
    >
      <legend className="px-1 text-sm font-semibold">
        {field.label}
        <Marks field={field} />
      </legend>
      {field.help ? (
        <p className="text-site-text-2 m-0 text-xs">{field.help}</p>
      ) : null}
      {children}
    </fieldset>
  );
}

const INPUT_TYPES: Partial<Record<SettingField['type'], string>> = {
  link: 'url',
  number: 'number',
  dateTime: 'datetime-local',
  picture: 'url',
};

function Control({ field }: { field: SettingField }) {
  const id = useId();
  const helpId = `${id}-help`;
  const described = field.help ? helpId : undefined;
  const fallback = 'default' in field ? field.default : undefined;

  switch (field.type) {
    case 'toggle':
      return (
        <div className="flex flex-col gap-1" data-setting={field.name}>
          <span className="flex items-center gap-2">
            <input
              id={id}
              type="checkbox"
              defaultChecked={field.default === true}
              aria-describedby={described}
              className="accent-site-button size-6"
            />
            <Label htmlFor={id} field={field} />
          </span>
          <Help id={helpId} field={field} />
        </div>
      );
    case 'choice':
      if (field.multiple) {
        return (
          <Group field={field}>
            <div className="flex flex-wrap gap-3">
              {field.options.map((option) => (
                <label
                  key={String(option)}
                  className="flex min-h-10 items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="accent-site-button size-6"
                  />
                  {field.optionLabels?.[String(option)] ?? String(option)}
                </label>
              ))}
            </div>
          </Group>
        );
      }
      return (
        <div className="flex flex-col gap-1" data-setting={field.name}>
          <Label htmlFor={id} field={field} />
          <select
            id={id}
            defaultValue={asText(fallback) ?? ''}
            aria-describedby={described}
            className={siteInputClasses()}
          >
            {fallback === undefined ? <option value="">Not set</option> : null}
            {field.options.map((option) => (
              <option key={String(option)} value={String(option)}>
                {field.optionLabels?.[String(option)] ?? String(option)}
              </option>
            ))}
          </select>
          <Help id={helpId} field={field} />
        </div>
      );
    case 'list':
      return (
        <Group field={field}>
          {field.fields ? (
            <Group field={{ ...field, label: field.itemLabel ?? 'Item' }}>
              {field.fields.map((inner) => (
                <Control key={inner.name} field={inner} />
              ))}
            </Group>
          ) : (
            <Control
              field={{
                name: `${field.name}-item`,
                label: field.itemLabel ?? 'Item',
                type: field.of ?? 'text',
              }}
            />
          )}
        </Group>
      );
    case 'group':
      return (
        <Group field={field}>
          {field.fields.map((inner) => (
            <Control key={inner.name} field={inner} />
          ))}
        </Group>
      );
    case 'words': {
      const words = (ui as Record<string, unknown>)[field.from];
      return (
        <Group field={field}>
          {Object.entries(words as Record<string, unknown>).map(
            ([key, value]) => (
              <Control
                key={key}
                field={{
                  name: key,
                  label: key,
                  type: 'text',
                  default: typeof value === 'string' ? value : undefined,
                }}
              />
            )
          )}
        </Group>
      );
    }
    case 'longText':
      return (
        <div className="flex flex-col gap-1" data-setting={field.name}>
          <Label htmlFor={id} field={field} />
          <SiteTextarea
            id={id}
            rows={2}
            defaultValue={field.default}
            aria-describedby={described}
          />
          <Help id={helpId} field={field} />
        </div>
      );
    default:
      return (
        <div className="flex flex-col gap-1" data-setting={field.name}>
          <Label htmlFor={id} field={field} />
          <SiteInput
            id={id}
            type={INPUT_TYPES[field.type] ?? 'text'}
            defaultValue={asText(fallback)}
            readOnly={field.type === 'product'}
            placeholder={
              field.type === 'product' ? 'Picked from your store' : undefined
            }
            aria-describedby={described}
          />
          <Help id={helpId} field={field} />
        </div>
      );
  }
}

/** The panel's fields for one block, from its entry in BLOCKS. */
export function SettingsPreview({ block }: { block: string }) {
  const panel = settingsPanel(block);
  if (!panel) return <p>No block called {block}.</p>;
  return (
    <form
      aria-label={`Settings for ${block}`}
      className="bg-site-surface text-site-text rounded-block p-block gap-block-gap flex max-w-md flex-col"
      onSubmit={(event) => event.preventDefault()}
    >
      <section className="flex flex-col gap-3" data-section="settings">
        <h2 className="m-0 text-base font-semibold">Block</h2>
        {panel.settings.map((field) => (
          <Control key={field.name} field={field} />
        ))}
      </section>
      <section className="flex flex-col gap-3" data-section="look">
        <h2 className="m-0 text-base font-semibold">Look</h2>
        {panel.look.map((field) => (
          <Control key={field.name} field={field} />
        ))}
      </section>
    </form>
  );
}
