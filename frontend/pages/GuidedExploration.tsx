import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Briefcase, Upload, ShieldCheck, Activity, FileText, CheckCircle, Eye, Bell } from 'lucide-react';

const GuidedExploration: React.FC = () => {
    const navigate = useNavigate();

    const steps = [
        {
            title: "Understanding the Dashboard",
            icon: <LayoutDashboard size={24} />,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "hover:border-blue-500/50",
            content: (
                <ul className="space-y-2 text-slate-400 text-sm">
                    <li><strong className="text-slate-200">Global Node:</strong> Represents the entire crypto market status and trends.</li>
                    <li><strong className="text-slate-200">Personal Node:</strong> Your specific portfolio performance and metrics.</li>
                    <li><strong className="text-slate-200">Live Data:</strong> Real-time updates from global exchanges every 60 seconds.</li>
                </ul>
            )
        },
        {
            title: "Using the Portfolio Section",
            icon: <Briefcase size={24} />,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "hover:border-purple-500/50",
            content: (
                <ul className="space-y-2 text-slate-400 text-sm">
                    <li><strong className="text-slate-200">Add Assets:</strong> Manually input your crypto holdings.</li>
                    <li><strong className="text-slate-200">CSV Upload:</strong> Bulk import trades for efficiency.</li>
                    <li><strong className="text-slate-200">Profit/Loss:</strong> Automatically calculated based on current market prices.</li>
                </ul>
            )
        },
        {
            title: "Taxation & P&L Analysis",
            icon: <FileText size={24} />,
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "hover:border-green-500/50",
            content: (
                <ul className="space-y-2 text-slate-400 text-sm">
                    <li><strong className="text-slate-200">Personal Node:</strong> View Short-Term and Long-Term Capital Gains.</li>
                    <li><strong className="text-slate-200">FIFO Logic:</strong> Automated First-In-First-Out calculation for accurate reporting.</li>
                    <li><strong className="text-slate-200">Reset History:</strong> Wipe test data and re-sync your portfolio instantly.</li>
                </ul>
            )
        },
        {
            title: "Uploading Trades & CSV Files",
            icon: <Upload size={24} />,
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "hover:border-green-500/50",
            content: (
                <ul className="space-y-2 text-slate-400 text-sm">
                    <li><strong className="text-slate-200">Format:</strong> Ensure your CSV matches the supported template.</li>
                    <li><strong className="text-slate-200">Common Mistakes:</strong> Check for correct date formats and headers.</li>
                    <li><strong className="text-slate-200">Confirmation:</strong> Review the summary before finalizing the upload.</li>
                </ul>
            )
        },
        {
            title: "Scam Scanner Usage",
            icon: <ShieldCheck size={24} />,
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "hover:border-red-500/50",
            content: (
                <ul className="space-y-2 text-slate-400 text-sm">
                    <li><strong className="text-slate-200">Search:</strong> Enter a token address to check its safety.</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Green = Safe</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Yellow = Warning</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Red = Scam (100%)</li>
                </ul>
            )
        },
        {
            title: "Risk Analysis",
            icon: <Activity size={24} />,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "hover:border-orange-500/50",
            content: (
                <ul className="space-y-2 text-slate-400 text-sm">
                    <li><strong className="text-slate-200">Global Risk Node:</strong> Assessment of overall market volatility.</li>
                    <li><strong className="text-slate-200">Personal Risk Node:</strong> Risk score based on your portfolio diversification.</li>
                    <li><strong className="text-slate-200">Scores:</strong> Higher scores indicate higher risk exposure.</li>
                </ul>
            )
        },
        {
            title: "Exporting Reports",
            icon: <FileText size={24} />,
            color: "text-teal-500",
            bg: "bg-teal-500/10",
            border: "hover:border-teal-500/50",
            content: (
                <ul className="space-y-2 text-slate-400 text-sm">
                    <li><strong className="text-slate-200">Export CSV:</strong> Raw data for your own spreadsheets.</li>
                    <li><strong className="text-slate-200">Export PDF:</strong> Formatted reports for sharing or archives.</li>
                    <li><strong className="text-slate-200">Usage:</strong> Use PDF for weekly audits, CSV for analysis.</li>
                </ul>
            )
        },
        {
            title: "Best Practices",
            icon: <CheckCircle size={24} />,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            border: "hover:border-yellow-500/50",
            content: (
                <ul className="space-y-2 text-slate-400 text-sm">
                    <li><strong className="text-slate-200">Safety First:</strong> Always check new tokens with the Scam Scanner.</li>
                    <li><strong className="text-slate-200">Monitor Risk:</strong> Check your Personal Risk Node regularly.</li>
                    <li><strong className="text-slate-200">Records:</strong> regularly export your data for safekeeping.</li>
                </ul>
            )
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header / Back Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/learning-hub')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800 hover:border-indigo-500/50"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Learning Hub</span>
                </button>
            </div>

            <div className="space-y-4">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Guided Exploration</h1>
                <p className="text-slate-400 max-w-2xl">
                    Follow this step-by-step guide to master every features of the Crypto Portfolio Tracker.
                    From setting up your portfolio to analyzing risks.
                </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                    <div key={index} className={`bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-4 transition-all group ${step.border}`}>
                        <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 ${step.bg} rounded-xl flex items-center justify-center ${step.color} group-hover:scale-110 transition-transform`}>
                                {step.icon}
                            </div>
                            <span className="text-slate-600 font-bold text-5xl opacity-20 pointer-events-none">
                                {index + 1}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-white tracking-tight">{step.title}</h3>

                        <div className="pt-2 border-t border-slate-800/50">
                            {step.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GuidedExploration;
