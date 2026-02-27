/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "../ui/Input";

export const CoachForm = ({ data, onChange }: any) => (
    <div className="space-y-4">
        <div  >
            <Input
                label="Specialities (Comma Separated)"
                placeholder="Bodybuilding, Yoga, Crossfit,.."
                value={data.specialties}
                onChange={(e) => onChange({...data, specialties: e.target.value})}
            />

            <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Biography</label>
                <textarea 
                    className="w-full bg-warrior-dark border border-neutral-700 text-gray-300 p-3 rounded-md outline-none focus:border-warrior-orange transition-all min-h-32 text-sm "
                    value={data.bio}
                    onChange={(e) => onChange({...data, bio: e.target.value})}
                    placeholder="Experience details, training style, certifications..."
                />
            </div>

            <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Certifications</label>
                <textarea 
                    className="w-full bg-warrior-dark border border-neutral-700 text-gray-300 p-3 rounded-md outline-none focus:border-warrior-orange transition-all min-h-32 text-sm "
                    value={data.certifications}
                    onChange={(e) => onChange({...data, certifications: e.target.value})}
                    placeholder="Certified as..."
                />
            </div>

            <div className="grid grid-cols-2">
                <Input
                    label="Years of Experience"
                    type="number"
                    value={data.experienceYears}
                    onChange={(e) => onChange({...data, experienceYears : e.target.value})}
                />
                <Input
                    label="Rating"
                    type="number"
                    value={data.rating}
                    onChange={(e) => onChange({...data, rating: e.target.value})}
                />
            </div>

        </div>
    </div>
)