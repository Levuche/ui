import type { FormEventHandler, ReactNode } from 'react';
import { Block, type BlockRootProps } from '../atoms/block';
import type { SiteButtonVariant } from '../atoms/button';
import { ClockIcon } from '../atoms/icons';
import { Badge, Ribbon } from '../atoms/text';
import { cn } from '../system/cn';
import type { LinkBehavior } from '../system/href';
import type { FormStatus } from '../system/state';
import { CheckList } from '../molecules/check-list';
import {
  EMAIL_FORM_LABELS,
  EmailForm,
  type EmailFormLabels,
} from '../molecules/email-form';
import {
  ItemHead,
  type HeadingTag,
  type SubHeadingTag,
} from '../molecules/item-head';
import { Price } from '../molecules/price';
import {
  SellButton,
  SellField,
  type SellProps,
} from '../molecules/sell-button';
import type { ImageSrc } from '../system/image';
import { usePageWords } from '../system/page-words';
import { WORDS_EN } from '../system/words/en';

/**
 * A call or session to book: what it is, how long, the price, and a link to
 * the booking page or, with `sell`, a button that starts a BuildBase booking.
 */
export function BookingCard({
  title,
  detail,
  duration,
  price,
  href,
  sell,
  sellState,
  sellLabels,
  renderBuy,
  buttonLabel: buttonLabelProp,
  buttonVariant = 'solid',
  image,
  headingAs = 'h3',
  newTab,
  sponsored,
  nofollow,
  ...root
}: BlockRootProps &
  LinkBehavior &
  SellProps & {
    title: string;
    detail?: ReactNode;
    /** As "30 min". */
    duration: string;
    /** As "$40" or "Free". */
    price: string;
    /** The booking page. Not needed with `sell`. */
    href?: string;
    buttonLabel?: string;
    buttonVariant?: SiteButtonVariant;
    image?: ImageSrc | null;
    headingAs?: HeadingTag;
  }) {
  const own = usePageWords('props');
  const buttonLabel =
    buttonLabelProp === undefined ? own.bookCall : buttonLabelProp;
  return (
    <Block as="article" name="booking-card" {...root}>
      <ItemHead
        title={title}
        detail={detail}
        image={image}
        headingAs={headingAs}
      />
      <p className="m-0 flex items-center justify-between gap-3 text-sm">
        <span className="text-site-text-2 inline-flex items-center gap-1.5">
          <ClockIcon size={16} />
          {duration}
        </span>
        <Price value={price} />
      </p>
      <SellButton
        href={href}
        sell={sell}
        sellState={sellState}
        sellLabels={sellLabels}
        renderBuy={renderBuy}
        variant={buttonVariant}
        newTab={newTab}
        sponsored={sponsored}
        nofollow={nofollow}
        action="book"
      >
        {buttonLabel}
      </SellButton>
    </Block>
  );
}

/** A membership tier: the price per period, what members get and a link. */
export function MembershipCard({
  title,
  price,
  was,
  period: periodProp,
  perks,
  href,
  sell,
  sellState,
  sellLabels,
  renderBuy,
  buttonLabel: buttonLabelProp,
  featured = false,
  featuredLabel,
  ribbon,
  headingAs: Heading = 'h3',
  newTab,
  sponsored,
  nofollow,
  saveLabel,
  ...root
}: BlockRootProps &
  LinkBehavior &
  SellProps & {
    /** With `was`, what the visitor saves ("Save {amount}"); null hides it. */
    saveLabel?: string | null;
    title: string;
    price: string;
    /** The price before a discount. */
    was?: string;
    /** Shown as "/ month". */
    period?: string;
    perks: ReactNode[];
    /** Where members join. Not needed with `sell`. */
    href?: string;
    buttonLabel?: string;
    /** Outlines the tier in the button colour, for the one to pick. */
    featured?: boolean;
    /** A pill on the featured tier, such as "Most popular". */
    featuredLabel?: string;
    /** A small tilted label over the top corner, such as "Best value". */
    ribbon?: ReactNode;
    headingAs?: HeadingTag | SubHeadingTag;
  }) {
  const own = usePageWords('props');
  const period = periodProp === undefined ? own.month : periodProp;
  const buttonLabel =
    buttonLabelProp === undefined ? own.join : buttonLabelProp;
  return (
    <Block
      as="article"
      name="membership-card"
      {...root}
      className={cn(
        'relative border-2',
        featured ? 'border-site-button' : 'border-transparent',
        root.className
      )}
    >
      {ribbon ? <Ribbon>{ribbon}</Ribbon> : null}
      <div className="flex items-center justify-between gap-2">
        <Heading className="text-block-title m-0 font-bold">{title}</Heading>
        {featured && featuredLabel ? (
          <Badge tone="solid">{featuredLabel}</Badge>
        ) : null}
      </div>
      <p className="m-0">
        <Price
          saveLabel={saveLabel}
          value={price}
          was={was}
          period={period}
          size="lg"
        />
      </p>
      <CheckList items={perks} />
      <SellButton
        href={href}
        sell={sell}
        sellState={sellState}
        sellLabels={sellLabels}
        renderBuy={renderBuy}
        variant={featured ? 'solid' : 'outline'}
        newTab={newTab}
        sponsored={sponsored}
        nofollow={nofollow}
        action="join"
      >
        {buttonLabel}
      </SellButton>
    </Block>
  );
}

/** The words a lead magnet shows. */
export type LeadMagnetLabels = EmailFormLabels & { free: string };

export const LEAD_MAGNET_LABELS: LeadMagnetLabels = {
  ...EMAIL_FORM_LABELS,
  button: WORDS_EN.props.sendIt,
  sent: WORDS_EN.props.sentCheckInbox,
  free: WORDS_EN.props.free,
};

/**
 * Something free in return for an email address, such as a guide: the
 * visitor types their address and the creator's app sends it. `status` is
 * how the send went (see EmailForm). With `sell` (a free item), the form
 * also carries it, so the app can make the claim through BuildBase.
 */
export function LeadMagnet({
  title,
  detail,
  image,
  buttonLabel: buttonLabelProp,
  placeholder,
  labels,
  status,
  onSubmit,
  action,
  sell,
  headingAs = 'h3',
  ...root
}: BlockRootProps & {
  title: string;
  detail?: ReactNode;
  image?: ImageSrc | null;
  /** A free item to claim with the address. */
  sell?: SellProps['sell'];
  buttonLabel?: string;
  placeholder?: string;
  labels?: Partial<LeadMagnetLabels>;
  status?: FormStatus;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  action?: string | ((data: FormData) => void | Promise<void>);
  headingAs?: HeadingTag;
}) {
  const own = usePageWords('props');
  const { free = own.free, ...formLabels } = labels ?? {};
  // The props win over `labels`, as for every other block.
  const buttonLabel = buttonLabelProp ?? formLabels.button ?? own.sendIt;
  return (
    <Block as="article" name="lead-magnet" {...root}>
      <ItemHead
        title={title}
        detail={detail}
        eyebrow={free}
        image={image}
        media="top"
        headingAs={headingAs}
      />
      <EmailForm
        layout="stack"
        status={status}
        action={action}
        onSubmit={onSubmit}
        labels={{
          sent: own.sentCheckInbox,
          ...formLabels,
          button: buttonLabel,
          ...(placeholder ? { placeholder } : {}),
        }}
      >
        <SellField sell={sell} />
      </EmailForm>
    </Block>
  );
}
