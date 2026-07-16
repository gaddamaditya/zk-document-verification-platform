import { ElementType, ReactNode } from 'react';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HeroAction = {
  label: string;
  href: string;
  variant?: 'default' | 'outline' | 'secondary';
};

type HeroInfoCard = {
  title: string;
  items: string[];
  accent?: 'cyan' | 'purple';
};

export function LandingHero({
  eyebrow,
  title,
  subtitle,
  actions,
  stats,
  infoCards,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions: HeroAction[];
  stats: Array<{ label: string; value: string }>;
  infoCards?: HeroInfoCard[];
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 shadow-[0_24px_100px_rgba(2,6,23,0.55)] sm:px-10 sm:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
      <div className="relative grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            {eyebrow}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            {actions.map((action) => (
              <Button
                key={action.href}
                href={action.href}
                variant={action.variant ?? 'default'}
                size="lg"
                className="min-w-[180px] justify-between"
              >
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.14 }}
          className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5 backdrop-blur-xl sm:grid-cols-2"
        >
          {infoCards && infoCards.length > 0 ? (
            infoCards.map((card) => {
              const accentClasses =
                card.accent === 'purple'
                  ? 'border-purple-400/20 bg-purple-400/10 text-purple-50'
                  : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-50';

              return (
                <div
                  key={card.title}
                  className={cn('rounded-2xl border p-5 sm:col-span-2', accentClasses)}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                    {card.title}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {card.items.map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs leading-6"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <p className="text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))
          )}
          <div className="sm:col-span-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm leading-7 text-cyan-50">
            This interface is intentionally designed for academic demonstration: privacy first, backend second.
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={cn('max-w-3xl', centered && 'mx-auto text-center')}>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
        className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mt-4 text-base leading-8 text-slate-400"
      >
        {description}
      </motion.p>
    </div>
  );
}

export function GlassCard({
  icon,
  title,
  description,
  className = '',
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className={cn(
        'group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl transition-transform',
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_32%)] opacity-70" />
      <div className="relative">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-cyan-300">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
        {children && <div className="mt-5">{children}</div>}
      </div>
    </motion.div>
  );
}

export function ComparisonTable({
  rows,
}: {
  rows: Array<{ label: string; traditional: string; zkp: string }>;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl">
      <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-white/10 bg-slate-950/40 px-5 py-4 text-sm font-semibold text-slate-200">
        <div>Verification Aspect</div>
        <div className="text-slate-400">Traditional Flow</div>
        <div className="text-cyan-200">Zero-Knowledge Flow</div>
      </div>
      <div className="divide-y divide-white/10">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[1.1fr_1fr_1fr] gap-4 px-5 py-5 text-sm leading-7">
            <div className="font-medium text-white">{row.label}</div>
            <div className="text-slate-400">{row.traditional}</div>
            <div className="text-cyan-100">{row.zkp}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkflowTimeline({
  steps,
}: {
  steps: Array<{ number: string; title: string; description: string }>;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {steps.map((step) => (
        <GlassCard
          key={step.number}
          icon={<span className="text-sm font-semibold text-white">{step.number}</span>}
          title={step.title}
          description={step.description}
        />
      ))}
    </div>
  );
}

export function ActionCard({
  title,
  description,
  href,
  cta,
  icon,
  featured = false,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: ElementType;
  featured?: boolean;
}) {
  const Icon = icon;

  return (
    <GlassCard
      icon={<Icon className="h-5 w-5" />}
      title={title}
      description={description}
      className={cn('h-full', featured && 'border-cyan-400/35 bg-cyan-400/10 ring-1 ring-cyan-400/25')}
    >
      <Button href={href} variant={featured ? 'default' : 'outline'} className="w-full justify-between">
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </GlassCard>
  );
}