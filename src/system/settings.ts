import {
  BLOCK_ALIGNS,
  BLOCK_MOTIONS,
  BLOCK_RADII,
  BLOCK_SCALES,
  BLOCK_SCREENS,
  BLOCK_SHADOWS,
  BLOCK_TONES,
} from './look';
import {
  BACKGROUND_FILLS,
  BACKGROUND_INKS,
  BACKGROUND_PATTERNS,
  BACKGROUND_POSITIONS,
  BACKGROUND_TYPES,
  DEFAULT_ANGLE,
  DEFAULT_DIM,
  DEFAULT_PATTERN_OPACITY,
  MAX_PATTERN_OPACITY,
  MIN_DIM,
} from './background';
import type { SellKind } from './sell';
import { isSafeColor } from './theme';

/*
 * What a creator can set on each block, described as plain data, so the page
 * editor builds a block's settings panel from it instead of a hand-made form
 * per block. Each block's entry in BLOCKS (registry.ts) has a `settings` list
 * of its own fields and an `appOnly` list of the props the app fills in
 * itself; the look every block shares (LOOK_SETTINGS) is described once here
 * and goes on every panel.
 *
 * src/settings-check.ts checks the lists against each block's props when the
 * package is type-checked: every prop is in `settings` or `appOnly`, every
 * field names a real prop, each field's type fits the prop, and a choice's
 * options are exactly the values the prop takes. So a new prop, or a changed
 * one, fails `npm run typecheck` until its setting is written.
 */

/**
 * The kinds of field in a panel:
 *
 * - text, longText: words, on one line or several
 * - link: a web address (checked with isSafeHref before it's used)
 * - toggle: on or off
 * - choice: one of `options`, or several with `multiple`
 * - number: a number, with an optional `min`, `max`, `step` and `unit`
 * - colour: a colour (checked with isSafeColor)
 * - dateTime: a date and time, as an ISO string
 * - picture: a picture's address
 * - list: a list of items, each made of `fields`, or plain values (`of`)
 * - group: a few fields kept together, such as an address card
 * - words: the words a visitor sees, one box per key of `from`, the name of
 *   the package's export that holds the defaults (as TIP_JAR_LABELS)
 * - product: something to sell, picked from the creator's BuildBase store
 */
export const SETTING_TYPES = [
  'text',
  'longText',
  'link',
  'toggle',
  'choice',
  'number',
  'colour',
  'dateTime',
  'picture',
  'list',
  'group',
  'words',
  'product',
] as const;
export type SettingType = (typeof SETTING_TYPES)[number];

/**
 * Icons the editor shows beside a field, so a panel reads at a glance. Each
 * type has its own (see settingIcon); a field sets `icon` only when another
 * says more, as `person` for a name or `mail` for an email address.
 */
export const SETTING_ICONS = [
  'text',
  'paragraph',
  'link',
  'toggle',
  'choice',
  'number',
  'colour',
  'calendar',
  'picture',
  'list',
  'group',
  'words',
  'cart',
  'person',
  'mail',
  'phone',
  'place',
  'clock',
  'money',
  'tag',
  'star',
  'lock',
  'code',
  'music',
  'video',
  'layout',
  'size',
  'eye',
] as const;
export type SettingIcon = (typeof SETTING_ICONS)[number];

type SettingBase = {
  /** The block's prop this field sets, as `title`. */
  name: string;
  /** The field's name in the panel, as "Title". */
  label: string;
  /** A line under the field, when the label needs it. */
  help?: string;
  /** The block needs it: the editor asks for it before the block shows. */
  required?: boolean;
  /**
   * Changing it makes a network call (a link that loads a preview, a name
   * that loads a feed), so the editor waits until typing stops before it
   * reloads the block.
   */
  slow?: boolean;
  /** An icon in place of the type's own; see SETTING_ICONS. */
  icon?: SettingIcon;
  /**
   * Not a prop of the block: the app reads it, as the feed or account to
   * load the block's data from, or a code it checks on its server.
   */
  forApp?: boolean;
};

export type TextSetting = SettingBase & {
  type: 'text' | 'longText';
  default?: string;
};

export type LinkSetting = SettingBase & {
  type: 'link';
  default?: string;
  /**
   * The block's main link: a link pasted while the block's panel is open
   * goes here. At most one per block.
   */
  main?: boolean;
};

export type ToggleSetting = SettingBase & {
  type: 'toggle';
  default?: boolean;
};

/** A value a choice can take. */
export type ChoiceValue = string | number | boolean;

