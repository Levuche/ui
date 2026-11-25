import { useState } from 'react';
import { NewsletterBand, PackCheckout } from '../src';

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
