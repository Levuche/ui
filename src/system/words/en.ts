/*
 * The words blocks write themselves, in English: button text, units, status
 * messages and screen-reader names. Every other language has its own file
 * beside this one with the same keys (a test checks), so a page loads only
 * the language it's in. Words in {braces} are filled in by the block.
 *
 * Each group is one block's `labels`, with the same keys. `props` holds the
 * defaults of word props a block takes on its own, such as a tip jar's
 * `buttonLabel`: the prop wins when it's set.
 */
export const WORDS_EN = {
  copy: {
    copy: 'Copy',
    copied: 'Copied',
    copiedStatus: 'Copied {text}',
    failedStatus: 'Couldn’t copy. It’s {text}.',
  },
  emailForm: {
    email: 'Email',
    placeholder: 'you@email.com',
    button: 'Subscribe',
    sent: 'Thanks! Check your inbox.',
    error: 'That didn’t go through. Please try again.',
  },
  liveData: {
    loading: 'Loading',
    stale: 'Couldn’t refresh just now; showing the last update.',
  },
  audioBar: {
    play: 'Play {title}',
    pause: 'Pause {title}',
    seek: 'Position',
    position: '{time} of {total}',
    transcript: 'Transcript',
  },
  sell: {
    soldOut: 'Sold out',
    unavailable: 'Not on sale right now',
    error: 'That didn’t go through. Please try again.',
  },
  packCheckout: {
    sent: 'Thank you! Your payment went through.',
    error: 'The payment didn’t go through. Please try again.',
  },
  creditPack: {
    credits: '{n} credits',
    bonus: '+{n} bonus',
    button: 'Buy credits',
  },
  slotPicker: {
    day: 'Day',
    time: 'Time',
    zone: 'Times are in {zone}.',
    pick: 'Pick a time',
    book: 'Book {time}',
    none: 'No free times right now. Please check back soon.',
  },
  tipJar: {
    other: 'Other amount',
    sent: 'Thank you!',
    error: 'The tip didn’t go through. Please try again.',
  },
  countdown: {
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
  },
  carousel: {
    previous: 'Previous slide',
    next: 'Next slide',
    slide: 'Slide {n} of {total}',
    pause: 'Pause slides',
    play: 'Play slides',
  },
  beforeAfter: {
    before: 'Before',
    after: 'After',
    slider: 'Compare before and after',
    value: '{before}% before, {after}% after',
  },
  contactForm: {
    name: 'Your name',
    email: 'Your email',
    message: 'Message',
    button: 'Send',
    sent: 'Thanks! I’ll get back to you soon.',
    error: 'That didn’t go through. Please try again.',
  },
  messageCard: {
    whatsapp: 'Message on WhatsApp',
    telegram: 'Message on Telegram',
    sms: 'Send a text',
    email: 'Send an email',
    messenger: 'Message on Messenger',
    preview: 'Ready message',
    message: 'Your message',
    hint: 'Change it if you like, then send.',
  },
  mapCard: {
    showMap: 'Show {place} on a map',
    map: 'Map of {place}',
    directions: 'Get directions',
    hours: 'Opening hours',
  },
  lockedLink: {
    code: 'Code',
    unlock: 'Unlock',
    wrongCode: 'That code didn’t work. Check it and try again.',
    ageQuestion: 'Are you {age} or older?',
    ageYes: 'Yes, continue',
    ageNo: 'No',
    ageDenied: 'Sorry, this link is only for people {age} and over.',
    warningTitle: 'Before you open this',
    continue: 'Continue',
    cancel: 'Cancel',
    open: 'Open the link',
    close: 'Close',
  },
  courseCard: {
    oneLesson: '1 lesson',
    lessons: '{n} lessons',
    button: 'Start learning',
  },
  topPicks: {
    affiliate: 'Affiliate',
    disclosure: 'I may earn a commission from links marked Affiliate.',
  },
  pricingTable: {
    billing: 'Billing',
    monthly: 'Monthly',
    yearly: 'Yearly',
    month: 'month',
    year: 'year',
  },
  bookingEmbed: {
    button: 'Pick a time',
    frame: 'Booking: {title}',
    fallback: 'Open the booking page',
    close: 'Close',
    length: 'Length',
    nextFree: 'Next free: {time}',
  },
  github: {
    followers: 'Followers',
    repos: 'Repos',
    stars: 'Stars',
    button: 'Follow on GitHub',
  },
  contributions: {
    total: '{n} contributions in the last year',
    current: 'Current streak',
    longest: 'Longest streak',
    days: '{n} days',
  },
  repo: {
    stars: 'stars',
    forks: 'forks',
  },
  package: {
    version: 'Version',
    weekly: 'Weekly downloads',
    chart: 'Downloads per week over the last {n} weeks',
  },
  embed: {
    play: 'Play: {title}',
  },
  /** Every block's notice before it loads another site. {service} is filled in. */
  consent: {
    notice:
      'This loads from {service}, which will see your IP address and may set cookies.',
    load: 'Load',
  },
  /** Stars, read out by screen readers. */
  rating: {
    stars: '{n} out of {max} stars',
  },
  liveStatus: {
    live: 'Live now',
    offline: 'Offline',
    viewers: '{n} watching',
    watch: 'Watch on the channel',
    play: 'Watch {channel} live',
  },
  eventList: {
    addToCalendar: 'Add to calendar',
    google: 'Google Calendar',
    download: 'Other calendars (.ics)',
    tickets: 'Tickets',
    soldOut: 'Sold out',
  },
  reviewSummary: {
    summary: '{rating} from {count} reviews',
    all: 'Read all reviews',
  },
  nowPlaying: {
    listening: 'Listening to',
    reading: 'Reading',
    watching: 'Watching',
  },
  textStrip: {
    pause: 'Stop the moving words',
    play: 'Move the words again',
  },
  wordRing: {
    pause: 'Stop the turning words',
    play: 'Turn the words again',
  },
  socialCard: {
    follow: 'Follow',
    subscribe: 'Subscribe',
    connect: 'Connect',
    addFriend: 'Add friend',
    join: 'Join server',
    message: 'Message',
    followers: '{n} followers',
    subscribers: '{n} subscribers',
    members: '{n} members',
    connections: '{n} connections',
    views: '{n} views',
    verified: 'Verified',
    posts: 'Latest posts',
    post: 'Post {n}',
    on: '{name} on {platform}',
  },
  newsletterTile: {
    open: 'Sign up',
    close: 'Close',
  },
  appBadges: {
    list: 'Get the app',
    appStoreLead: 'Download on the',
    appStore: 'App Store',
    googlePlayLead: 'Get it on',
    googlePlay: 'Google Play',
  },
  video: {
    play: 'Play {title}',
    pause: 'Pause {title}',
    soundOn: 'Play {title} with sound',
  },
  videoTile: {
    play: 'Play {title}',
    pause: 'Pause {title}',
    soundOn: 'Play {title} with sound',
    transcript: 'Transcript',
  },
  daysLeft: {
    due: 'Due {date}',
    days: '{n} days left',
    oneDay: '1 day left',
    ended: 'Ended',
  },
  goalTracker: {
    due: 'Due {date}',
    days: '{n} days left',
    oneDay: '1 day left',
    ended: 'Ended',
    items: '{done} of {total} done',
    amount: '{current} of {target}',
    reached: 'Goal reached',
    list: 'Steps',
    done: 'Done',
    notDone: 'Not done yet',
  },
  progressList: {
    amount: '{value} of {max}',
  },
  calendar: {
    addToCalendar: 'Add to calendar',
    google: 'Google Calendar',
    download: 'Other calendars (.ics)',
  },
  eventCard: {
    addToCalendar: 'Add to calendar',
    google: 'Google Calendar',
    download: 'Other calendars (.ics)',
    tickets: 'Get tickets',
    soldOut: 'Sold out',
    live: 'Happening now',
    ended: 'Ended',
    loading: 'Loading the event',
    untitled: 'Event',
  },
  localTime: {
    title: 'My local time',
    open: 'Open now',
    away: 'Away',
    ahead: '{time} ahead of you',
    behind: '{time} behind you',
    same: 'Same time as you',
    hours: '{n} h',
    minutes: '{n} min',
  },
  logoStrip: {
    pause: 'Stop the moving logos',
    play: 'Move the logos again',
  },
  calendarEmbed: {
    frame: 'Calendar: {title}',
    fallback: 'Open the calendar',
  },
  ticketEmbed: {
    button: 'Get tickets',
    frame: 'Tickets: {title}',
    fallback: 'Open the ticket page',
    close: 'Close',
  },
  props: {
    /** TextStrip `label`. */
    highlights: 'Highlights',
    /** QrCode's picture name. */
    qrFor: 'QR code for {address}',
    /** CreatorHeader `verifiedLabel`. */
    verified: 'Verified',
    /** LinkList `label`. */
    links: 'Links',
    /** SocialIcons `label`. */
    socialAccounts: 'Social accounts',
    /** LogoStrip `label`. */
    brands: 'Brands',
    /** Carousel `label`. */
    pictures: 'Pictures',
    /** PackRow and PackGrid `buttonLabel`. */
    buy: 'Buy',
    /** FeaturedPack `buttonLabel` and BuyButton's words. */
    takeIt: 'I’ll take it',
    /** PackCheckout's button, when it has no `buttonLabel`. */
    takeItFor: 'I’ll take it, {price}',
    /** PackCheckout `consent`. */
    consent:
      'I want to download now and understand I lose my 14-day right to cancel.',
    /** A price's saving, when the block has no `saveLabel`. */
    save: 'Save {amount}',
    /** BookingCard `buttonLabel`. */
    bookCall: 'Book a call',
    /** MembershipCard `buttonLabel`. */
    join: 'Join',
    /** MembershipCard `period`. */
    month: 'month',
    /** LeadMagnet's eyebrow (`labels.free`). */
    free: 'Free',
    /** LeadMagnet `buttonLabel`. */
    sendIt: 'Send it to me',
    /** LeadMagnet's message once sent (`labels.sent`). */
    sentCheckInbox: 'Sent! Check your inbox.',
    /** DiscountCode's copy button (`labels.copy`). */
    copyCode: 'Copy code',
    /** DiscountCode's message when the copy failed (`labels.failedStatus`). */
    copyCodeFailed: 'Couldn’t copy. The code is {text}.',
    /** TipJar `title`. */
    leaveTip: 'Leave a tip',
    /** TipJar `buttonLabel`. */
    tip: 'Tip',
    /** Countdown `doneLabel`. */
    live: 'It’s live',
    /** SaveContact `buttonLabel`. */
    saveContact: 'Save contact',
    /** QrCode `downloadLabel`. */
    saveQr: 'Save the QR code',
    /** LatestVideos `channelLabel`. */
    seeChannel: 'See the channel',
    /** PodcastEpisodes `allLabel`. */
    allEpisodes: 'All episodes',
    /** CreatorFooter `label`. */
    policies: 'Site policies',
    /** CreatorFooter `credit`. */
    madeWith: 'Made with Levuche',
    /** Read out before a price struck through. */
    was: 'Was',
  },
};

/** Every word a block writes itself, grouped by block. */
export type PageWords = typeof WORDS_EN;
