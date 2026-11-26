import { expect, test } from '@playwright/test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  CalendarEmbed,
  CreatorTheme,
  OUTSIDE_SERVICES,
  PreviewMode,
  TicketEmbed,
  blockInfo,
} from '../src';
import {
  calendarEmbed,
  eventbriteTickets,
  googleCalendarEmbed,
  googleCalendarIds,
  lumaTickets,
  outlookCalendarEmbed,
  ticketsFor,
} from '../src/system/embeds';
import { WORDS_DE } from '../src/system/words/de';

/* Public calendars and event tickets: links read by host and id. No browser. */

const ID = 'c_8f1e2d3c4b5a@group.calendar.google.com';
const params = (src: string) => new URL(src).searchParams;

test('Google Calendar reads its embed, share and iCal links', () => {
  expect(
    googleCalendarIds(
      `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(ID)}&ctz=Asia%2FKolkata`
    )
  ).toEqual([ID]);
  // A share link carries the id in base64.
  expect(
    googleCalendarIds(
      `https://calendar.google.com/calendar/u/0?cid=${btoa(ID)}`
    )
  ).toEqual([ID]);
  expect(
    googleCalendarIds(
      `https://calendar.google.com/calendar/ical/${encodeURIComponent(ID)}/public/basic.ics`
    )
  ).toEqual([ID]);
  // Several calendars in one embed stay together, once each.
  expect(
    googleCalendarIds(
      'https://calendar.google.com/calendar/embed?src=a%40example.com&src=b%40example.com&src=a%40example.com'
    )
  ).toEqual(['a@example.com', 'b@example.com']);
  // A holiday calendar's id has a #.
  expect(
    googleCalendarIds(
      'https://calendar.google.com/calendar/embed?src=en.indian%23holiday%40group.v.calendar.google.com'
    )
  ).toEqual(['en.indian#holiday@group.v.calendar.google.com']);
});

test('look-alike hosts, private calendars and odd ids are refused', () => {
  for (const link of [
    `https://calendar.google.com.evil.test/calendar/embed?src=${ID}`,
    `https://evilcalendar.google.com/calendar/embed?src=${ID}`,
    `http://calendar.google.com/calendar/embed?src=${ID}`,
    `https://calendar.google.com/calendar/ical/${ID}/private-abc/basic.ics`,
    'https://calendar.google.com/calendar/embed?src=not-an-id',
    'https://calendar.google.com/calendar/embed?src=a%40b.com%22%3E%3Cscript%3E',
    'https://docs.google.com/calendar/embed?src=a%40example.com',
    'javascript:alert(1)',
  ]) {
    expect(calendarEmbed(link), link).toBeNull();
  }
});

test('a Google calendar is built with its view, zone, language and colour', () => {
  const page = googleCalendarEmbed(
    `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(ID)}&bgcolor=%23000000&mode=WEEK`,
    {
      view: 'month',
      timeZone: 'Europe/Berlin',
      language: 'de-DE',
      background: 'rgb(253, 246, 236)',
    }
  )!;
  expect(page.service).toBe('googlecalendar');
  const url = new URL(page.src);
  expect(url.origin + url.pathname).toBe(
    'https://calendar.google.com/calendar/embed'
  );
  const p = params(page.src);
  expect(p.getAll('src')).toEqual([ID]);
  expect(p.get('mode')).toBe('MONTH');
  expect(p.get('ctz')).toBe('Europe/Berlin');
  expect(p.get('hl')).toBe('de');
  expect(p.get('bgcolor')).toBe('#fdf6ec');
  expect(p.get('showTitle')).toBe('0');
  // Nothing from the pasted link but the ids is kept.
  expect([...p.keys()].sort()).toEqual(
    [
      'bgcolor',
      'ctz',
      'hl',
      'mode',
      'showCalendars',
      'showPrint',
      'showTabs',
      'showTitle',
      'src',
    ].sort()
  );
});