export type ChoiceSetting = SettingBase & {
  type: 'choice';
  /** The values to pick from, as the block takes them. */
  options: readonly ChoiceValue[];
  /** Words for some options, by `String(value)`; others show the value. */
  optionLabels?: Readonly<Record<string, string>>;
  /** Pick any number of options; the value is a list. */
  multiple?: boolean;
  default?: ChoiceValue | readonly ChoiceValue[];
};

export type NumberSetting = SettingBase & {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  /** Shown after the box, as "px" or "seconds". */
  unit?: string;
  default?: number;
};

export type ColourSetting = SettingBase & {
  type: 'colour';
  default?: string;
};

export type DateTimeSetting = SettingBase & {
  type: 'dateTime';
  default?: string;
};

export type PictureSetting = SettingBase & {
  type: 'picture';
  default?: string;
};

/** The plain values a list can hold, when its items aren't made of fields. */
export const LIST_VALUE_TYPES = ['text', 'longText', 'number', 'link'] as const;
export type ListValueType = (typeof LIST_VALUE_TYPES)[number];

export type ListSetting = SettingBase & {
  type: 'list';
  /** Each item is made of these fields. Or set `of`. */
  fields?: readonly SettingField[];
  /** Each item is one plain value of this type. Or set `fields`. */
  of?: ListValueType;
  /** Keys of each item the app fills in, not the creator. */
  appOnly?: readonly string[];
  /** What one item is called in the panel, as "Link". */
  itemLabel?: string;
  min?: number;
  max?: number;
  default?: readonly unknown[];
};

export type GroupSetting = SettingBase & {
  type: 'group';
  fields: readonly SettingField[];
  /** Keys the app fills in, not the creator. */
  appOnly?: readonly string[];
};

export type WordsSetting = SettingBase & {
  type: 'words';
  /** The name of the package export that holds the defaults, as 'TIP_JAR_LABELS'. */
  from: string;
};

export type ProductSetting = SettingBase & {
  type: 'product';
  /** The kinds of thing it can sell (see SellRef). */
  sells: readonly SellKind[];
};

/** One field in a block's settings panel. */
export type SettingField =
  | TextSetting
  | LinkSetting
  | ToggleSetting
  | ChoiceSetting
  | NumberSetting
  | ColourSetting
  | DateTimeSetting
  | PictureSetting
  | ListSetting
  | GroupSetting
  | WordsSetting
  | ProductSetting;

const TYPE_ICONS: Record<SettingType, SettingIcon> = {
  text: 'text',
  longText: 'paragraph',
  link: 'link',
  toggle: 'toggle',
  choice: 'choice',
  number: 'number',
  colour: 'colour',
  dateTime: 'calendar',
  picture: 'picture',
  list: 'list',
  group: 'group',
  words: 'words',
  product: 'cart',
};

/** The icon to show beside a field: its own, or its type's. */
export function settingIcon(field: SettingField): SettingIcon {
  return field.icon ?? TYPE_ICONS[field.type];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const fitsList = (field: ListSetting, value: unknown) => {
  if (!Array.isArray(value)) return false;
  if (field.min !== undefined && value.length < field.min) return false;
  if (field.max !== undefined && value.length > field.max) return false;
  return value.every((item) => {
    if (field.of === 'number') return typeof item === 'number';
    if (field.of) return typeof item === 'string';
    return isRecord(item) && fitsFields(field.fields ?? [], item);
  });
};

/** True when every field present in `value` fits, and every required one is there. */
function fitsFields(fields: readonly SettingField[], value: object) {
  const record = value as Record<string, unknown>;
  return fields.every((field) =>
    record[field.name] === undefined
      ? !field.required
      : fitsSetting(field, record[field.name])
  );
}

/**
 * Whether a value fits a field: a string for words and links, a number in
 * range, one of a choice's options, a safe colour, a date that can be read,
 * a list whose items fit. The editor can use it on what a creator typed; the
 * package's tests use it on every default.
 */
export function fitsSetting(field: SettingField, value: unknown): boolean {
  switch (field.type) {
    case 'text':
    case 'longText':
    case 'link':
    case 'picture':
      return typeof value === 'string';
    case 'toggle':
      return typeof value === 'boolean';
    case 'number':
      return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        (field.min === undefined || value >= field.min) &&
        (field.max === undefined || value <= field.max)
      );
    case 'colour':
      return typeof value === 'string' && isSafeColor(value);
    case 'dateTime':
      return typeof value === 'string' && !Number.isNaN(Date.parse(value));
    case 'choice':
      return field.multiple
        ? Array.isArray(value) &&
            value.every((item) => field.options.includes(item))
        : field.options.includes(value as ChoiceValue);
    case 'list':
      return fitsList(field, value);
    case 'group':
      return isRecord(value) && fitsFields(field.fields, value);
    case 'words':
      return (
        isRecord(value) &&
        Object.values(value).every((words) => typeof words === 'string')
      );
    case 'product':
      return isRecord(value);
  }
}

