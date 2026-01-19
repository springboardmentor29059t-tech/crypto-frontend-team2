const Skeleton = ({ className }) => {
    return (
        <div className={`animate-pulse bg-slate-700/50 rounded ${className}`}></div>
    );
};

export default Skeleton;
