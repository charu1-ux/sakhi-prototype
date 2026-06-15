"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Check,
  ChevronRight,
  CreditCard,
  MapPin,
  Minus,
  Navigation,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@intelligence/ui";

import {
  APPLE_PRODUCTS,
  CART,
  CONFIRM_DELIVER_TO,
  CURRENT_LOCATION_LINE,
  formatRupees,
  GHEE_PRODUCTS,
  GROCERIES_ASSETS,
  KANPUR_ADDRESS,
  ORDER_META,
  type AddressTag,
  type Product,
  type SavedAddress,
  SAVED_ADDRESSES,
  type StoryAction,
} from "./story-data";

// ── Shared building blocks ───────────────────────────────────────────────────────

/** Secondary action button — light-purple bg, dark-purple text (JDS primary 30 / 60). */
export function SecondaryButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "bg-primary-30 text-primary-60 inline-flex h-12 w-full items-center justify-center gap-2",
        "rounded-full text-sm font-bold transition-transform duration-200 ease-out",
        "hover:scale-[1.02] active:scale-[0.97]",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Widget({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "bg-surface self-stretch overflow-hidden rounded-2xl border border-black/10",
        className,
      )}
    >
      {children}
    </div>
  );
}

function WidgetTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3.5 text-base font-bold">
      {children}
    </div>
  );
}

export function Tag({ tag }: { tag: AddressTag }) {
  const label = tag === "default" ? "DEFAULT" : tag === "test" ? "TEST" : "HOME";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-[3px] text-[10px] font-bold tracking-wide",
        tag === "default" && "bg-success/10 text-success",
        tag === "test" && "bg-sparkle-20 text-sparkle-50",
        tag === "home" && "bg-primary-20 text-primary-50",
      )}
    >
      {label}
    </span>
  );
}

// ── Product image ────────────────────────────────────────────────────────────────

function ProductImage({
  src,
  alt,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized
      className={cn("object-contain", className)}
    />
  );
}

// ── Stepper ──────────────────────────────────────────────────────────────────────

function Stepper({
  count,
  onMinus,
  onPlus,
  fullWidth,
}: {
  count: number;
  onMinus: () => void;
  onPlus: () => void;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-surface-minimal inline-flex items-center rounded-full p-1",
        fullWidth && "flex w-full justify-between",
      )}
    >
      <button
        type="button"
        aria-label="Decrease"
        onClick={onMinus}
        disabled={count <= 1}
        className="bg-surface text-fg flex size-[30px] items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-40"
      >
        <Minus size={16} strokeWidth={3} />
      </button>
      <span className="min-w-[30px] text-center text-sm font-bold">{count}</span>
      <button
        type="button"
        aria-label="Increase"
        onClick={onPlus}
        className="bg-surface text-fg flex size-[30px] items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        <Plus size={16} strokeWidth={3} />
      </button>
    </div>
  );
}

// ── Search swim lanes ────────────────────────────────────────────────────────────

const laneStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const laneItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 420, damping: 32 } },
};

