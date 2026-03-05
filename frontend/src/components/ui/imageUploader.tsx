// FILE: src/components/ui/ImageUploader.tsx
// Reusable drag-and-drop image uploader — plugs into any form
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react';
import { MdCloudUpload, MdClose} from 'react-icons/md';
import api from '../../api/axios';

interface Props {
    // Which endpoint to hit
    endpoint: '/upload/avatar' | '/upload/milestone-image';
    // Field name sent to server
    fieldName?: string;
    // Current preview URL (existing image)
    currentUrl?: string;
    // Called with the returned Cloudinary URL
    onUploaded: (url: string) => void;
    label?: string;
    aspectRatio?: 'square' | 'landscape' | 'portrait';
}

const ImageUploader = ({
    endpoint,
    fieldName = 'image',
    currentUrl,
    onUploaded,
    label = 'Upload Image',
    aspectRatio = 'landscape',
}: Props) => {
    const inputRef              = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(currentUrl || null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver]   = useState(false);
    const [error, setError]         = useState<string | null>(null);

    const heightClass = aspectRatio === 'square' ? 'h-32 w-32' : aspectRatio === 'portrait' ? 'h-48 w-36' : 'h-36 w-full';

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) { setError('Only image files allowed'); return; }
        if (file.size > 5 * 1024 * 1024)    { setError('Max file size is 5MB');      return; }
        setError(null);

        // Local preview immediately
        const reader = new FileReader();
        reader.onload = e => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        // Upload to backend
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append(fieldName, file);
            const res = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // avatar returns { url }, milestone-image returns { url }
            const url = res.data.data.url;
            setPreview(url);
            onUploaded(url);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Upload failed');
            setPreview(currentUrl || null);
        } finally {
            setUploading(false);
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const clear = () => { setPreview(null); onUploaded(''); if (inputRef.current) inputRef.current.value = ''; };

    return (
        <div className="space-y-1">
            {label && <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{label}</p>}

            {preview ? (
                <div className={`relative rounded-xl overflow-hidden border border-neutral-700 ${heightClass}`}>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-warrior-orange border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                    {!uploading && (
                        <button onClick={clear}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                            <MdClose size={13} />
                        </button>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true);  }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={`${heightClass} flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                        dragOver
                            ? 'border-warrior-orange bg-warrior-orange/10'
                            : 'border-neutral-700 bg-neutral-800/50 hover:border-warrior-orange/60 hover:bg-neutral-800'
                    }`}
                >
                    {uploading ? (
                        <div className="w-7 h-7 border-2 border-warrior-orange border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <MdCloudUpload size={24} className={dragOver ? 'text-warrior-orange' : 'text-gray-600'} />
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mt-2">
                                {dragOver ? 'Drop it!' : 'Click or drag'}
                            </p>
                            <p className="text-[8px] text-gray-700 mt-0.5">JPG, PNG, WEBP · Max 5MB</p>
                        </>
                    )}
                </div>
            )}

            {error && <p className="text-[10px] text-red-400 font-bold">{error}</p>}

            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
        </div>
    );
};

export default ImageUploader;