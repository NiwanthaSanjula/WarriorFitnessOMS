import { MdEventAvailable, MdHistory } from "react-icons/md";

interface SubscriptionProps {
    planName : string;
    startDate: string;
    endDate: string;
    price: number
}

export const SubscriptionCard = ({ planName, startDate, endDate, price }: SubscriptionProps) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    //  Calculate progress percentage
    const total = end - start;
    const elapsed = now - start;
    const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100 );

    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    const isExpired = daysLeft <= 0;

    return (
        <div className={`p-6 rounded-2xl border ${isExpired ? 'border-red-500 bg-red-500/5' : 'border-neutral-600 bg-warrior-grey'} space-y-6 border-l-3 border-l-warrior-orange`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1" > Active Plan </h3>
                    <p className="text-xl font-bold italic text-gray-300 uppercase">{planName}</p>
                </div>

                <div className="text-right">
                    <p className="text-warrior-orange font-bold text-lg" > {price} LKR</p>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${isExpired ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-green-500/20 text-green-500'}`}>{isExpired ? 'Expired' : 'Active'}</span>
                </div>
            </div>

            { /* Progress bar */ }
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                    <span>Progress</span>
                    <span>{daysLeft > 0 ? `${daysLeft} Days Remaining` : 'Plan Ended'} </span>
                </div>

                <div className="w-full h-3 bg-neutral-700 rounded-full overflow-hidden border border-neutral-500">
                    <div 
                        className={`h-full transition-all duration-1000 ${isExpired ? 'bg-red-500': 'bg-warrior-orange'}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-gray-400">
                    <MdEventAvailable className="text-warrior-orange" />
                    <div className="text-xs">
                        <p className="font-bold uppercase text-gray-500">Started</p>
                        <p className="text-gray-300">{new Date(startDate).toLocaleDateString()} </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                    <MdHistory className="text-warrior-orange" />
                    <div className="text-xs">
                        <p className="font-bold uppercase text-gray-500">Ends On</p>
                        <p className="text-gray-300">{new Date(endDate).toLocaleDateString()} </p>
                    </div>
                </div>
            </div>

            { isExpired && (
                <button
                    className="w-full py-2 bg-warrior-orange text-white font-bold uppercase text-xs rounded-xl hover:bg-warrior-orange/80 hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                    Renew Membership
                </button>
            ) }

        </div>
    )

    
}