test('a dark background is left out, as Google’s text stays dark', () => {
  const link = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(ID)}`;
  for (const dark of ['#111827', 'rgb(15, 23, 42)', 'oklch(0.3 0.05 260)']) {
    expect(
      params(googleCalendarEmbed(link, { background: dark })!.src).get(
        'bgcolor'
      ),
      dark
    ).toBeNull();
  }
  for (const unsafe of ['url(x)', 'red; x: y', '']) {
    expect(
      params(googleCalendarEmbed(link, { background: unsafe })!.src).get(
        'bgcolor'
      )
    ).toBeNull();
  }
  // An odd zone or language is left out, not passed on.
  const p = params(
    googleCalendarEmbed(link, { timeZone: '"><x', language: 'x"' })!.src
  );
  expect(p.get('ctz')).toBeNull();
  expect(p.get('hl')).toBeNull();
  expect(p.get('mode')).toBe('AGENDA');
});

test('a published Outlook calendar is rebuilt from its parts', () => {
  const key = '60273ad624a54608b36477c210b7237f13787421943746669401';
  for (const file of ['calendar.html', 'reachcalendar.ics']) {
    expect(
      outlookCalendarEmbed(
        `https://outlook.office365.com/owa/calendar/classes@studio.example/${key}/${file}?x=1`
      )
    ).toEqual({
      service: 'outlookcalendar',
      src: `https://outlook.office365.com/owa/calendar/classes@studio.example/${key}/calendar.html`,
    });
  }
  expect(
    outlookCalendarEmbed(
      `https://outlook.live.com/owa/calendar/00000000-0000-0000-0000-000000000000/${key}/index.html`
    )?.src
  ).toBe(
    `https://outlook.live.com/owa/calendar/00000000-0000-0000-0000-000000000000/${key}/calendar.html`
  );
  for (const link of [
    `https://outlook.office365.com.evil.test/owa/calendar/a@b.com/${key}/calendar.html`,
    `https://outlook.office365.com/owa/calendar/a@b.com/short/calendar.html`,
    `https://outlook.office365.com/owa/calendar/a@b.com/${key}/other.html`,
    `https://outlook.office365.com/owa/calendar/a%22%3E@b.com/${key}/calendar.html`,
    `https://outlook.office365.com/mail/a@b.com/${key}/calendar.html`,
  ]) {
    expect(outlookCalendarEmbed(link), link).toBeNull();
  }
});

test('Luma tickets come from the embed link or the event id', () => {
  expect(lumaTickets('evt-AbC123xyz')).toEqual({
    service: 'luma',
    src: 'https://luma.com/embed/event/evt-AbC123xyz/simple',
    href: 'https://luma.com/event/evt-AbC123xyz',
  });
  expect(
    lumaTickets(
      'https://lu.ma/embed/event/evt-AbC123xyz/simple?tt=ttyp-Zz99yy88&utm_source=x'
    )?.src
  ).toBe('https://luma.com/embed/event/evt-AbC123xyz/simple?tt=ttyp-Zz99yy88');
  for (const link of [
    'https://luma.com/my-launch', // the public page carries no id
    'https://luma.com.evil.test/embed/event/evt-AbC123xyz/simple',
    'https://luma.com/embed/event/evt-AbC123xyz/simple?tt=%22%3E',
    'https://luma.com/embed/calendar/cal-AbC123xyz/events',
    'evt-"><script>',
    'http://luma.com/embed/event/evt-AbC123xyz/simple',
  ]) {
    expect(lumaTickets(link), link).toBeNull();
  }
});

test('Eventbrite events open on Eventbrite, never in a frame', () => {
  expect(
    eventbriteTickets(
      'https://www.eventbrite.com/e/summer-workshop-tickets-123456789012?aff=x'
    )
  ).toEqual({
    service: 'eventbrite',
    href: 'https://www.eventbrite.com/e/summer-workshop-tickets-123456789012',
  });
  expect(
    eventbriteTickets('https://www.eventbrite.co.uk/e/123456789012')?.href
  ).toBe('https://www.eventbrite.co.uk/e/123456789012');
  for (const link of [
    'https://www.eventbrite.com.evil.test/e/x-tickets-123456789012',
    'https://www.eventbrite.com/o/organiser-123456789012',
    'https://www.eventbrite.com/e/no-id-here',
    'https://www.eventbrite.com/e/x-tickets-123456789012/extra',
  ]) {
    expect(eventbriteTickets(link), link).toBeNull();
  }
  expect(ticketsFor('https://example.com/tickets')).toBeNull();
});

