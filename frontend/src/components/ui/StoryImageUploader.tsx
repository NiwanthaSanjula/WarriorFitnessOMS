/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react';
import { MdCloudUpload, MdClose } from 'react-icons/md';
import api from '../../api/axios';

interface Props {
    currentBefore?: string;
    currentAfter?:  string;
    onUploaded: (before: string, after: string) => void;
}

const StoryImageUploader = ({ currentBefore, currentAfter, onUploaded }: Props) => {
    const [before, setBefore]       = useState(currentBefore || '');
    const [after,  setAfter]        = useState(currentAfter  || '');
    const [uploading, setUploading] = useState(false);
    const [error, setError]         = useState<string | null>(null);
    const beforeRef                 = useRef<HTMLInputElement>(null);
    const afterRef                  = useRef<HTMLInputElement>(null);

    const handleFiles = async (beforeFile: File | null, afterFile: File | null) => {
        if (!beforeFile && !afterFile) return;
        setError(null); setUploading(true);

        try {
            const formData = new FormData();

            // If only one changed, re-send existing URL as text so backend can distinguish
            if (beforeFile) formData.append('beforeImage', beforeFile);
            if (afterFile)  formData.append('afterImage',  afterFile);

            // If only one side changed, upload just that side individually
            if (beforeFile && !afterFile) {
                const fd = new FormData();
                fd.append('image', beforeFile);
                const res = await api.post('/upload/milestone-image', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const url = res.data.data.url;
                setBefore(url);
                onUploaded(url, after);
                return;
            }
            if (!beforeFile && afterFile) {
                const fd = new FormData();
                fd.append('image', afterFile);
                const res = await api.post('/upload/milestone-image', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const url = res.data.data.url;
                setAfter(url);
                onUploaded(before, url);
                return;
            }

            // Both changed — use story-images endpoint
            const res = await api.post('/upload/story-images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const { beforeUrl, afterUrl } = res.data.data;
            setBefore(beforeUrl); setAfter(afterUrl);
            onUploaded(beforeUrl, afterUrl);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally { setUploading(false); }
    };

    const UploadSlot = ({
        label, url, onFile, onClear, inputRef,
    }: {
        label: string; url: string;
        onFile: (f: File) => void; onClear: () => void;
        inputRef: React.RefObject<HTMLInputElement>;
    }) => (
        <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{label}</p>
            {url ? (
                <div className="relative rounded-xl overflow-hidden border border-neutral-700 h-36">
                    <img src={url} alt={label} className="w-full h-full object-cover" />
                    {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-warrior-orange border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                    {!uploading && (
                        <button onClick={onClear}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                            <MdClose size={13} />
                        </button>
                    )}
                    {/* Label badge */}
                    <span className="absolute bottom-1.5 left-1.5 text-[8px] font-black uppercase bg-black/80 text-warrior-orange px-1.5 py-0.5 rounded">
                        {label}
                    </span>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="h-36 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-800/50 hover:border-warrior-orange/60 hover:bg-neutral-800 cursor-pointer transition-all duration-200"
                >
                    {uploading ? (
                        <div className="w-5 h-5 border-2 border-warrior-orange border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <MdCloudUpload size={20} className="text-gray-600" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mt-1">Upload</p>
                        </>
                    )}
                </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        </div>
    );

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
                <UploadSlot
                    label="Before"
                    url={before}
                    inputRef={beforeRef}
                    onFile={f  => handleFiles(f, null)}
                    onClear={() => { setBefore(''); onUploaded('', after); }}
                />
                <UploadSlot
                    label="After"
                    url={after}
                    inputRef={afterRef}
                    onFile={f  => handleFiles(null, f)}
                    onClear={() => { setAfter('');  onUploaded(before, ''); }}
                />
            </div>
            {error && <p className="text-[10px] text-red-400 font-bold">{error}</p>}
        </div>
    );
};

export default StoryImageUploader;