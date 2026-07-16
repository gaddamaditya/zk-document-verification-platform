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
    <section id={id} className={`py-20 ${className}`}>
      {(title || subtitle) && (
        <div className={`mb-16 ${centered ? "text-center" : "max-w-2xl"}`}>
          {title && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4"
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-400"
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
      whileHover={{ y: -5 }}
      className="glass-card p-8 rounded-2xl relative group overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-cyan-500/20 transition-colors" />
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-6">{description}</p>
      {link && (
        <a href={link.href} className="text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
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
    <div className={`glass-panel flex flex-col ${isActive ? 'ring-1 ring-cyan-500/50' : ''} ${className}`}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-400'}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h3 className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>{title}</h3>
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
    <div className="flex gap-6 relative">
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold z-10 border ${
          isActive 
            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
            : 'bg-white/5 border-white/10 text-slate-500'
        }`}>
          {number}
        </div>
        <div className="w-px h-full bg-gradient-to-b from-white/10 to-transparent mt-2 absolute top-12 bottom-[-20px] left-6 -ml-[0.5px]" />
      </div>
      <div className={`pb-12 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
          <h4 className="text-xl font-semibold text-white">{title}</h4>
        </div>
        <p className="text-slate-400 leading-relaxed max-w-xl">{description}</p>
      </div>
    </div>
  );
}
