import { Home } from 'lucide-react';

const StepType = ({ type, setType }) => {
    const types = ['House', 'Boarding Room', 'Annex', 'Apartment', 'Other'];
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-900">What kind of property?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {types.map((t) => (
                    <div
                        key={t}
                        onClick={() => setType(t)}
                        className={`cursor-pointer p-6 rounded-xl border-2 transition-all text-center
              ${type === t ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                        <Home className={`h-8 w-8 mx-auto mb-3 ${type === t ? 'text-primary-600' : 'text-slate-400'}`} />
                        <div className="font-semibold">{t}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepType;
