"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  Loader2,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { cn } from "@intelligence/ui";

import {
  CURRENT_LOCATION_LINE,
  type AddressTag,
  SAVED_ADDRESSES,
  type SavedAddress,
} from "./story-data";
import { SecondaryButton, Tag, UseCurrentLocationRow } from "./story-widgets";

// ── Data ───────────────────────────────────────────────────────────────────────

const TAG_TEXT: Record<AddressTag, string> = {
  home: "Home",
  default: "Default",
  test: "Test",
};

// Pseudo-address for the "use current location" option in the picker.
const CURRENT_LOCATION: SavedAddress = {
  id: "current",
  name: "Current location",
  tags: [],
  line: CURRENT_LOCATION_LINE,
};

type FormState = {
  name: string;
  phone: string;
  house: string;
  area: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  house: "",
  area: "",
  landmark: "",
  pincode: "",
  city: "",
  state: "",
};

// Reverse-geocoded sample used when "Use my current location" is tapped.
const DETECTED_ADDRESS: FormState = {
  name: "Gokul Kumar",
  phone: "98765 43210",
  house: "801, Sai Ganga",
  area: "Sector 5",
  landmark: "Near Indiranagar Metro",
  pincode: "560038",
  city: "Bengaluru",
  state: "Karnataka",
};

const tagText = (a: SavedAddress) => (a.tags[0] ? TAG_TEXT[a.tags[0]] : a.name);

// Build the one-line summary stored on a saved address.
function buildLine(f: FormState): string {
  return (
    [f.house, f.area, f.landmark, [f.city, f.state].filter(Boolean).join(", ")]
      .filter(Boolean)
      .join(", ") + (f.pincode ? ` · ${f.pincode}` : "")
  );
}

// Structured fields for the Edit form (falls back to name + line if unset).
function detailsOf(a: SavedAddress): FormState {
  return (
    a.details ?? {
      name: a.name,
      phone: "",
      house: a.line,
      area: "",
      landmark: "",
      pincode: "",
      city: "",
      state: "",
    }
  );
}

// ── Component ───────────────────────────────────────────────────────────────────

export type DeliveryAddressMenuHandle = {
  /** Open straight into the "New delivery address" form from chat. manual=false
   *  shows the detected location immediately; manual=true detects it with a spinner. */
  openAddNew: (opts?: { manual?: boolean; onSaved?: () => void }) => void;
};