/** The fields' defaults by name, for a new block. Fields with none are left out. */
export function settingDefaults(
  fields: readonly SettingField[]
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    if ('default' in field && field.default !== undefined) {
      values[field.name] = field.default;
    }
  }
  return values;
}

/** The colours a creator can set, as in SiteColors. */
export const COLOUR_SETTINGS = [
  { name: 'bg', label: 'Page', type: 'colour' },
  { name: 'surface', label: 'Card', type: 'colour' },
  { name: 'surface2', label: 'Second card', type: 'colour' },
  { name: 'border', label: 'Lines', type: 'colour' },
  { name: 'text', label: 'Text', type: 'colour' },
  { name: 'text2', label: 'Quiet text', type: 'colour' },
  { name: 'link', label: 'Links', type: 'colour' },
  { name: 'accent', label: 'Accent', type: 'colour' },
  { name: 'onAccent', label: 'Text on the accent', type: 'colour' },
  { name: 'band', label: 'Band', type: 'colour' },
  { name: 'onBand', label: 'Text on the band', type: 'colour' },
] as const satisfies readonly SettingField[];

/**
 * The look every block shares (BlockLook), described once. Every block's
 * panel gets these after its own settings. Defaults are the look's own; a
 * block may start from another tone or alignment.
 */
export const LOOK_SETTINGS = [
  {
    name: 'tone',
    label: 'Colours',
    type: 'choice',
    options: BLOCK_TONES,
    optionLabels: {
      surface: 'Card',
      muted: 'Quiet card',
      accent: 'Accent',
      band: 'Band',
      notice: 'Notice',
      outline: 'Outline',
      plain: 'On the page',
      inset: 'Pressed in',
    },
    default: 'surface',
    icon: 'colour',
  },
  {
    name: 'size',
    label: 'Size',
    type: 'choice',
    options: BLOCK_SCALES,
    optionLabels: { sm: 'Small', md: 'Medium', lg: 'Large' },
    default: 'md',
    icon: 'size',
  },
  {
    name: 'radius',
    label: 'Corners',
    type: 'choice',
    options: BLOCK_RADII,
    optionLabels: {
      theme: 'As the page',
      none: 'Square',
      sm: 'Slightly round',
      md: 'Round',
      lg: 'Very round',
      full: 'Fully round',
    },
    default: 'theme',
  },
  {
    name: 'align',
    label: 'Line up',
    type: 'choice',
    options: BLOCK_ALIGNS,
    optionLabels: { start: 'Start', center: 'Centre', end: 'End' },
    icon: 'layout',
  },
  {
    name: 'shadow',
    label: 'Shadow',
    type: 'choice',
    options: BLOCK_SHADOWS,
    optionLabels: { none: 'None', sm: 'Small', md: 'Medium', lg: 'Large' },
    help: 'Left unset, the page’s card style decides.',
  },
  {
    name: 'background',
    label: 'Background',
    type: 'group',
    help: 'A gradient, pattern or picture in the page’s colours, behind the words.',
    icon: 'picture',
    fields: [
      {
        name: 'type',
        label: 'Kind',
        type: 'choice',
        options: BACKGROUND_TYPES,
        optionLabels: {
          gradient: 'Gradient',
          pattern: 'Pattern',
          image: 'Picture',
        },
        required: true,
      },
      {
        name: 'stops',
        label: 'Gradient colours',
        type: 'choice',
        options: BACKGROUND_FILLS,
        optionLabels: {
          bg: 'Page',
          surface: 'Card',
          surface2: 'Quiet card',
          border: 'Lines',
          accent: 'Accent',
          band: 'Band',
        },
        multiple: true,
        help: 'Two or three.',
      },
      {
        name: 'angle',
        label: 'Gradient angle',
        type: 'number',
        min: 0,
        max: 360,
        step: 15,
        unit: '°',
        default: DEFAULT_ANGLE,
      },
      {
        name: 'move',
        label: 'Drift slowly',
        type: 'toggle',
        default: false,
        help: 'Always still for visitors who ask for less motion.',
      },
      {
        name: 'pattern',
        label: 'Pattern',
        type: 'choice',
        options: BACKGROUND_PATTERNS,
        optionLabels: {
          lines: 'Lines',
          rings: 'Rings',
          dots: 'Dots',
          grid: 'Grid',
          waves: 'Waves',
        },
      },
      {
        name: 'color',
        label: 'Pattern colour',
        type: 'choice',
        options: BACKGROUND_INKS,
        optionLabels: {
          text: 'Text',
          text2: 'Quiet text',
          accent: 'Accent',
          band: 'Band',
          border: 'Lines',
          link: 'Links',
        },
      },
      {
        name: 'opacity',
        label: 'Pattern strength',
        type: 'number',
        min: 1,
        max: MAX_PATTERN_OPACITY,
        unit: '%',
        default: DEFAULT_PATTERN_OPACITY,
      },
      { name: 'src', label: 'Picture', type: 'picture' },
      {
        name: 'position',
        label: 'Keep in view',
        type: 'choice',
        options: BACKGROUND_POSITIONS,
        optionLabels: {
          center: 'Middle',
          top: 'Top',
          bottom: 'Bottom',
          left: 'Left',
          right: 'Right',
        },
        default: 'center',
      },
      {
        name: 'dim',
        label: 'Layer over the picture',
        type: 'number',
        min: MIN_DIM,
        max: 100,
        unit: '%',
        default: DEFAULT_DIM,
        help: 'Keeps the words readable.',
      },
    ],
  },
  {
    name: 'motion',
    label: 'When it appears',
    type: 'choice',
    options: BLOCK_MOTIONS,
    optionLabels: {
      none: 'Still',
      fade: 'Fade in',
      rise: 'Rise',
      scale: 'Grow',
    },
    default: 'none',
    help: 'Always still for visitors who ask for less motion.',
  },
  {
    name: 'colors',
    label: 'Own colours',
    type: 'group',
    fields: COLOUR_SETTINGS,
    help: 'Over the page’s colours, for this block only.',
  },
  {
    name: 'font',
    label: 'Own font',
    type: 'text',
    help: 'A font list, as "\'Sora\', sans-serif". Left empty, the page’s font.',
  },
  {
    name: 'hideOn',
    label: 'Hide on',
    type: 'choice',
    options: BLOCK_SCREENS,
    optionLabels: { phone: 'Phones', tablet: 'Tablets', desktop: 'Computers' },
    multiple: true,
    icon: 'eye',
  },
] as const satisfies readonly SettingField[];

