import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import Contact from '@/pages/Contact';
import GenerateProof from '@/pages/GenerateProof';
import Home from '@/pages/Home';
import HowItWorks from '@/pages/HowItWorks';
import NotFound from '@/pages/not-found';
import VerifyProof from '@/pages/VerifyProof';

function ProverWrapper() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
          Prover Flow
        </span>
      </div>
      <GenerateProof />
    </div>
  );
}

function VerifierWrapper() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Verifier Flow
        </span>
      </div>
      <VerifyProof />
    </div>
  );
}

export function AppRoutes() {
  const location = useLocation();

  useScrollToTop(location.pathname);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/prover" element={<ProverWrapper />} />
          <Route path="/generate-proof" element={<ProverWrapper />} />
          <Route path="/verify" element={<VerifierWrapper />} />
          <Route path="/verify-proof" element={<VerifierWrapper />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/how-zkp-works" element={<HowItWorks />} />
          <Route path="/about" element={<Contact />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}