function ProductCard({ product }: { product: Product }) {
  const [count, setCount] = useState(1);
  const [added, setAdded] = useState(product.state === "added");

  return (
    <motion.div
      variants={laneItem}
      className="bg-surface flex max-w-[150px] min-w-[150px] flex-col overflow-hidden rounded-xl border border-black/10"
    >
      <div
        className={cn(
          "bg-surface relative flex h-[108px] items-center justify-center border-b border-black/5",
          product.state === "oos" && "opacity-55",
        )}
      >
        {product.offLabel && (
          <span className="bg-success absolute top-2 left-2 z-10 rounded-md px-1.5 py-[3px] text-[10px] font-bold text-white">
            {product.offLabel}
          </span>
        )}
        <ProductImage src={product.image} alt={product.name} sizes="150px" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <div className="line-clamp-2 min-h-[35px] text-[13px] leading-snug font-medium">
          {product.name}
        </div>
        <div className="flex items-baseline gap-1.5">
          <b className="text-[15px] font-bold">{formatRupees(product.price)}</b>
          {product.mrp && <s className="text-fg-muted text-xs">{formatRupees(product.mrp)}</s>}
        </div>
        <div className="mt-auto pt-1">
          {product.state === "oos" ? (
            <button
              type="button"
              disabled
              className="bg-primary-30 text-primary-60 flex h-9 w-full items-center justify-center rounded-full text-[13px] font-bold opacity-45"
            >
              Out of stock
            </button>
          ) : added ? (
            <Stepper
              fullWidth
              count={count}
              onMinus={() => setCount((c) => Math.max(1, c - 1))}
              onPlus={() => setCount((c) => c + 1)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdded(true)}
              className="bg-primary-30 text-primary-60 flex h-9 w-full items-center justify-center rounded-full text-[13px] font-bold transition-transform duration-200 hover:scale-[1.02] active:scale-95"
            >
              + ADD
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SwimLane({ label, products }: { label: string; products: Product[] }) {
  return (
    <motion.div variants={laneItem} className="flex min-w-0 flex-col gap-0.5 self-stretch">
      <div className="pt-0.5 text-base font-bold">{label}</div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pt-3 pb-1">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </motion.div>
  );
}

export function SwimLanes() {
  return (
    <motion.div
      variants={laneStagger}
      initial="hidden"
      animate="show"
      className="flex min-w-0 flex-col gap-3 self-stretch"
    >
      <SwimLane label="Apples" products={APPLE_PRODUCTS} />
      <SwimLane label="Ghee" products={GHEE_PRODUCTS} />
      <motion.div variants={laneItem} className="flex gap-2.5 py-0.5">
        <button
          type="button"
          className="bg-primary-30 text-primary-60 inline-flex h-9 items-center rounded-full px-4 text-[13px] font-bold transition-transform duration-200 hover:scale-[1.02] active:scale-95"
        >
          View cart
        </button>
        <button
          type="button"
          className="bg-surface-minimal text-fg inline-flex h-9 items-center rounded-full px-4 text-[13px] font-bold transition-transform duration-200 hover:scale-[1.02] active:scale-95"
        >
          Search more
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Cart ─────────────────────────────────────────────────────────────────────────

export function CartWidget({ onAction }: { onAction: (a: StoryAction) => void }) {
  const [appleQty, setAppleQty] = useState(1);
  const [done, setDone] = useState(false);

  const appleLine = CART.appleUnit * appleQty;
  const total = appleLine + CART.gheeLine;
  const mrp = CART.appleMrpUnit * appleQty + CART.gheeMrp;
  const saved = mrp - total;
  const count = 2;

  return (
    <Widget>
      <WidgetTitle>
        Your Cart
        <span className="bg-primary-30 text-primary-50 ml-auto rounded-full px-3 py-[5px] text-[13px] leading-none font-bold">
          {count} items
        </span>
      </WidgetTitle>

      <div className="px-4">
        <CartItem
          image={`${GROCERIES_ASSETS}/apple-royal-gala.webp`}
          alt="Apple Royal Gala 4 pcs"
          name="Apple Royal Gala 4 pcs"
          sub={`500–700 g · Qty ${appleQty}`}
          price={formatRupees(appleLine)}
          onRemove={() => {}}
          stepper={
            <Stepper
              count={appleQty}
              onMinus={() => setAppleQty((q) => Math.max(1, q - 1))}
              onPlus={() => setAppleQty((q) => q + 1)}
            />
          }
        />
        <CartItem
          image={`${GROCERIES_ASSETS}/milkfood-rich-desi-ghee.webp`}
          alt="Milkfood Rich Desi Ghee 900 ml"
          name="Milkfood Rich Desi Ghee 900 ml"
          sub="900 ml · Qty 1"
          price={formatRupees(CART.gheeLine)}
          onRemove={() => {}}
          stepper={<Stepper count={1} onMinus={() => {}} onPlus={() => {}} />}
          last
        />
      </div>

      <div className="bg-surface border-t border-black/5 p-4">
        <Totals total={total} mrp={mrp} saved={saved} count={count} />
      </div>

      {!done && (
        <div className="px-4 pt-0 pb-4">
          <SecondaryButton
            onClick={() => {
              setDone(true);
              onAction("checkout");
            }}
          >
            Checkout
          </SecondaryButton>
        </div>
      )}
    </Widget>
  );
}

function CartItem({
  image,
  alt,
  name,
  sub,
  price,
  stepper,
  onRemove,
  last,
}: {
  image: string;
  alt: string;
  name: string;
  sub: string;
  price: string;
  stepper: React.ReactNode;
  onRemove?: () => void;
  last?: boolean;
}) {
  return (
    <div className={cn("flex gap-3 py-3.5", !last && "border-b border-black/5")}>
      <div className="bg-surface relative size-14 shrink-0 overflow-hidden rounded-lg border border-black/10">
        <ProductImage src={image} alt={alt} sizes="56px" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2.5">
          <div>
            <div className="text-sm leading-snug font-bold">{name}</div>
            <div className="text-fg-muted mt-0.5 text-xs font-medium">{sub}</div>
          </div>
          <div className="shrink-0 text-[15px] font-bold whitespace-nowrap">{price}</div>
        </div>
        {(stepper || onRemove) && (
          <div className="mt-2.5 flex items-center justify-end gap-2">
            {onRemove && (
              <button
                type="button"
                aria-label="Remove item"
                onClick={onRemove}
                className="bg-surface-minimal text-fg-muted flex size-9 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            )}
            {stepper}
          </div>
        )}
      </div>
    </div>
  );
}

function Totals({
  total,
  mrp,
  saved,
  count,
}: {
  total: number;
  mrp: number;
  saved: number;
  count: number;
}) {
  return (
    <>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-fg-muted text-sm font-medium">Bag total ({count} items)</span>
        <span className="text-sm font-bold">{formatRupees(total)}</span>
      </div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-fg-muted text-sm font-medium">Delivery</span>
        <span className="text-success text-sm font-bold">FREE</span>
      </div>
      <div className="my-3 h-px bg-black/10" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-bold">Total</div>
          <div className="text-fg-muted mt-0.5 text-xs font-medium">{count} items</div>
        </div>
        <div className="text-primary-50 text-lg font-bold">{formatRupees(total)}</div>
      </div>
      <div className="bg-success/10 mt-3.5 flex items-center gap-2 rounded-full px-3.5 py-2.5">
        <Check size={18} strokeWidth={2.6} className="text-success shrink-0" />
        <span className="text-success text-[13px] font-bold">
          You saved {formatRupees(saved)} on this order (MRP {formatRupees(mrp)})
        </span>
      </div>
    </>
  );
}

// ── Saved addresses ──────────────────────────────────────────────────────────────

function AddressRow({ address, divider }: { address: SavedAddress; divider?: boolean }) {
  return (
    <div
      className={cn("flex items-center gap-3 px-4 py-3.5", divider && "border-b border-black/5")}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
          {address.name}
          {address.tags.map((t) => (
            <Tag key={t} tag={t} />
          ))}
        </div>
        <div className="text-fg-muted mt-0.5 text-xs leading-snug font-medium">{address.line}</div>
      </div>
      <ChevronRight size={18} strokeWidth={2.4} className="text-fg-muted shrink-0" />
    </div>
  );
}

// Shared "Use current location" molecule — the same row used in the header
// address picker, reused inside the new-address widgets.
export function UseCurrentLocationRow({
  onClick,
  line = CURRENT_LOCATION_LINE,
  selected = false,
}: {
  onClick: () => void;
  line?: string;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
        selected ? "bg-primary-20/50" : "hover:bg-surface-minimal/60",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
          selected
            ? "bg-surface-moderate"
            : "bg-surface-minimal group-hover:bg-surface-moderate group-active:bg-surface-moderate",
        )}
      >
        <Navigation size={16} strokeWidth={2.2} className="text-fg-muted" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">Use current location</span>
        <span className="text-fg-muted mt-0.5 line-clamp-2 block text-xs leading-snug font-medium">
          {line}
        </span>
      </span>
    </button>
  );
}

// Two small pill buttons under the "confirm delivery address" prompt.
export function ConfirmAddressActions({ onAction }: { onAction: (a: StoryAction) => void }) {
  const [done, setDone] = useState(false);
  if (done) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => {
          setDone(true);
          onAction("confirm-address");
        }}
        className="bg-primary-30 text-primary-60 inline-flex h-9 items-center rounded-full px-4 text-[13px] font-bold transition-transform duration-200 hover:scale-[1.02] active:scale-95"
      >
        Confirm address
      </button>
      <button
        type="button"
        onClick={() => {
          setDone(true);
          onAction("change-address");
        }}
        className="bg-surface-minimal text-fg inline-flex h-9 items-center rounded-full px-4 text-[13px] font-bold transition-transform duration-200 hover:scale-[1.02] active:scale-95"
      >
        Change address
      </button>
    </div>
  );
}

// Confirmation card — the delivery address now set (Home).
export function DeliveryAddressWidget() {
  return (
    <Widget>
      <div className="bg-success/10 flex items-center gap-2.5 border-b border-black/5 px-4 py-3.5">
        <Check size={20} strokeWidth={2.6} className="text-success" />
        <span className="text-success text-sm font-bold">Delivery address</span>
      </div>
      <AddressRow address={SAVED_ADDRESSES[0]} />
    </Widget>
  );
}

// Single CTA shown after confirmation to start the add-new-address flow.
export function AddNewAddressAction({ onAction }: { onAction: (a: StoryAction) => void }) {
  return (
    <SecondaryButton onClick={() => onAction("add-new-address")}>
      <Plus size={18} strokeWidth={2.4} />
      Add a new address
    </SecondaryButton>
  );
}

export function SavedAddressesWidget() {
  return (
    <Widget>
      <WidgetTitle>Saved addresses</WidgetTitle>
      {SAVED_ADDRESSES.map((a, i) => (
        <AddressRow key={a.id} address={a} divider={i < SAVED_ADDRESSES.length - 1} />
      ))}
      <button
        type="button"
        className="bg-surface-ghost text-fg m-4 inline-flex items-center gap-1.5 self-start rounded-full px-4 py-2.5 text-[13px] font-bold transition-transform duration-200 hover:scale-[1.02] active:scale-95"
      >
        <Plus size={16} strokeWidth={2.4} />
        Add new address
      </button>
    </Widget>
  );
}

// ── Delivery updated ─────────────────────────────────────────────────────────────

export function DeliveryUpdatedWidget() {
  return (
    <Widget>
      <div className="bg-success/10 flex items-center gap-2.5 border-b border-black/5 px-4 py-3.5">
        <Check size={20} strokeWidth={2.6} className="text-success" />
        <span className="text-success text-sm font-bold">Delivery address updated</span>
      </div>
      <AddressRow address={KANPUR_ADDRESS} />
    </Widget>
  );
}

// ── New address — capture location ───────────────────────────────────────────────

export function NewAddressLocationWidget({ onAction }: { onAction: (a: StoryAction) => void }) {
  // The rows open the address sheet, which can be cancelled — so they don't
  // self-hide on tap. The conversation only moves on once the sheet is saved.
  return (
    <Widget>
      <WidgetTitle>New delivery address</WidgetTitle>
      <UseCurrentLocationRow onClick={() => onAction("use-current-location")} />
      <div className="h-px bg-black/5" />
      <button
        type="button"
        onClick={() => onAction("add-new-address")}
        className="group hover:bg-surface-minimal/60 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
      >
        <span className="bg-surface-minimal group-hover:bg-surface-moderate group-focus-visible:bg-surface-moderate group-active:bg-surface-moderate flex size-8 shrink-0 items-center justify-center rounded-full transition-colors">
          <Plus size={16} strokeWidth={2.4} className="text-fg-muted" />
        </span>
        <span className="text-sm font-bold">Add new address</span>
      </button>
      <div className="h-px bg-black/5" />
      <p className="text-fg-muted px-4 py-3 text-xs leading-relaxed font-medium">
        We use your location to give you accurate delivery ETAs and stock.
      </p>
    </Widget>
  );
}

// ── New address — captured form ──────────────────────────────────────────────────

// JDS FormField / Input — MCP §11.12 (white bg, rounded-md, border darkens to
// surface-moderate on focus; no focus ring).
function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="flex w-full flex-col gap-1">
      <label className="text-body-xs font-jio text-[rgba(12,13,16,0.65)]">{label}</label>
      <div className="focus-within:border-surface-moderate flex flex-row items-center gap-2 rounded-md border border-[rgba(12,13,16,0.12)] bg-white px-3">
        <input
          placeholder={placeholder}
          className="text-body-s font-jio min-w-0 flex-1 bg-transparent py-3.5 text-[#0c0d10] outline-none placeholder:text-[rgba(12,13,16,0.38)]"
        />
      </div>
    </div>
  );
}

export function NewAddressFormWidget({ onAction }: { onAction: (a: StoryAction) => void }) {
  return (
    <Widget>
      <WidgetTitle>New delivery address</WidgetTitle>
      <div className="flex flex-col gap-3.5 p-4">
        <SecondaryButton>
          <MapPin size={18} strokeWidth={2} />
          Update location
        </SecondaryButton>
        <Field label="Name" placeholder="Recipient name" />
        <Field label="Phone" placeholder="10-digit mobile" />
        <Field label="House / Flat / Building" placeholder="e.g. 801, Sai Ganga" />
        <Field label="Area" placeholder="e.g. Sector 5" />
        <Field label="Landmark" placeholder="Nearby landmark" />
        <div className="flex gap-2.5">
          <div className="flex-1">
            <Field label="Pincode" placeholder="6 digits" />
          </div>
          <div className="flex-1">
            <Field label="City" placeholder="City" />
          </div>
        </div>
        <Field label="State" placeholder="State" />
        <SecondaryButton onClick={() => onAction("save-address")} className="mt-1">
          Save &amp; use this address
        </SecondaryButton>
      </div>
    </Widget>
  );
}

// ── Confirm order ────────────────────────────────────────────────────────────────

export function ConfirmOrderWidget({ onAction }: { onAction: (a: StoryAction) => void }) {
  const [done, setDone] = useState(false);
  return (
    <Widget>
      <WidgetTitle>Confirm your order</WidgetTitle>

      <div className="border-b border-black/5 px-4 py-3.5">
        <div className="text-fg-muted text-[10px] font-bold tracking-wide uppercase">
          Delivering to
        </div>
        <div className="mt-1 flex items-center gap-2 text-[15px] font-bold">
          {CONFIRM_DELIVER_TO.name}
          <Tag tag={CONFIRM_DELIVER_TO.tag} />
        </div>
        <div className="text-fg-muted mt-1 text-[13px] leading-snug font-medium">
          {CONFIRM_DELIVER_TO.line}
        </div>
      </div>

      <div className="px-4">
        <CartItem
          image={`${GROCERIES_ASSETS}/apple-royal-gala.webp`}
          alt="Apple Royal Gala 4 pcs"
          name="Apple Royal Gala 4 pcs"
          sub="500–700 g · Qty 1"
          price={formatRupees(220)}
          stepper={null}
        />
        <CartItem
          image={`${GROCERIES_ASSETS}/milkfood-rich-desi-ghee.webp`}
          alt="Milkfood Rich Desi Ghee 900 ml"
          name="Milkfood Rich Desi Ghee 900 ml"
          sub="900 ml · Qty 1"
          price={formatRupees(CART.gheeLine)}
          stepper={null}
          last
        />
      </div>

      <div className="bg-surface border-t border-black/5 p-4">
        <Totals total={779} mrp={890} saved={111} count={2} />
      </div>

      <div className="flex items-center gap-2.5 border-t border-black/5 px-4 py-3.5 text-[15px] font-bold">
        <CreditCard size={22} strokeWidth={2} />
        Cash on Delivery
      </div>

      {!done && (
        <div className="px-4 pt-0 pb-4">
          <SecondaryButton
            onClick={() => {
              setDone(true);
              onAction("place-order");
            }}
          >
            Place Order
          </SecondaryButton>
        </div>
      )}
    </Widget>
  );
}

// ── Order placed ─────────────────────────────────────────────────────────────────

export function OrderPlacedWidget({ onAction }: { onAction: (a: StoryAction) => void }) {
  return (
    <Widget>
      <div className="flex flex-col items-center gap-1.5 px-4 pt-6 pb-4 text-center">
        <div className="bg-success/10 text-success mb-1.5 flex size-16 items-center justify-center rounded-full">
          <Check size={32} strokeWidth={2.6} />
        </div>
        <div className="text-xl font-black tracking-tight">Order placed!</div>
        <div className="text-fg-muted text-sm leading-relaxed font-medium">
          Your JioMart order is confirmed and on its way.
        </div>
        <div className="bg-surface mt-3.5 flex flex-col gap-2.5 self-stretch rounded-xl border border-black/10 p-4">
          <MetaRow label="Order ID" value={ORDER_META.id} />
          <MetaRow label="Arriving by" value={ORDER_META.arriving} />
          <MetaRow label="Paying" value={ORDER_META.paying} />
        </div>
      </div>
      <div className="p-4">
        <SecondaryButton onClick={() => onAction("track-order")}>Track order</SecondaryButton>
      </div>
    </Widget>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-fg-muted font-medium">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
