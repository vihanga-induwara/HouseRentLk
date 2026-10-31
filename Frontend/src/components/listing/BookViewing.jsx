import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CalendarDays, CheckCircle } from 'lucide-react';
import API from '../../utils/api';
import Button from '../Button';

const TIME_SLOTS = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];
const MAX_DAYS_AHEAD = 90;

const toDateInput = (date) => date.toISOString().split('T')[0];

// Lets a renter request a viewing; the owner confirms or rejects it from their Lead Dashboard.
const BookViewing = ({ listingId, user }) => {
    const today = new Date();
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [booked, setBooked] = useState(false);

    if (!user) {
        return (
            <p className="text-xs text-slate-500 text-center">
                <Link to="/login" className="font-bold text-primary-600">Log in</Link> to book a viewing.
            </p>
        );
    }

    if (booked) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Viewing requested. The owner will confirm it.
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await API.post('/bookings', { listingId, date, timeSlot, message: message.trim() || undefined });
            setBooked(true);
            toast.success('Viewing requested');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not book this viewing');
        } finally {
            setSending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                <CalendarDays className="h-4 w-4" /> Book a viewing
            </div>
            <div className="grid grid-cols-2 gap-2">
                <input
                    type="date"
                    required
                    aria-label="Viewing date"
                    value={date}
                    min={toDateInput(today)}
                    max={toDateInput(new Date(today.getTime() + MAX_DAYS_AHEAD * 86400000))}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-xl border-2 border-slate-100 dark:border-slate-700 text-sm"
                />
                <select
                    aria-label="Viewing time"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-xl border-2 border-slate-100 dark:border-slate-700 text-sm"
                >
                    {TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
            </div>
            <input
                type="text"
                maxLength={500}
                aria-label="Note for the owner"
                placeholder="Note for the owner (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-xl border-2 border-slate-100 dark:border-slate-700 text-sm"
            />
            <Button type="submit" variant="outline" className="w-full" isLoading={sending} disabled={!date}>
                Request viewing
            </Button>
        </form>
    );
};

export default BookViewing;
