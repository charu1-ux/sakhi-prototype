export default function PersonalCompanionPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3">
      <div className="from-vertical-personal-companion to-vertical-glow flex size-14 items-center justify-center rounded-full bg-gradient-to-r">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/shell/ico-personal-companion.svg" alt="" width={24} height={24} />
      </div>
      <p className="text-fg font-medium">Personal Companion</p>
      <p className="text-fg-muted text-sm">Design prototype coming soon</p>
    </main>
  );
}
