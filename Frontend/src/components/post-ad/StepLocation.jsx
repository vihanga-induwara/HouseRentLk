import Input from '../Input';

const StepLocation = ({ formData, handleChange }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Where is it located?</h2>
        <Input label="Town / City" name="town" value={formData.town} onChange={handleChange} placeholder="e.g. Colombo, Kandy" />
        <Input label="Street Name" name="street" value={formData.street} onChange={handleChange} placeholder="e.g. Main Street" />
        <Input label="House Number (Optional)" name="houseNumber" value={formData.houseNumber} onChange={handleChange} />
    </div>
);

export default StepLocation;
