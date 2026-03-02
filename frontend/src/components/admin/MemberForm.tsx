/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "../ui/Input";

export const MemberForm = ({ data, onChange, plans, isEditMode }: any) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 gap-2 border-b border-neutral-600 pb-8">

            <h3 className="text-xs font-bold uppercase text-gray-600 text-center pb-2">Emergency Contact Info</h3>

            <Input
                label="Emergency Contact Name"
                placeholder="e.g: Mr.Perera"
                value={data.emergencyContactName}
                onChange={(e) => onChange({ ...data, emergencyContactName: e.target.value })}
            />
            <div className="grid grid-cols-1 gap-2">
                <Input
                    label="Emergency Contact Number"
                    placeholder="0XXXXXXXXX"
                    value={data.emergencyContactPhone}
                    onChange={(e) => onChange({ ...data, emergencyContactPhone: e.target.value })}
                />
                <Input
                    label="Emergency Contact Relation"
                    placeholder="e.g: Father"
                    value={data.emergencyContactRelation}
                    onChange={(e) => onChange({ ...data, emergencyContactRelation: e.target.value })}
                />
            </div>
        </div>

        <h3 className="text-xs font-bold uppercase text-gray-600 text-center pb-2">Member Details</h3>


        <h3 className="text-xs font-bold uppercase text-gray-600 text-center pb-2">
            Baseline Measurements (Initial Values)
        </h3>

        <div className="grid grid-cols-2 gap-4">
            <Input
                label="Weight (KG)"
                type="number"
                placeholder="e.g: 65"
                value={data.weight}
                onChange={(e) => onChange({ ...data, weight: e.target.value })}
            />
            <Input
                label="Height (CM)"
                type="number"
                placeholder="e.g: 175"
                value={data.height}
                onChange={(e) => onChange({ ...data, height: e.target.value })}
            />
        </div>

        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Medical Conditions / Injuries</label>
                <textarea
                    className="w-full bg-warrior-dark border border-neutral-700 text-gray-300 p-3 rounded-md outline-none focus:border-warrior-orange transition-all min-h-24 text-sm"
                    value={data.medicalConditions}
                    onChange={(e) => onChange({ ...data, medicalConditions: e.target.value })}
                    placeholder="List accidents, disorders, allergies..."
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Fitness Goals</label>
                <textarea
                    className="w-full bg-warrior-dark border border-neutral-700 text-gray-300 p-3 rounded-md outline-none focus:border-warrior-orange transition-all min-h-24 text-sm"
                    value={data.fitnessGoal}
                    onChange={(e) => onChange({ ...data, fitnessGoal: e.target.value })}
                    placeholder="e.g. Muscle gain, fat loss, marathon prep..."
                />
            </div>
        </div>

        {!isEditMode &&  (
            <div className="flex flex-col gap-2 col-span-2 ">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Initial Membership Plan</label>
                <select
                    className="w-full bg-warrior-dark border border-neutral-700 text-gray-300 p-3 rounded-md outline-none focus:border-warrior-orange transition-all cursor-pointer"
                    value={data.planId}
                    onChange={(e) => onChange({ ...data, planId: e.target.value })}
                >
                    <option value="">-- No Plan (Pay Later) --</option>
                    {plans.map((plan : any) => (
                        <option key={plan._id} value={plan._id}>
                            {plan.name} - {plan.price} LKR
                        </option>
                    ))}
                </select>
            </div>
        )}


    </div>
)