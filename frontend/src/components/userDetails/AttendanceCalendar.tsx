import { useState } from "react"
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface AttendanceCalenerProps {
    history : any[]
}

export const AttendanceCalener = ({ history}: AttendanceCalenerProps ) => {
    
    const [viewDate, setViewDate] = useState(new Date());

    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    //  Logic for the specific month in view
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthName = viewDate.toLocaleDateString('default', { month: 'long'});

    const handlePrevMonth = () => {
        //  Prevent going to previous years
        if (currentMonth === 0) return;
        setViewDate(new Date(currentYear, currentMonth - 1));
    }

    const handleNextMonth = () => {
        //  Prevent going into the future
        if (currentMonth >= new Date().getMonth()) return;
        setViewDate(new Date(currentYear, currentMonth + 1));
    };

    return (
        <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-400 text-sm uppercase font-bold tracking-widest">
                    <div className="flex flex-col md:flex-row gap-0.5">
                        <span>Attendance:</span>
                        <span className="text-warrior-orange">{monthName} {currentYear}</span>
                    </div>
                     
                </h3>

                <div className="flex gap-2"> 
                    <button
                        onClick={handlePrevMonth}
                        disabled={currentMonth === 0}
                        className="p-1 hover:bg-neutral-700 bg-neutral-800 rounded text-gray-400 disabled:opacity-20 cursor-pointer"
                    >
                        <MdChevronLeft size={20}/>
                    </button>
                    <button
                        onClick={handleNextMonth}
                        disabled={currentMonth >= new Date().getMonth()}
                        className="p-1 hover:bg-neutral-700 bg-neutral-800 rounded text-gray-400 disabled:opacity-20 cursor-pointer"
                    >
                        <MdChevronRight size={20}/>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {[...Array(daysInMonth)].map((_, i) => {
                    const dayNum = i + 1;

                    //  Filter history to find if this specific day was 'present'
                    const isPresent = history.some((r: any) => {
                        const d = new Date(r.date);
                        return d.getDate() === dayNum && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    });

                    return (
                        <div
                            key={i}
                            title={`${monthName} ${dayNum}`}
                            className={`aspect-square rounded-md flex items-center justify-center text-sm font-bold transition-all
                                        ${isPresent
                                            ? 'bg-green-500/20 text-green-500 border border-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.1)] '
                                            : "bg-neutral-800 text-gray-400 border border-neutral-700"
                                        } `}
                            >
                                {dayNum}
                             
                        </div>
                    )
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-600 flex justify-between text-xs uppercase font-bold tracking-wider">
                <div className="flex items-center gap-1.5 text-gray-300">
                    <div className="w-2 h-2 bg-green-500/40 border border-green-500 rounded-sm"/>
                    Present
                </div>

                <div className="text-gray-300">
                    {history.filter((r:any) => new Date(r.date).getMonth() === currentMonth).length} Day(s) Total
                </div>

            </div>
        </div>
    )
    
}