export const DeliveryAddressMenu = forwardRef<DeliveryAddressMenuHandle>(
  function DeliveryAddressMenu(_props, ref) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"list" | "form">("list");
    const [fromChat, setFromChat] = useState(false);
    const [locating, setLocating] = useState(false); // spinner while "detecting"
    const [located, setLocated] = useState(false); // current location populated
    const locateTimerRef = useRef<number | null>(null);
    const [addresses, setAddresses] = useState<SavedAddress[]>(SAVED_ADDRESSES);
    const [selectedId, setSelectedId] = useState(SAVED_ADDRESSES[0].id);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [kebabId, setKebabId] = useState<string | null>(null); // open 3-dot menu
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null); // address being edited
    const [formLine, setFormLine] = useState(CURRENT_LOCATION_LINE); // line shown in the form's location area
    const onSavedRef = useRef<(() => void) | null>(null);
    // The sheet is `fixed` inside the phone frame; measure the frame so the form
    // height is a definite px value. Viewport units (dvh) resolve to the real
    // window, which overshoots the frame and pushes the footer off-screen.
    const frameRef = useRef<HTMLDivElement>(null);
    const [frameH, setFrameH] = useState(0);

    useEffect(() => {
      if (!open) return;
      const measure = () => setFrameH(frameRef.current?.clientHeight ?? 0);
      measure();
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }, [open]);

    // Measure the list's natural height so the list → form morph animates px → px.
    // Animating from "auto" makes Framer briefly snap to the form's full content
    // height and then shrink to 80% (the "extend past the fields, then jump" jank).
    const panelRef = useRef<HTMLDivElement>(null);
    const [listH, setListH] = useState(0);

    useEffect(() => {
      if (open && mode === "list") {
        // Measure the list CONTENT, not the panel — mid-morph the panel may still
        // be at the form's height, which makes scrollHeight report 80%.
        const content = panelRef.current?.firstElementChild as HTMLElement | null;
        if (content) setListH(content.offsetHeight);
      }
    }, [open, mode]);

    const pool = [CURRENT_LOCATION, ...addresses];
    const selected = pool.find((a) => a.id === selectedId) ?? addresses[0];

    useImperativeHandle(
      ref,
      () => ({
        openAddNew(opts) {
          const isManual = opts?.manual ?? false;
          onSavedRef.current = opts?.onSaved ?? null;
          if (locateTimerRef.current) window.clearTimeout(locateTimerRef.current);
          locateTimerRef.current = null;
          setEditId(null);
          setFormLine(CURRENT_LOCATION_LINE);
          setLocating(false);
          if (isManual) {
            // "Add new address": blank form with a tappable "Use current location"
            // (detection only runs when the user taps it).
            setForm(EMPTY_FORM);
            setLocated(false);
          } else {
            // "Use current location": already detected → show it populated.
            setForm(DETECTED_ADDRESS);
            setLocated(true);
          }
          setFromChat(true);
          setMode("form");
          setOpen(true);
        },
      }),
      [],
    );

    function openMenu() {
      setFromChat(false);
      setMode("list");
      setOpen(true);
    }
    function close() {
      if (locateTimerRef.current) window.clearTimeout(locateTimerRef.current);
      locateTimerRef.current = null;
      setOpen(false);
      setMode("list");
      setFromChat(false);
      setLocating(false);
      setLocated(false);
      setKebabId(null);
      setConfirmDeleteId(null);
      setEditId(null);
      setFormLine(CURRENT_LOCATION_LINE);
      onSavedRef.current = null;
    }
    function selectAddress(id: string) {
      setSelectedId(id);
      close();
    }
    function toggleKebab(id: string) {
      setKebabId((k) => (k === id ? null : id));
    }
    function requestDelete(id: string) {
      setKebabId(null);
      setConfirmDeleteId(id);
    }
    function confirmDelete() {
      const id = confirmDeleteId;
      if (!id) return;
      const remaining = addresses.filter((a) => a.id !== id);
      setAddresses(remaining);
      if (selectedId === id) setSelectedId(remaining[0]?.id ?? CURRENT_LOCATION.id);
      setConfirmDeleteId(null);
    }
    function openEdit(a: SavedAddress) {
      setKebabId(null);
      setEditId(a.id);
      setForm(detailsOf(a));
      setFormLine(a.line);
      setLocated(true);
      setLocating(false);
      setFromChat(false);
      setMode("form");
    }
    function useCurrentLocation() {
      // Tap inside the form → spinner in the location area, then populate.
      if (locateTimerRef.current) window.clearTimeout(locateTimerRef.current);
      setLocating(true);
      locateTimerRef.current = window.setTimeout(() => {
        setForm(DETECTED_ADDRESS);
        setLocated(true);
        setLocating(false);
        locateTimerRef.current = null;
      }, 1200);
    }
    function saveAddress() {
      const line = buildLine(form);
      if (editId) {
        // Editing an existing address → update in place, return to the list.
        setAddresses((prev) =>
          prev.map((a) =>
            a.id === editId ? { ...a, name: form.name || a.name, line, details: { ...form } } : a,
          ),
        );
        setEditId(null);
        setForm(EMPTY_FORM);
        setMode("list");
        return;
      }
      const addr: SavedAddress = {
        id: `new-${Date.now()}`,
        name: form.name || "New address",
        tags: [],
        line,
        details: { ...form },
      };
      setAddresses((prev) => [addr, ...prev]);
      setSelectedId(addr.id);
      setForm(EMPTY_FORM);
      if (fromChat) {
        // Opened from chat → close the sheet and let the conversation continue.
        const cb = onSavedRef.current;
        onSavedRef.current = null;
        if (locateTimerRef.current) window.clearTimeout(locateTimerRef.current);
        locateTimerRef.current = null;
        setFromChat(false);
        setLocating(false);
        setLocated(false);
        setOpen(false);
        cb?.();
      } else {
        setMode("list"); // morph back to the (now updated) saved-address list
      }
    }

    return (
      <>
        {/* Header trigger — "Delivering to" + truncated address (space kept on the
          right for future icons). */}
        <button
          type="button"
          onClick={openMenu}
          aria-label="Change delivery address"
          className="group flex min-w-0 flex-1 flex-col items-start text-left"
        >
          <span className="text-fg-muted text-[11px] leading-none font-semibold tracking-wide">
            Delivering to
          </span>
          <span className="mt-1 flex w-full min-w-0 items-center gap-1">
            <span className="truncate text-[15px] leading-tight font-bold">
              {tagText(selected)} · {selected.line}
            </span>
            <ChevronDown size={16} strokeWidth={2.4} className="text-fg-muted shrink-0" />
          </span>
        </button>

        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="backdrop"
                ref={frameRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={close}
                className="fixed inset-0 z-40 bg-black/25"
              />
              <motion.div
                key="panel"
                ref={panelRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  // Form = 80% of the phone frame; list = its measured height. Both px
                  // so the morph never snaps to the form's auto height first.
                  height: mode === "form" && frameH ? Math.round(frameH * 0.8) : listH || "auto",
                }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 34,
                  height: { type: "spring", stiffness: 340, damping: 38 },
                }}
                className="bg-surface fixed inset-x-3 z-50 flex flex-col overflow-hidden rounded-[28px] shadow-[0_16px_50px_rgba(0,0,0,0.22)]"
                style={{
                  top: "calc(env(safe-area-inset-top, 0px) + 12px)",
                  maxHeight: frameH ? frameH - 24 : undefined,
                }}
              >
                {mode === "list" ? (
                  <ListContent
                    addresses={addresses}
                    selectedId={selectedId}
                    kebabId={kebabId}
                    onSelect={selectAddress}
                    onToggleKebab={toggleKebab}
                    onEdit={openEdit}
                    onDeleteRequest={requestDelete}
                    onAddNew={() => {
                      setEditId(null);
                      setFormLine(CURRENT_LOCATION_LINE);
                      setLocated(false);
                      setLocating(false);
                      setForm(EMPTY_FORM);
                      setMode("form");
                    }}
                    onClose={close}
                  />
                ) : (
                  <FormContent
                    form={form}
                    setForm={setForm}
                    fromChat={fromChat}
                    locating={locating}
                    located={located}
                    editing={editId !== null}
                    locationLine={formLine}
                    onUseLocation={useCurrentLocation}
                    onBack={() => setMode("list")}
                    onClose={close}
                    onSave={saveAddress}
                  />
                )}
              </motion.div>

              {/* Delete confirmation — centred on the whole screen, above the sheet */}
              {confirmDeleteId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-8">
                  <div
                    className="bg-surface w-full max-w-[320px] rounded-2xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-fg text-center text-[15px] leading-relaxed font-medium">
                      Are you sure you want to remove this address?
                    </p>
                    <div className="mt-4 flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="bg-surface-minimal text-fg h-11 flex-1 rounded-full text-sm font-bold transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={confirmDelete}
                        className="bg-error/10 text-error h-11 flex-1 rounded-full text-sm font-bold transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                      >
                        Yes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </>
    );
  },
);

