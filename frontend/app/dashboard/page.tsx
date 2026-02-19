import { ShieldCheck, Link } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Moon from "lucide-react/dist/esm/icons/moon";
import Sun from "lucide-react/dist/esm/icons/sun";
import { InsightsDashboard } from "../components/features/InsightsDashboard";

export default function DashboardPage() {
    const { theme, toggleTheme } = useTheme();

    function cn(arg0: string, arg1: string): string | undefined {
        throw new Error("Function not implemented.");
    }

    return (
        <main className={cn(
            "min-h-screen transition-colors duration-500",
            theme === 'night' ? "bg-black text-slate-200" : "bg-slate-950 text-slate-200"
        )}>
            <div className="max-w-6xl mx-auto px-6 py-12">
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-4">
                            <div className="bg-sky-500 p-2 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight border-b-2 border-sky-500/20 pb-1">FIN-CORE</h1>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Enterprise Intelligence</p>
                            </div>
                        </div>

                        <nav className="flex items-center bg-slate-900/50 p-1 rounded-xl border border-slate-800 backdrop-blur-sm">
                            <Link
                                href="/"
                                className="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-all"
                            >
                                Review Flow
                            </Link>
                            <div className="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-sky-500 text-white shadow-lg shadow-sky-500/20">
                                Dashboard
                            </div>
                        </nav>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-sky-500 hover:border-sky-500/50 transition-all flex items-center gap-3 shadow-lg"
                        >
                            {theme === 'night' ? (
                                <><Moon className="w-4 h-4 text-sky-500" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Night</span></>
                            ) : (
                                <><Sun className="w-4 h-4 text-amber-500" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Dark</span></>
                            )}
                        </button>
                    </div>
                </header>

                <InsightsDashboard />
            </div>
        </main>
    );
}

