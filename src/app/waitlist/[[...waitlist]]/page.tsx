import { Waitlist } from "@clerk/nextjs";
import { SparklesIcon } from "lucide-react";

export default function WaitlistPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-neutral-950 font-sans selection:bg-violet-500/30">
      {/* Ambient background meshes */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[30%] left-[20%] w-[40vw] h-[40vw] max-w-[500px] bg-violet-600/20 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[30%] right-[20%] w-[35vw] h-[35vw] max-w-[400px] bg-amber-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150%] bg-[radial-gradient(ellipse_at_center,transparent_20%,#0a0a0a_80%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      <div className="z-10 flex flex-col items-center w-full px-4">
        <div className="mb-8 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out fill-mode-both">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.03)] backdrop-blur-md mb-6 relative hover:bg-white/10 transition duration-300">
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-violet-500/20 to-fuchsia-500/20 blur-sm -z-10"></div>
            <SparklesIcon className="size-3.5 text-amber-300" />
            <span className="text-xs font-semibold text-white/90 uppercase tracking-widest">Early Access</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-b from-white to-white/60 drop-shadow-sm mb-4">
            Join the Waitlist
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-[400px]">
            Claim your spot for early access. Beautiful, high-fidelity code exports are coming very soon.
          </p>
        </div>

        <div className="w-full max-w-sm relative group animate-in fade-in zoom-in-95 duration-1000 delay-150 ease-out fill-mode-both">
          {/* Subtle glow behind the card */}
          <div className="absolute -inset-0.5 bg-linear-to-br from-violet-500/30 to-rose-500/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition duration-500 -z-10"></div>
          
          <Waitlist
            appearance={{
              elements: {
                card: "bg-neutral-900/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl w-full ring-1 ring-white/5",
                formButtonPrimary: "bg-white text-black hover:bg-neutral-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] rounded-xl font-semibold h-10",
                formFieldInput: "bg-black/50 border-white/10 focus:border-violet-500 focus:ring-violet-500/30 rounded-xl text-white transition-all backdrop-blur-md",
                formFieldLabel: "text-zinc-400 font-medium",
                headerTitle: "hidden", // We use our own header above
                headerSubtitle: "hidden", // We use our own subtitle
                dividerRow: "hidden",
                dividerText: "hidden",
                footer: "hidden", 
                cardBox: "shadow-none",
                identityPreviewText: "text-zinc-300",
                identityPreviewEditButton: "text-violet-400 hover:text-violet-300"
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
