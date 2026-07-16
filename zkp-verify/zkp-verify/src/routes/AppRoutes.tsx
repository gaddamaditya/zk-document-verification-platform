import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { useScrollToTop } from '@/hooks/useScrollToTop';
import Contact from '@/pages/Contact';
import GenerateProof from '@/pages/GenerateProof';
import Home from '@/pages/Home';
import HowItWorks from '@/pages/HowItWorks';
import NotFound from '@/pages/not-found';
import VerifyProof from '@/pages/VerifyProof';

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
          <Route path="/generate-proof" element={<GenerateProof />} />
          <Route path="/verify-proof" element={<VerifyProof />} />
          <Route path="/how-zkp-works" element={<HowItWorks />} />
          <Route path="/how-it-works" element={<Navigate to="/how-zkp-works" replace />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}