// ── List mode ───────────────────────────────────────────────────────────────────

function PanelHeader({
  title,
  onBack,
  onClose,
}: {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-black/5 px-4 py-3.5">
      {onBack && (
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="bg-surface-minimal text-fg flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
        </button>
      )}
      <h2 className="flex-1 text-base font-bold">{title}</h2>
      {onClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="bg-surface-minimal text-fg-muted flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <X size={17} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
}

function ListContent({
  addresses,
  selectedId,
  kebabId,
  onSelect,
  onToggleKebab,
  onEdit,
  onDeleteRequest,
  onAddNew,
  onClose,
}: {
  addresses: SavedAddress[];
  selectedId: string;
  kebabId: string | null;
  onSelect: (id: string) => void;
  onToggleKebab: (id: string) => void;
  onEdit: (a: SavedAddress) => void;
  onDeleteRequest: (id: string) => void;
  onAddNew: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <PanelHeader title="Delivery address" onClose={onClose} />

      <div className="min-h-0 flex-1">
        {/* Use current location */}
        <UseCurrentLocationRow
          line={CURRENT_LOCATION.line}
          selected={selectedId === CURRENT_LOCATION.id}
          onClick={() => onSelect(CURRENT_LOCATION.id)}
        />

        <div className="text-fg-muted px-4 pt-3 pb-1 text-[11px] font-bold tracking-wide uppercase">
          Saved addresses
        </div>

        {addresses.map((a, i) => (
          <PickRow
            key={a.id}
            address={a}
            selected={selectedId === a.id}
            kebabOpen={kebabId === a.id}
            openUp={i >= addresses.length - 2}
            onSelect={() => onSelect(a.id)}
            onToggleKebab={() => onToggleKebab(a.id)}
            onEdit={() => onEdit(a)}
            onDelete={() => onDeleteRequest(a.id)}
          />
        ))}
      </div>

      <div className="shrink-0 border-t border-black/5 p-3">
        <SecondaryButton onClick={onAddNew}>
          <Plus size={18} strokeWidth={2.4} />
          Add new address
        </SecondaryButton>
      </div>
    </div>
  );
}

// Saved-address row. Selected = purple bg + one-shade-darker icon (no check).
// The 3-dot opens a per-address menu (Delete / Edit / Set as delivery / Cancel).
function PickRow({
  address,
  selected,
  kebabOpen,
  openUp,
  onSelect,
  onToggleKebab,
  onEdit,
  onDelete,
}: {
  address: SavedAddress;
  selected: boolean;
  kebabOpen: boolean;
  openUp: boolean;
  onSelect: () => void;
  onToggleKebab: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn("relative flex items-start transition-colors", selected && "bg-primary-20/50")}
    >
      <button
        type="button"
        onClick={onSelect}
        className="group flex min-w-0 flex-1 items-start gap-3 py-3 pr-1 pl-4 text-left"
      >
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
            selected
              ? "bg-surface-moderate"
              : "bg-surface-minimal group-hover:bg-surface-moderate group-active:bg-surface-moderate",
          )}
        >
          <MapPin size={16} strokeWidth={2.2} className="text-fg-muted" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2 text-sm font-bold">
            {tagText(address)}
            {address.tags.map((t) => (
              <Tag key={t} tag={t} />
            ))}
          </span>
          <span className="text-fg-muted mt-0.5 line-clamp-2 text-xs leading-snug font-medium">
            {address.line}
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-label="More options"
        onClick={onToggleKebab}
        className="text-fg-muted hover:bg-surface-minimal mt-1.5 mr-2 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors active:scale-95"
      >
        <MoreHorizontal size={18} strokeWidth={2.2} />
      </button>
      {kebabOpen && (
        <KebabMenu
          openUp={openUp}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          onCancel={onToggleKebab}
        />
      )}
    </div>
  );
}

