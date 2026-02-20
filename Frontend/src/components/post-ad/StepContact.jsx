import Input from '../Input';
import { Trash2 } from 'lucide-react';

const StepContact = ({ contactDetails, formData, setFormData, handleChange }) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Daily', 'Weekdays', 'Weekends'];

    const addVisitTime = () => {
        setFormData(prev => ({
            ...prev,
            availableVisits: [...prev.availableVisits, { day: 'Monday', times: '9 AM - 5 PM' }]
        }));
    };

    const removeVisitTime = (index) => {
        setFormData(prev => ({
            ...prev,
            availableVisits: prev.availableVisits.filter((_, i) => i !== index)
        }));
    };

    const updateVisitTime = (index, field, value) => {
        const updated = [...formData.availableVisits];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, availableVisits: updated }));
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6 text-slate-900">Contact Preferences</h2>
                <Input
                    label="Alternative Phone / Office (Optional)"
                    name="phone2"
                    value={contactDetails.phone2}
                    onChange={(e) => handleChange({ target: { name: 'contactDetails', value: { ...contactDetails, phone2: e.target.value } } })}
                    placeholder="e.g. 0771234567"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="WhatsApp Number"
                        name="whatsapp"
                        value={contactDetails.whatsapp}
                        onChange={(e) => handleChange({ target: { name: 'contactDetails', value: { ...contactDetails, whatsapp: e.target.value } } })}
                        placeholder="e.g. 94771234567"
                    />
                    <Input
                        label="General Available Times"
                        name="availableTimes"
                        value={contactDetails.availableTimes}
                        onChange={(e) => handleChange({ target: { name: 'contactDetails', value: { ...contactDetails, availableTimes: e.target.value } } })}
                        placeholder="e.g. Weekdays 9 AM - 6 PM"
                    />
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Visit Availability Settings</h3>
                    <button
                        onClick={addVisitTime}
                        className="text-sm font-bold text-primary-600 hover:text-primary-700"
                    >
                        + Add Slot
                    </button>
                </div>
                <p className="text-sm text-slate-500 mb-4 italic">Specify when renters can visit the property to reduce back-and-forth calls.</p>

                <div className="space-y-3">
                    {formData.availableVisits.map((v, i) => (
                        <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-end bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <div className="w-full sm:flex-grow">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Day</label>
                                <select
                                    value={v.day}
                                    onChange={(e) => updateVisitTime(i, 'day', e.target.value)}
                                    className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary-500 h-10 border"
                                >
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="w-full sm:flex-grow">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Times</label>
                                <input
                                    type="text"
                                    value={v.times}
                                    onChange={(e) => updateVisitTime(i, 'times', e.target.value)}
                                    placeholder="e.g. 10 AM - 4 PM"
                                    className="w-full h-10 rounded-lg border-slate-200 text-sm focus:ring-primary-500 border px-3"
                                >
                                </input>
                            </div>
                            <button onClick={() => removeVisitTime(i)} className="w-full sm:w-10 h-10 flex items-center justify-center bg-white text-red-500 rounded-lg border border-slate-200 hover:bg-red-50 mt-2 sm:mt-0">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {formData.availableVisits.length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                            No visiting slots added yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StepContact;
