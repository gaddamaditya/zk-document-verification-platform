import { ElementType, ReactNode } from 'react';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function WorkflowSectionHeading({
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
    <div className={cn('max-w-4xl', centered && 'mx-auto text-center')}>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
        className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mt-3 text-sm leading-7 text-muted-foreground"
      >
        {description}
      </motion.p>
    </div>
  );
}

export function ConceptCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: ElementType;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xs transition-all"
    >
      <div className="relative">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/60 text-teal-600 dark:text-teal-400">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

export function WorkflowNode({
  step,
  title,
  description,
  icon: Icon,
  accent = 'cyan',
}: {
  step: string;
  title: string;
  description: string;
  icon: ElementType;
  accent?: 'cyan' | 'purple';
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-xl border border-border bg-card p-6 shadow-xs transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Step {step}</p>
          <h3 className="mt-1 text-base font-bold text-foreground">{title}</h3>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function FlowArrow() {
  return (
    <div className="flex items-center justify-center py-2 text-teal-600 dark:text-teal-400">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/40">
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );
}

export function SummaryCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function ConceptLegend({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; description: string; icon: ElementType }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-teal-600 dark:text-teal-400">
                <Icon className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-foreground">{item.label}</h4>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WorkflowActionButton({ href, label }: { href: string; label: string }) {
  return (
    <Button href={href} variant="outline" className="justify-between">
      {label}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}
