import { useState } from 'react';
import {
  LeadMagnet,
  LockedLink,
  NewsletterBand,
  PackCheckout,
  TipJar,
} from '../src';

/** Checkout that says when it would start, for the tests. */
export function CheckoutDemo() {
  const [started, setStarted] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <PackCheckout
        price="$12"
        onSubmit={(event) => {
          event.preventDefault();
          setStarted(true);
        }}
      />
      {started ? <p role="status">Checkout started</p> : null}
    </div>
  );
}

/** Newsletter sign-up that says when it would subscribe, for the tests. */
export function NewsletterDemo() {
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <NewsletterBand
        title="One origin story every Friday"
        onSubmit={(event) => {
          event.preventDefault();
          setDone(true);
        }}
      />
      {done ? <p role="status">Subscribed</p> : null}
    </div>
  );
}

/** Lead magnet that says when it would send the guide, for the tests. */
export function LeadMagnetDemo() {
  const [sent, setSent] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <LeadMagnet
        title="The origin story checklist"
        detail="One page to plan your next video."
        headingAs="p"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      />
      {sent ? <p role="status">Guide sent</p> : null}
    </div>
  );
}

/** Tip jar that says which amount it would send, for the tests. */
export function TipJarDemo() {
  const [tip, setTip] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <TipJar
        title="Buy me a chai"
        onSubmit={(event) => {
          event.preventDefault();
          setTip(String(new FormData(event.currentTarget).get('amount')));
        }}
      />
      {tip ? <p role="status">Tip of {tip} started</p> : null}
    </div>
  );
}

/** A code-locked link; "CHAI" opens it. Stands in for a server check. */
export function LockedLinkDemo() {
  return (
    <LockedLink
      label="Early access: the reel pack"
      mode="code"
      newTab
      unlock={async (code) =>
        code.toUpperCase() === 'CHAI'
          ? ['https://example.com', 'early-access'].join('/')
          : null
      }
    />
  );
}
