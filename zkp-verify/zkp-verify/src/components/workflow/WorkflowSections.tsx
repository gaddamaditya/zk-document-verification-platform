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
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_32%)] opacity-70" />
      <div className="relative">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-cyan-300">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
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
  const accentClass = accent === 'cyan' ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-purple-400/20 bg-purple-400/10 text-purple-200';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl"
    >
      <div className="flex items-start gap-4">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border', accentClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Step {step}</p>
          <h3 className="mt-1 text-xl font-semibold text-white">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function FlowArrow() {
  return (
    <div className="flex items-center justify-center py-2 text-cyan-200">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
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
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
      {children && <div className="mt-5">{children}</div>}
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
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/30 p-6 backdrop-blur-xl">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                <Icon className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">{item.label}</h4>
              <p className="mt-2 text-xs leading-6 text-slate-400">{item.description}</p>
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
