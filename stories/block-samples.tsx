import { createElement, type ComponentType } from 'react';
import * as ui from '../src';
import { BLOCKS, type BlockInfo, type SettingField } from '../src';

/*
 * Every block in the registry, built from its own settings the way the page
 * editor adds a new one: each field's default, and a plain sample for every
 * field the block needs. Read from BLOCKS, so a block added later is here
 * too, with no sample written by hand. Links go to example.com, pictures are
 * drawn here, and blocks that show another service's data are loading.
 */

/** A plain square picture, drawn here so nothing loads from another site. */
export const SAMPLE_PICTURE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#c2410c"/></svg>'
)}`;

/** Text a block reads as more than words: these must be real values. */
const SAMPLE_TEXT: Record<string, string> = {
  timeZone: 'Asia/Kolkata',
  to: '+91 98765 43210',
  price: '$12',
  code: 'ORIGINS10',
  duration: '30 min',
};

const PRODUCTS = {
  item: { itemId: 'item_1', variantId: 'variant_1', priceId: 'price_1' },
  plan: { planVersionId: 'plan_1' },
  credits: { creditPackageId: 'credits_1' },
} as const;

const slug = (name: string) => name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

/**
 * A sample value for one field, or undefined to leave it out: its default,
 * else a sample when the block needs it. Links and products are always
 * filled in, so every link and buy button is there to press.
 */
export function sampleValue(field: SettingField, n = 1): unknown {
  if (field.forApp || field.type === 'words') return undefined;
  if ('default' in field && field.default !== undefined) return field.default;
  switch (field.type) {
    case 'link':
      return `https://example.com/${slug(field.name)}/${n}`;
    case 'product':
      return PRODUCTS[field.sells[0]];
    case 'text':
    case 'longText':
      return field.required
        ? (SAMPLE_TEXT[field.name] ?? `${field.label} ${n}`)
        : undefined;
    case 'number':
      return field.required ? (field.min ?? 1) : undefined;
    case 'choice':
      return field.required
        ? field.multiple
          ? [field.options[0]]
          : field.options[0]
        : undefined;
    case 'toggle':
      return field.required ? false : undefined;
    case 'colour':
      return field.required ? '#0f766e' : undefined;
    case 'dateTime':
      return field.required ? '2030-01-01T09:00:00Z' : undefined;
    case 'picture':
      return field.required ? SAMPLE_PICTURE : undefined;
    case 'group':
      return field.required
        ? sampleFields(field.fields, field.appOnly, n)
        : undefined;
    case 'list': {
      if (!field.required) return undefined;
      // Two items, or as many as the list must have.
      const length = Math.max(field.min ?? 0, Math.min(2, field.max ?? 2));
      return Array.from({ length }, (_, i) => {
        if (field.of === 'number') return i + 1;
        if (field.of === 'link') return `https://example.com/${i + 1}`;
        if (field.of) return `${field.itemLabel ?? field.label} ${i + 1}`;
        return sampleFields(field.fields ?? [], field.appOnly, i + 1);
      });
    }
  }
}

/** Sample values for a list of fields, by name. */
export function sampleFields(
  fields: readonly SettingField[],
  appOnly: readonly string[] = [],
  n = 1
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    if (appOnly.includes(field.name)) continue;
    const value = sampleValue(field, n);
    if (value !== undefined) values[field.name] = value;
  }
  return values;
}

/** The props a block gets when it's just been added to a page. */
export function sampleProps(block: BlockInfo): Record<string, unknown> {
  return {
    ...sampleFields(block.settings),
    // Data from another service comes from the app; until then, loading.
    ...(block.appOnly.includes('data') ? { loading: true } : {}),
  };
}

/** The component for a block, by its name in the package. */
export function blockComponent(block: BlockInfo) {
  const found = (ui as Record<string, unknown>)[block.component];
  return typeof found === 'function'
    ? (found as ComponentType<Record<string, unknown>>)
    : null;
}

/** One block from the registry, with its sample props. */
export function BlockSample({ block }: { block: BlockInfo }) {
  const component = blockComponent(block);
  return component ? createElement(component, sampleProps(block)) : null;
}

/** Every block in the registry, one after another. */
export function RegistrySamples() {
  return (
    <div className="flex flex-col gap-4">
      {(BLOCKS as readonly BlockInfo[]).map((block) => (
        <div key={block.id} data-sample={block.id} className="contents">
          <BlockSample block={block} />
        </div>
      ))}
    </div>
  );
}