/* Fields many blocks share, spread into their settings in registry.ts. */

/** How a link opens (LinkBehavior). */
export const LINK_BEHAVIOR_SETTINGS = [
  {
    name: 'newTab',
    label: 'Open in a new tab',
    type: 'choice',
    options: ['auto', true, false],
    optionLabels: {
      auto: 'Other sites only',
      true: 'Always',
      false: 'Never',
    },
    default: 'auto',
  },
  {
    name: 'sponsored',
    label: 'Paid or affiliate link',
    type: 'toggle',
    help: 'Tells search engines the link is paid for.',
    default: false,
  },
  {
    name: 'nofollow',
    label: 'Ask search engines not to follow it',
    type: 'toggle',
    default: false,
  },
] as const satisfies readonly SettingField[];

/** What a selling block sells, and the words it shows when it can't. */
export const SELL_SETTINGS = [
  {
    name: 'sell',
    label: 'Product',
    type: 'product',
    sells: ['item', 'plan', 'credits'],
    help: 'What the button checks out through BuildBase.',
  },
  {
    name: 'sellLabels',
    label: 'Words when it can’t be bought',
    type: 'words',
    from: 'SELL_LABELS',
  },
] as const satisfies readonly SettingField[];

/** The props a selling block takes from the app, not the creator. */
export const SELL_APP_ONLY = ['sellState', 'renderBuy'] as const;

/** The "Save {amount}" line beside an old price. */
export const SAVE_LABEL_SETTING = {
  name: 'saveLabel',
  label: 'Saving line',
  type: 'text',
  help: 'Shown with the old price, as "Save {amount}".',
} as const satisfies SettingField;

/** Picture shapes (ThumbRatio). */
export const RATIO_OPTIONS = [
  'auto',
  'square',
  'video',
  'portrait',
  'reel',
  'wide',
] as const;

export const RATIO_LABELS = {
  auto: 'As the picture',
  square: 'Square',
  video: 'Wide (16:9)',
  portrait: 'Portrait (4:5)',
  reel: 'Tall (9:14)',
  wide: 'Very wide (21:9)',
} as const;

/** Button styles (SiteButtonVariant). */
export const BUTTON_VARIANT_OPTIONS = [
  'solid',
  'outline',
  'soft',
  'text',
] as const;

export const BUTTON_VARIANT_LABELS = {
  solid: 'Filled',
  outline: 'Outline',
  soft: 'Soft',
  text: 'Text only',
} as const;

/** Props of a form block the app wires up. */
export const FORM_APP_ONLY = ['status', 'onSubmit', 'action'] as const;

/** Props of a block whose data the app fetches (LiveProps). */
export const LIVE_APP_ONLY = ['data', 'loading', 'error', 'updatedAt'] as const;
