const Skeleton = ({ className }) => {
    return (
        <span className={`animate-pulse bg-slate-700/50 rounded ${className} block`}></span>
    );
};

export default Skeleton;
