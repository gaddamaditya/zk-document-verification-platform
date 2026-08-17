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
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12 md:p-16">
      <div className="relative grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-300"
          >
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            {eyebrow}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
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
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12 }}
          className="grid gap-4 rounded-2xl border border-border bg-muted/40 p-6 sm:grid-cols-2"
        >
          {infoCards && infoCards.length > 0 ? (
            infoCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-border bg-card p-4 sm:col-span-2 shadow-xs"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {card.title}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {card.items.map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-foreground font-medium"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
              <div
                key={`${stat.label}-${index}`}
                className="rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))
          )}
          <div className="sm:col-span-2 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 text-xs leading-6 text-foreground font-medium">
            This platform is designed for privacy-preserving document verification: proving facts securely without sharing your original documents.
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
        className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
        className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base"
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
      whileHover={{ y: -4 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all',
        className,
      )}
    >
      <div className="relative">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/60 text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </motion.div>
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
      className={cn('h-full', featured && 'border-teal-500/40 bg-teal-500/5')}
    >
      <Button href={href} variant={featured ? 'default' : 'outline'} className="w-full justify-between">
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </GlassCard>
  );
}