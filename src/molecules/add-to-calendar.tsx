import {
  SiteLinkButton,
  siteButtonClasses,
  type SiteButtonSize,
  type SiteButtonVariant,
} from '../atoms/button';
import { CalendarIcon, ChevronDownIcon, DownloadIcon } from '../atoms/icons';
import { calendarLinks, type CalendarEvent } from '../system/calendar';
import { cn } from '../system/cn';

/** The words on the calendar button and its two choices. */
export type CalendarLabels = {
  addToCalendar: string;
  google: string;
  download: string;
};

export const CALENDAR_LABELS: CalendarLabels = {
  addToCalendar: 'Add to calendar',
  google: 'Google Calendar',
  download: 'Other calendars (.ics)',
};

/**
 * "Add to calendar": a button that opens two choices under it, a Google
 * Calendar link and an .ics file for every other calendar app. No
 * JavaScript and no state: it's a disclosure the browser opens, and both
 * links are made from the event's fields alone (see calendar.ts), so it
 * renders on the server and hydrates without a mismatch. Nothing shows when
 * the event's start can't be read.
 *
 * Presses are tracked as "calendar_open", "calendar_google" and
 * "calendar_ics".
 */
export function AddToCalendar({
  event,
  labels,
  variant = 'outline',
  size = 'sm',
  fullWidth = false,
  context,
  className,
}: {
  event: CalendarEvent;
  labels?: Partial<CalendarLabels>;
  variant?: SiteButtonVariant;
  size?: SiteButtonSize;
  fullWidth?: boolean;
  /** Read after the button's words by screen readers, as the event's name. */
  context?: string;
  className?: string;
}) {
  const links = calendarLinks(event);
  if (!links) return null;
  const words = { ...CALENDAR_LABELS, ...labels };
  return (
    <details
      data-calendar=""
      className={cn(
        'group/calendar flex flex-col gap-1.5',
        fullWidth && 'w-full',
        className
      )}
    >
      <summary
        data-action="calendar_open"
        className={siteButtonClasses({
          variant,
          size,
          fullWidth,
          className: 'list-none select-none [&::-webkit-details-marker]:hidden',
        })}
      >
        <CalendarIcon size={16} />
        {words.addToCalendar}
        {context ? <span className="sr-only">: {context}</span> : null}
        <ChevronDownIcon
          size={16}
          className="flex-none transition-transform group-open/calendar:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        <li>
          <SiteLinkButton
            href={links.google}
            newTab
            variant="soft"
            size="sm"
            fullWidth
            action="calendar_google"
          >
            {words.google}
          </SiteLinkButton>
        </li>
        <li>
          {/* A file the page made itself, not a link a creator typed. */}
          <a
            href={links.ics}
            download={links.fileName}
            type="text/calendar"
            data-action="calendar_ics"
            className={siteButtonClasses({
              variant: 'soft',
              size: 'sm',
              fullWidth: true,
            })}
          >
            <DownloadIcon size={16} />
            {words.download}
          </a>
        </li>
      </ul>
    </details>
  );
}
