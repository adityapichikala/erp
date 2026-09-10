import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Header bar */}
      <div className="w-full max-w-2xl mb-12 pb-6 border-b border-border">
        <span className="badge-gold">University ERP</span>
        <h1
          className="mt-4 text-4xl font-serif text-primary"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Integrated University Management System
        </h1>
        <p className="mt-3 text-secondary text-base leading-relaxed">
          A comprehensive platform for admissions, academics, finance, library,
          hostel, HR, and placement — built on Next.js, Prisma, and Supabase.
        </p>
      </div>

      {/* Stack confirmation */}
      <div className="w-full max-w-2xl space-y-3">
        <h2
          className="text-sm font-semibold uppercase tracking-widest text-secondary mb-4"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Stack Status
        </h2>

        <StackItem label="Next.js App Router" status="active" />
        <StackItem label="TypeScript" status="active" />
        <StackItem label="Tailwind CSS v4" status="active" />
        <StackItem label="Prisma ORM" status="active" note="Schema to be applied in Prompt 1" />
        <StackItem label="Supabase Postgres" status="pending" note="Run prisma migrate in Prompt 1" />
        <StackItem label="Supabase Storage" status="pending" note="Bucket: erp-uploads (create manually)" />
        <StackItem label="JWT Auth" status="pending" note="Built in Prompt 2" />

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-secondary">
            Fonts loaded:{' '}
            <span
              style={{ fontFamily: 'var(--font-serif)' }}
              className="text-primary font-semibold"
            >
              Source Serif 4
            </span>{' '}
            &amp;{' '}
            <span
              style={{ fontFamily: 'var(--font-sans)' }}
              className="text-primary font-semibold"
            >
              Inter
            </span>
          </p>
          <p className="mt-2 text-sm text-secondary">
            Palette:{' '}
            <ColorSwatch color="#12213C" label="Navy" /> ·{' '}
            <ColorSwatch color="#FAF8F3" label="Off-white" border /> ·{' '}
            <ColorSwatch color="#5B6472" label="Slate" /> ·{' '}
            <ColorSwatch color="#C9A24B" label="Gold" />
          </p>
        </div>

        <div className="mt-6">
          <Link href="/login" className="btn-primary">
            Go to Login →
          </Link>
        </div>
      </div>
    </main>
  )
}

function StackItem({
  label,
  status,
  note,
}: {
  label: string
  status: 'active' | 'pending' | 'error'
  note?: string
}) {
  const dot =
    status === 'active'
      ? 'bg-success'
      : status === 'error'
        ? 'bg-error'
        : 'bg-warning'

  const statusLabel =
    status === 'active' ? 'Ready' : status === 'error' ? 'Error' : 'Pending'

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <span
          className={`w-2 h-2 rounded-full ${dot}`}
          style={{
            backgroundColor:
              status === 'active'
                ? 'var(--color-success)'
                : status === 'error'
                  ? 'var(--color-error)'
                  : 'var(--color-gold)',
          }}
        />
        <span className="text-sm font-medium text-primary">{label}</span>
        {note && (
          <span className="text-xs text-secondary hidden sm:block">{note}</span>
        )}
      </div>
      <span
        className="text-xs font-semibold uppercase tracking-wide"
        style={{
          color:
            status === 'active'
              ? 'var(--color-success)'
              : status === 'error'
                ? 'var(--color-error)'
                : 'var(--color-gold)',
        }}
      >
        {statusLabel}
      </span>
    </div>
  )
}

function ColorSwatch({
  color,
  label,
  border,
}: {
  color: string
  label: string
  border?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block w-3 h-3 rounded-sm align-middle"
        style={{
          backgroundColor: color,
          border: border ? '1px solid var(--color-border)' : undefined,
        }}
      />
      <span className="text-xs text-secondary">{label}</span>
    </span>
  )
}
