/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "../ui/Input";
import { GiWhistle, GiTrophy, GiProgression } from "react-icons/gi";
import { MdStar } from "react-icons/md";

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1.5">{children}</p>
);

const TextArea = ({ value, onChange, placeholder }: any) => (
    <textarea
        className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 px-3 py-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors min-h-24 text-sm resize-none"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
    />
);

export const CoachForm = ({ data, onChange }: any) => (
    <div className="space-y-5">

        {/* Specialties */}
        <div>
            <FieldLabel>Specialities</FieldLabel>
            <Input
                placeholder="Bodybuilding, Yoga, CrossFit..."
                value={data.specialties}
                onChange={(e: any) => onChange({ ...data, specialties: e.target.value })}
            />
            <p className="text-[10px] text-gray-600 mt-1 italic">Separate multiple specialities with commas</p>
        </div>

        {/* Bio */}
        <div>
            <FieldLabel>Biography</FieldLabel>
            <TextArea
                value={data.bio}
                onChange={(e: any) => onChange({ ...data, bio: e.target.value })}
                placeholder="Training philosophy, background, coaching style..."
            />
        </div>

        {/* Certifications */}
        <div>
            <FieldLabel>Certifications</FieldLabel>
            <TextArea
                value={data.certifications}
                onChange={(e: any) => onChange({ ...data, certifications: e.target.value })}
                placeholder="ACE Personal Trainer, NASM-CPT, CrossFit L2..."
            />
            <p className="text-[10px] text-gray-600 mt-1 italic">Separate multiple certifications with commas</p>
        </div>

        {/* Experience + Rating */}
        <div className="grid grid-cols-2 gap-3">
            <div>
                <FieldLabel>Years of Experience</FieldLabel>
                <div className="relative">
                    <GiTrophy size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                    <input
                        type="number"
                        min={0} max={50}
                        value={data.experienceYears}
                        onChange={(e: any) => onChange({ ...data, experienceYears: e.target.value })}
                        className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                </div>
            </div>
            <div>
                <FieldLabel>Rating (out of 5)</FieldLabel>
                <div className="relative">
                    <MdStar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400" />
                    <input
                        type="number"
                        min={0} max={5} step={0.1}
                        value={data.rating}
                        onChange={(e: any) => onChange({ ...data, rating: e.target.value })}
                        className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                </div>
            </div>
        </div>
    </div>
);