function KebabMenu({
  openUp,
  onEdit,
  onDelete,
  onSelect,
  onCancel,
}: {
  openUp: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className={cn(
        "bg-surface absolute right-3 z-30 w-56 overflow-hidden rounded-2xl border border-black/10 py-1 shadow-[0_12px_36px_rgba(0,0,0,0.18)]",
        openUp ? "bottom-12" : "top-12",
      )}
    >
      <KebabItem onClick={onDelete} danger>
        <Trash2 size={16} strokeWidth={2.2} />
        Delete
      </KebabItem>
      <KebabItem onClick={onEdit}>
        <Pencil size={16} strokeWidth={2.2} />
        Edit
      </KebabItem>
      <KebabItem onClick={onSelect}>
        <MapPin size={16} strokeWidth={2.2} />
        Set as delivery address
      </KebabItem>
      <KebabItem onClick={onCancel}>
        <X size={16} strokeWidth={2.2} />
        Cancel
      </KebabItem>
    </div>
  );
}

function KebabItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "hover:bg-surface-minimal flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-medium transition-colors",
        danger ? "text-error" : "text-fg",
      )}
    >
      {children}
    </button>
  );
}

// ── Form mode (New Delivery Address) ─────────────────────────────────────────────

// Location header shown inside the form. While detecting it shows a spinner,
// then the populated address line (the detected location, or — when editing —
// the address being edited).
function CurrentLocationArea({ locating, line }: { locating: boolean; line: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="bg-surface-minimal mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
        {locating ? (
          <Loader2 className="text-fg-muted size-4 animate-spin" />
        ) : (
          <MapPin size={16} strokeWidth={2.2} className="text-fg-muted" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">Current location</span>
        <span className="text-fg-muted mt-0.5 block text-xs leading-snug font-medium">
          {locating ? "Detecting your current location…" : line}
        </span>
      </span>
    </div>
  );
}

function FormContent({
  form,
  setForm,
  fromChat,
  locating,
  located,
  editing,
  locationLine,
  onUseLocation,
  onBack,
  onClose,
  onSave,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  fromChat: boolean;
  locating: boolean;
  located: boolean;
  editing: boolean;
  locationLine: string;
  onUseLocation: () => void;
  onBack: () => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* From chat: a close ✕ + the detected location (no back, no picker row).
          From the list / edit: a back arrow + the tappable "Use current location". */}
      <PanelHeader
        title={editing ? "Edit delivery address" : "New Delivery Address"}
        onBack={fromChat ? undefined : onBack}
        onClose={fromChat ? onClose : undefined}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {located || locating ? (
          <CurrentLocationArea locating={locating} line={locationLine} />
        ) : (
          /* Tappable "Use current location" — the tap runs the spinner → populate */
          <UseCurrentLocationRow line="Detect your delivery address" onClick={onUseLocation} />
        )}
        <div className="h-px bg-black/5" />
        <div className="flex flex-col gap-3.5 px-4 pt-3 pb-4">
          <MenuField
            label="Name"
            placeholder="Recipient name"
            value={form.name}
            onChange={set("name")}
          />
          <MenuField
            label="Phone"
            placeholder="10-digit mobile"
            value={form.phone}
            onChange={set("phone")}
            inputMode="tel"
          />
          <MenuField
            label="House / Flat / Building"
            placeholder="e.g. 801, Sai Ganga"
            value={form.house}
            onChange={set("house")}
          />
          <MenuField
            label="Area"
            placeholder="e.g. Sector 5"
            value={form.area}
            onChange={set("area")}
          />
          <MenuField
            label="Landmark"
            placeholder="Nearby landmark"
            value={form.landmark}
            onChange={set("landmark")}
          />
          <div className="flex gap-2.5">
            <div className="min-w-0 flex-1">
              <MenuField
                label="Pincode"
                placeholder="6 digits"
                value={form.pincode}
                onChange={set("pincode")}
                inputMode="numeric"
              />
            </div>
            <div className="min-w-0 flex-1">
              <MenuField label="City" placeholder="City" value={form.city} onChange={set("city")} />
            </div>
          </div>
          <MenuField label="State" placeholder="State" value={form.state} onChange={set("state")} />
        </div>
      </div>

      {/* Fixed footer — single action */}
      <div className="bg-surface shrink-0 border-t border-black/5 p-4">
        <SecondaryButton onClick={onSave}>Save this address</SecondaryButton>
      </div>
    </div>
  );
}

function MenuField({
  label,
  placeholder,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: "tel" | "numeric";
}) {
  // JDS FormField / Input — MCP §11.12.
  return (
    <div className="flex w-full flex-col gap-1">
      <label className="text-body-xs font-jio text-[rgba(12,13,16,0.65)]">{label}</label>
      <div className="flex flex-row items-center gap-2 rounded-md border border-[rgba(12,13,16,0.12)] bg-white px-3 focus-within:border-[rgba(12,13,16,0.55)]">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="text-body-s font-jio min-w-0 flex-1 bg-transparent py-3.5 text-[#0c0d10] outline-none placeholder:text-[rgba(12,13,16,0.38)]"
        />
      </div>
    </div>
  );
}
