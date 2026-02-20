import { ShieldCheck, CheckCircle } from 'lucide-react';

const VerifiedBadge = ({ type = 'general', showLabel = true, className = '' }) => {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-600 ${className}`}>
            {type === 'general' ? <ShieldCheck className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
            {showLabel && 'Verified'}
        </span>
    );
};

export default VerifiedBadge;
