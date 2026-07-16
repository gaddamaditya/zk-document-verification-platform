import { Section, PlaceholderPanel } from "../components/shared/Components";
import { Button } from "../components/ui/button";
import { Mail, MessageSquare } from "lucide-react";

export default function Contact() {
  return (
    <div className="flex flex-col gap-8 pb-20 max-w-5xl mx-auto">
      <Section title="Contact Us" subtitle="For project discussions, feedback, collaboration opportunities, or technical questions regarding the Privacy-Preserving Document Verification system.">
        
        <div className="grid md:grid-cols-2 gap-12 mt-8">
          
          <div className="flex flex-col gap-6">
            <div className="glass-panel flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                <Mail className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-lg">Email</h4>
                <p className="text-slate-400 text-sm mt-1">gaddamaditya8@gmail.com</p>
              </div>
            </div>
          </div>

          <PlaceholderPanel title="Send a Message" icon={MessageSquare}>
            <form className="flex flex-col gap-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">First Name</label>
                  <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="Jane" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Last Name</label>
                  <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Email</label>
                <input type="email" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="jane@example.com" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Subject</label>
                <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 appearance-none">
                  <option>Project Feedback</option>
                  <option>Collaboration Opportunity</option>
                  <option>Technical Question</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Message</label>
                <textarea rows={4} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none" placeholder="How can we help?" />
              </div>

              <Button type="button" className="w-full mt-4" onClick={(e) => e.preventDefault()}>Submit Message</Button>
            </form>
          </PlaceholderPanel>

        </div>
      </Section>
    </div>
  );
}
