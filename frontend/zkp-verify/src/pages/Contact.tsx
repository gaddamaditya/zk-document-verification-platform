import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";

export default function Contact() {
  return (
    <div className="flex flex-col gap-8 pb-20 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Contact Us</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground max-w-3xl">
          For project discussions, feedback, collaboration opportunities, or technical questions regarding the ZKVerify Privacy-Preserving Document Verification system.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 border border-teal-500/20 text-teal-600 dark:text-teal-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-base">Email Contact</h4>
              <p className="text-muted-foreground text-sm mt-1">gaddamaditya8@gmail.com</p>
              <p className="text-xs text-muted-foreground mt-2">
                Student Researcher: Adithya Gaddam
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Send a Message</h3>
          </div>

          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">First Name</label>
                <input type="text" className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-teal-500" placeholder="Jane" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Last Name</label>
                <input type="text" className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-teal-500" placeholder="Doe" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Email</label>
              <input type="email" className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-teal-500" placeholder="jane@example.com" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Subject</label>
              <select className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-teal-500">
                <option>Project Feedback</option>
                <option>Collaboration Opportunity</option>
                <option>Technical Question</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Message</label>
              <textarea rows={4} className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-teal-500 resize-none" placeholder="How can we help?" />
            </div>

            <Button type="button" className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600" onClick={(e) => e.preventDefault()}>Submit Message</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
