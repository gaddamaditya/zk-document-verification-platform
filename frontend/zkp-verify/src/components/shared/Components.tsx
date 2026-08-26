import React from "react";
import { motion } from "framer-motion";

export function Section({
  id,
  title,
  subtitle,
  children,
  className = "",
  centered = false,
}: {
  id?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
}) {
  return (
    <section id={id} className={`py-12 ${className}`}>
      {(title || subtitle) && (
        <div className={`mb-10 ${centered ? "text-center" : "max-w-2xl"}`}>
          {title && (
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3"
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-sm md:text-base text-muted-foreground leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  link,
}: {
  icon: any;
  title: string;
  description: string;
  link?: { href: string; label: string };
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-xl border border-border bg-card p-6 shadow-xs relative group overflow-hidden transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-muted/60 border border-border flex items-center justify-center mb-4 text-teal-600 dark:text-teal-400">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{description}</p>
      {link && (
        <a href={link.href} className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
          {link.label} <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>
      )}
    </motion.div>
  );
}

export function PlaceholderPanel({
  title,
  icon: Icon,
  children,
  action,
  className = "",
  isActive = false,
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  isActive?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col ${isActive ? 'border-teal-500/50' : ''} ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'bg-muted/50 text-muted-foreground'}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h3 className={`font-bold text-base ${isActive ? 'text-foreground' : 'text-foreground'}`}>{title}</h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}

export function WorkflowStep({
  number,
  title,
  description,
  icon: Icon,
  isActive = false,
}: {
  number: number;
  title: string;
  description: string;
  icon: any;
  isActive?: boolean;
}) {
  return (
    <div className="flex gap-5 relative">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs z-10 border ${
          isActive 
            ? 'bg-teal-500/10 border-teal-500/50 text-teal-600 dark:text-teal-400' 
            : 'bg-muted/50 border-border text-muted-foreground'
        }`}>
          {number}
        </div>
        <div className="w-px h-full bg-border mt-2 absolute top-10 bottom-[-16px] left-5 -ml-[0.5px]" />
      </div>
      <div className={`pb-8 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
        <div className="flex items-center gap-2.5 mb-1.5">
          <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground'}`} />
          <h4 className="text-base font-bold text-foreground">{title}</h4>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">{description}</p>
      </div>
    </div>
  );
}
