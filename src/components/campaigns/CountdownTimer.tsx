import { useState, useEffect } from 'react';

interface CountdownTimerProps {
    endDate: string;
    onExpire?: () => void;
    compact?: boolean;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

const CountdownTimer = ({ endDate, onExpire, compact = false }: CountdownTimerProps) => {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
    });

    useEffect(() => {
        const calculateTimeRemaining = () => {
            if (!endDate) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
                return;
            }

            const end = new Date(endDate).getTime();
            const now = new Date().getTime();

            if (isNaN(end)) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
                return;
            }

            const total = end - now;

            if (total <= 0) {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
                if (onExpire) onExpire();
                return;
            }

            const days = Math.floor(total / (1000 * 60 * 60 * 24));
            const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((total % (1000 * 60)) / 1000);

            setTimeRemaining({ days, hours, minutes, seconds, total });
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [endDate, onExpire]);

    if (timeRemaining.total <= 0) {
        return null;
    }

    if (compact) {
        return (
            <div className="flex items-center gap-1 text-sm font-mono">
                {timeRemaining.days > 0 && <span>{timeRemaining.days}d </span>}
                <span>{String(timeRemaining.hours).padStart(2, '0')}:</span>
                <span>{String(timeRemaining.minutes).padStart(2, '0')}:</span>
                <span>{String(timeRemaining.seconds).padStart(2, '0')}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2" dir="ltr">
            {timeRemaining.days > 0 && (
                <div className="flex flex-col items-center bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                    <span className="text-2xl font-bold">{timeRemaining.days}</span>
                    <span className="text-xs opacity-80">أيام</span>
                </div>
            )}
            <div className="flex flex-col items-center bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                <span className="text-2xl font-bold">{String(timeRemaining.hours).padStart(2, '0')}</span>
                <span className="text-xs opacity-80">ساعات</span>
            </div>
            <span className="text-2xl font-bold">:</span>
            <div className="flex flex-col items-center bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                <span className="text-2xl font-bold">{String(timeRemaining.minutes).padStart(2, '0')}</span>
                <span className="text-xs opacity-80">دقائق</span>
            </div>
            <span className="text-2xl font-bold">:</span>
            <div className="flex flex-col items-center bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
                <span className="text-2xl font-bold">{String(timeRemaining.seconds).padStart(2, '0')}</span>
                <span className="text-xs opacity-80">ثواني</span>
            </div>
        </div>
    );
};

export default CountdownTimer;