test('every calendar and ticket host is a listed service', () => {
  const hosts = (id: keyof typeof OUTSIDE_SERVICES) =>
    OUTSIDE_SERVICES[id].hosts as readonly string[];
  expect(hosts('googlecalendar')).toContain(
    new URL(
      calendarEmbed(`https://calendar.google.com/calendar/embed?src=${ID}`)!.src
    ).hostname
  );
  for (const host of [
    'outlook.office365.com',
    'outlook.office.com',
    'outlook.live.com',
  ]) {
    expect(hosts('outlookcalendar')).toContain(host);
  }
  expect(hosts('luma')).toContain(
    new URL(lumaTickets('evt-AbC123xyz')!.src).hostname
  );
  expect(blockInfo('calendar-embed')?.privacy.services).toEqual([
    'googlecalendar',
    'outlookcalendar',
  ]);
  expect(blockInfo('ticket-embed')?.privacy.services).toEqual(['luma']);
});

const render = (node: ReturnType<typeof createElement>) =>
  renderToStaticMarkup(node);

test('a calendar waits for the page to load, and for consent', () => {
  const src = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(ID)}`;
  const html = render(createElement(CalendarEmbed, { src, title: 'Classes' }));
  // On the server the frame waits for the block's colour.
  expect(html).not.toContain('<iframe');
  expect(html).toContain('aria-label="Calendar: Classes"');
  expect(html).toContain('data-service="googlecalendar"');
  expect(html).toContain('Open the calendar');
  expect(html).toContain('href="https://calendar.google.com/calendar/embed?');
  const asking = render(
    createElement(CalendarEmbed, { src, title: 'Classes', consent: false })
  );
  expect(asking).toContain('data-consent="pending"');
  expect(asking).toContain('Google Calendar');
  // Another link is only a link; an unsafe one is nothing.
  const other = render(
    createElement(CalendarEmbed, {
      src: 'https://example.com/calendar',
      title: 'Classes',
    })
  );
  expect(other).toContain('href="https://example.com/calendar"');
  expect(other).not.toContain('role="img"');
  expect(
    render(
      createElement(CalendarEmbed, { src: 'javascript:alert(1)', title: 'x' })
    )
  ).toBe('');
});

test('Luma tickets load in a frame, Eventbrite tickets are a link', () => {
  const luma = render(
    createElement(TicketEmbed, {
      src: 'evt-AbC123xyz',
      title: 'Launch night',
      display: 'inline',
    })
  );
  expect(luma).toContain(
    'src="https://luma.com/embed/event/evt-AbC123xyz/simple"'
  );
  expect(luma).toContain('sandbox=');
  expect(luma).toContain('title="Tickets: Launch night"');
  expect(luma).toContain('href="https://luma.com/event/evt-AbC123xyz"');
  // In a pop-up, nothing loads until the button is pressed.
  const popup = render(
    createElement(TicketEmbed, { src: 'evt-AbC123xyz', title: 'Launch night' })
  );
  expect(popup).not.toContain('<iframe');
  expect(popup).toContain('aria-haspopup="dialog"');
  const asking = render(
    createElement(TicketEmbed, {
      src: 'evt-AbC123xyz',
      title: 'Launch night',
      display: 'inline',
      consent: false,
    })
  );
  expect(asking).not.toContain('<iframe');
  expect(asking).toContain('Luma');
  const eventbrite = render(
    createElement(TicketEmbed, {
      src: 'https://www.eventbrite.com/e/summer-workshop-tickets-123456789012',
      title: 'Summer workshop',
      display: 'inline',
    })
  );
  expect(eventbrite).not.toContain('<iframe');
  expect(eventbrite).toContain('data-display="link"');
  expect(eventbrite).toContain(
    'href="https://www.eventbrite.com/e/summer-workshop-tickets-123456789012"'
  );
  expect(eventbrite).toContain('Get tickets');
  // In preview the checkout is a still placeholder.
  const preview = render(
    createElement(
      PreviewMode,
      { enabled: true },
      createElement(TicketEmbed, {
        src: 'evt-AbC123xyz',
        title: 'Launch night',
        display: 'inline',
      })
    )
  );
  expect(preview).not.toContain('<iframe');
  expect(preview).toContain('data-preview-placeholder');
});

test('both speak the page’s language', () => {
  const html = render(
    createElement(
      CreatorTheme,
      { theme: { language: 'de' }, words: WORDS_DE },
      createElement(TicketEmbed, {
        src: 'https://www.eventbrite.de/e/123456789012',
        title: 'Workshop',
      }),
      createElement(CalendarEmbed, {
        src: 'https://example.com/kalender',
        title: 'Kurse',
      })
    )
  );
  expect(html).toContain(WORDS_DE.ticketEmbed.button);
  expect(html).toContain(WORDS_DE.calendarEmbed.fallback);
});
