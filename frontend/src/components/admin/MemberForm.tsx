/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "../ui/Input";
import { MdEmergency, MdFitnessCenter, MdMonitorWeight, MdLocalHospital } from "react-icons/md";
import { GiBodyHeight } from "react-icons/gi";

const SectionTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mb-3">
        <span className="text-warrior-orange">{icon}</span>
        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{children}</p>
        <div className="flex-1 h-px bg-neutral-800" />
    </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1.5">{children}</p>
);

const TextArea = ({ value, onChange, placeholder }: any) => (
    <textarea
        className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 px-3 py-2.5 rounded-xl outline-none focus:border-warrior-orange transition-colors min-h-20 text-sm resize-none"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
    />
);

export const MemberForm = ({ data, onChange, plans, isEditMode }: any) => (
    <div className="space-y-6">

        {/* Emergency Contact */}
        <div>
            <SectionTitle icon={<MdEmergency size={14} />}>Emergency Contact</SectionTitle>
            <div className="space-y-3">
                <Input
                    label="Contact Name"
                    placeholder="e.g. Mr. Perera"
                    value={data.emergencyContactName}
                    onChange={(e: any) => onChange({ ...data, emergencyContactName: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                        label="Contact Number"
                        placeholder="0XXXXXXXXX"
                        value={data.emergencyContactPhone}
                        onChange={(e: any) => onChange({ ...data, emergencyContactPhone: e.target.value })}
                    />
                    <Input
                        label="Relationship"
                        placeholder="e.g. Father"
                        value={data.emergencyContactRelation}
                        onChange={(e: any) => onChange({ ...data, emergencyContactRelation: e.target.value })}
                    />
                </div>
            </div>
        </div>

        {/* Baseline Measurements */}
        <div>
            <SectionTitle icon={<MdMonitorWeight size={14} />}>Baseline Measurements</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <FieldLabel>Weight (KG)</FieldLabel>
                    <div className="relative">
                        <MdMonitorWeight size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warrior-orange/60" />
                        <input
                            type="number"
                            placeholder="e.g. 65"
                            value={data.weight}
                            onChange={(e: any) => onChange({ ...data, weight: e.target.value })}
                            className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-warrior-orange transition-colors text-sm"
                        />
                    </div>
                </div>
                <div>
                    <FieldLabel>Height (CM)</FieldLabel>
                    <div className="relative">
                        <GiBodyHeight size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warrior-orange/60" />
                        <input
                            type="number"
                            placeholder="e.g. 175"
                            value={data.height}
                            onChange={(e: any) => onChange({ ...data, height: e.target.value })}
                            className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-warrior-orange transition-colors text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Health & Goals */}
        <div>
            <SectionTitle icon={<MdLocalHospital size={14} />}>Health & Goals</SectionTitle>
            <div className="space-y-3">
                <div>
                    <FieldLabel>Medical Conditions / Injuries</FieldLabel>
                    <TextArea
                        value={data.medicalConditions}
                        onChange={(e: any) => onChange({ ...data, medicalConditions: e.target.value })}
                        placeholder="List accidents, disorders, allergies... (comma separated)"
                    />
                </div>
                <div>
                    <FieldLabel>Fitness Goals</FieldLabel>
                    <TextArea
                        value={data.fitnessGoal}
                        onChange={(e: any) => onChange({ ...data, fitnessGoal: e.target.value })}
                        placeholder="e.g. Muscle gain, fat loss, marathon prep... (comma separated)"
                    />
                </div>
            </div>
        </div>

        {/* Membership Plan (create only) */}
        {!isEditMode && (
            <div>
                <SectionTitle icon={<MdFitnessCenter size={14} />}>Initial Membership Plan</SectionTitle>
                <select
                    className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 px-3 py-2.5 rounded-xl outline-none focus:border-warrior-orange transition-colors cursor-pointer text-sm"
                    value={data.planId}
                    onChange={(e: any) => onChange({ ...data, planId: e.target.value })}
                >
                    <option value="">— No Plan (Pay Later) —</option>
                    {plans.map((plan: any) => (
                        <option key={plan._id} value={plan._id}>
                            {plan.name} — {plan.price.toLocaleString()} LKR
                        </option>
                    ))}
                </select>
            </div>
        )}
    </div>
);