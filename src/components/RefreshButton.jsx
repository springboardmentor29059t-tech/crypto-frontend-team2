const RefreshButton = ({ onClick, isLoading }) => {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg 
                bg-slate-700 hover:bg-slate-600 border border-slate-600 
                text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed
            `}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">Refresh</span>
        </button>
    );
};

export default RefreshButton;
