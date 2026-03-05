/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { contentService } from '../../services/contentService';
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdVisibilityOff, MdClose, MdSave } from 'react-icons/md';
import { GiTrophy, GiLaurelCrown } from 'react-icons/gi';
import Spinner from '../../components/ui/Spinner';
import StoryImageUploader from '../../components/ui/StoryImageUploader';
import ImageUploader from '../../components/ui/imageUploader';

// ── Shared modal backdrop ─────────────────────────────────────────────────────
const Backdrop = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {children}
    </div>
);

// ── Delete confirm ────────────────────────────────────────────────────────────
const DeleteModal = ({ label, onConfirm, onClose }: { label: string; onConfirm: () => void; onClose: () => void }) => (
    <Backdrop>
        <div className="bg-neutral-900 border border-red-900/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <p className="text-white font-black italic uppercase text-lg mb-2">Delete {label}?</p>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
                <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase rounded-xl transition-colors">Delete</button>
                <button onClick={onClose} className="flex-1 py-2.5 bg-neutral-800 text-gray-300 text-[11px] font-black uppercase rounded-xl hover:bg-neutral-700 transition-colors">Cancel</button>
            </div>
        </div>
    </Backdrop>
);

// ── Story Modal ───────────────────────────────────────────────────────────────
const StoryModal = ({ initial, onSave, onClose }: { initial?: any; onSave: (data: any) => Promise<void>; onClose: () => void }) => {
    const [form, setForm] = useState({
        memberName: initial?.memberName || '',
        quote: initial?.quote || '',
        duration: initial?.duration || '',
        beforeImage: initial?.beforeImage || '',
        afterImage: initial?.afterImage || '',
        isVisible: initial?.isVisible ?? true,
        order: initial?.order ?? 0,
    });
    const [saving, setSaving] = useState(false);

    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        if (!form.memberName || !form.quote || !form.duration || !form.beforeImage || !form.afterImage) {
            alert('Please fill all required fields'); return;
        }
        setSaving(true);
        try { await onSave(form); } finally { setSaving(false); }
    };

    return (
        <Backdrop>
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-5 py-4 flex items-center justify-between">
                    <p className="font-black italic uppercase text-white text-sm">{initial ? 'Edit Story' : 'Add Story'}</p>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><MdClose size={20} /></button>
                </div>
                <div className="p-5 space-y-4">
                    {[
                        { label: 'Member Name *', key: 'memberName', placeholder: 'e.g. John Silva' },
                        { label: 'Duration *', key: 'duration', placeholder: 'e.g. 6 months' },
                    ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{label}</p>
                            <input
                                className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm p-3 rounded-xl outline-none focus:border-warrior-orange transition-colors"
                                placeholder={placeholder}
                                value={(form as any)[key]}
                                onChange={e => set(key, e.target.value)}
                            />
                        </div>
                    ))}

                    {/* Quote textarea */}
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Testimonial Quote *</p>
                        <textarea rows={3}
                            className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm p-3 rounded-xl outline-none focus:border-warrior-orange transition-colors resize-none"
                            placeholder="Member's transformation quote..."
                            value={form.quote}
                            onChange={e => set('quote', e.target.value)}
                        />
                    </div>

                    <StoryImageUploader
                        currentBefore={form.beforeImage}
                        currentAfter={form.afterImage}
                        onUploaded={(before, after) => {
                            set('beforeImage', before);
                            set('afterImage', after);
                        }}
                    />

                    {/* Order + Visibility */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Display Order</p>
                            <input type="number" min={0}
                                className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm p-3 rounded-xl outline-none focus:border-warrior-orange"
                                value={form.order}
                                onChange={e => set('order', parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Visibility</p>
                            <button
                                onClick={() => set('isVisible', !form.isVisible)}
                                className={`w-full p-3 rounded-xl border text-[11px] font-black uppercase transition-all ${form.isVisible
                                    ? 'bg-green-900/20 border-green-800/40 text-green-400'
                                    : 'bg-neutral-800 border-neutral-700 text-gray-500'
                                    }`}
                            >
                                {form.isVisible ? 'Visible' : 'Hidden'}
                            </button>
                        </div>
                    </div>

                    <button onClick={handleSave} disabled={saving}
                        className="w-full py-3 bg-warrior-orange hover:bg-orange-500 disabled:opacity-50 text-white text-[11px] font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-colors">
                        <MdSave size={14} /> {saving ? 'Saving...' : 'Save Story'}
                    </button>
                </div>
            </div>
        </Backdrop>
    );
};

// ── Milestone Modal ───────────────────────────────────────────────────────────
const MilestoneModal = ({ initial, onSave, onClose }: { initial?: any; onSave: (data: any) => Promise<void>; onClose: () => void }) => {
    const [form, setForm] = useState({
        title: initial?.title || '',
        description: initial?.description || '',
        year: initial?.year || new Date().getFullYear().toString(),
        image: initial?.image || '',
        isVisible: initial?.isVisible ?? true,
        order: initial?.order ?? 0,
    });
    const [saving, setSaving] = useState(false);
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        if (!form.title || !form.description || !form.year || !form.image) {
            alert('Please fill all required fields'); return;
        }
        setSaving(true);
        try { await onSave(form); } finally { setSaving(false); }
    };

    return (
        <Backdrop>
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-5 py-4 flex items-center justify-between">
                    <p className="font-black italic uppercase text-white text-sm">{initial ? 'Edit Milestone' : 'Add Milestone'}</p>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><MdClose size={20} /></button>
                </div>
                <div className="p-5 space-y-4">
                    {[
                        { label: 'Title *', key: 'title', placeholder: 'e.g. Top Trainer Team' },
                        { label: 'Year *', key: 'year', placeholder: 'e.g. 2024' },
                    ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{label}</p>
                            <input
                                className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm p-3 rounded-xl outline-none focus:border-warrior-orange transition-colors"
                                placeholder={placeholder}
                                value={(form as any)[key]}
                                onChange={e => set(key, e.target.value)}
                            />
                        </div>
                    ))}

                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Description *</p>
                        <textarea rows={3}
                            className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm p-3 rounded-xl outline-none focus:border-warrior-orange transition-colors resize-none"
                            placeholder="Describe this achievement..."
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                        />
                    </div>

                    <ImageUploader
                        endpoint="/upload/milestone-image"
                        fieldName="image"
                        currentUrl={form.image}
                        onUploaded={url => set('image', url)}
                        label="Milestone Image *"
                        aspectRatio="landscape"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Display Order</p>
                            <input type="number" min={0}
                                className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm p-3 rounded-xl outline-none focus:border-warrior-orange"
                                value={form.order}
                                onChange={e => set('order', parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Visibility</p>
                            <button onClick={() => set('isVisible', !form.isVisible)}
                                className={`w-full p-3 rounded-xl border text-[11px] font-black uppercase transition-all ${form.isVisible
                                    ? 'bg-green-900/20 border-green-800/40 text-green-400'
                                    : 'bg-neutral-800 border-neutral-700 text-gray-500'
                                    }`}>
                                {form.isVisible ? 'Visible' : 'Hidden'}
                            </button>
                        </div>
                    </div>

                    <button onClick={handleSave} disabled={saving}
                        className="w-full py-3 bg-warrior-orange hover:bg-orange-500 disabled:opacity-50 text-white text-[11px] font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-colors">
                        <MdSave size={14} /> {saving ? 'Saving...' : 'Save Milestone'}
                    </button>
                </div>
            </div>
        </Backdrop>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
const ContentManager = () => {
    const [tab, setTab] = useState<'stories' | 'milestones'>('stories');
    const [stories, setStories] = useState<any[]>([]);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [storyModal, setStoryModal] = useState<{ open: boolean; item?: any }>({ open: false });
    const [msModal, setMsModal] = useState<{ open: boolean; item?: any }>({ open: false });
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: 'story' | 'milestone'; id: string; label: string } | null>(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [s, m] = await Promise.all([
                contentService.getAdminStories(),
                contentService.getAdminMilestones(),
            ]);
            setStories(s);
            setMilestones(m);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    // Story CRUD
    const handleSaveStory = async (data: any) => {
        if (storyModal.item) await contentService.updateStory(storyModal.item._id, data);
        else await contentService.createStory(data);
        setStoryModal({ open: false });
        await fetchAll();
    };

    // Milestone CRUD
    const handleSaveMilestone = async (data: any) => {
        if (msModal.item) await contentService.updateMilestone(msModal.item._id, data);
        else await contentService.createMilestone(data);
        setMsModal({ open: false });
        await fetchAll();
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        if (deleteModal.type === 'story') await contentService.deleteStory(deleteModal.id);
        else await contentService.deleteMilestone(deleteModal.id);
        setDeleteModal(null);
        await fetchAll();
    };

    const toggleStoryVisibility = async (item: any) => {
        await contentService.updateStory(item._id, { isVisible: !item.isVisible });
        await fetchAll();
    };

    const toggleMilestoneVisibility = async (item: any) => {
        await contentService.updateMilestone(item._id, { isVisible: !item.isVisible });
        await fetchAll();
    };

    if (loading) return <Spinner />;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* ── Page Header ── */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-warrior-orange/10 border border-warrior-orange/20 flex items-center justify-center shrink-0">
                    <GiTrophy className="text-warrior-orange" size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">
                        Content <span className="text-warrior-orange">Manager</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-0.5">
                        Success Stories & Honors — Public Landing Page
                    </p>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl w-fit">
                {([
                    { key: 'stories', label: 'Success Stories', icon: GiTrophy, count: stories.length },
                    { key: 'milestones', label: 'Honors & Milestones', icon: GiLaurelCrown, count: milestones.length },
                ] as const).map(t => {
                    const Icon = t.icon;
                    return (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${tab === t.key
                                ? 'bg-warrior-orange text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}>
                            <Icon size={14} /> {t.label}
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${tab === t.key ? 'bg-white/20 text-white' : 'bg-neutral-800 text-gray-500'
                                }`}>{t.count}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── SUCCESS STORIES TAB ── */}
            {tab === 'stories' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{stories.length} stories</p>
                        <button onClick={() => setStoryModal({ open: true })}
                            className="flex items-center gap-2 px-4 py-2 bg-warrior-orange hover:bg-orange-500 text-white text-[11px] font-black uppercase rounded-xl transition-colors shadow-lg shadow-warrior-orange/20">
                            <MdAdd size={16} /> Add Story
                        </button>
                    </div>

                    {stories.length === 0 ? (
                        <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-16 text-center">
                            <GiTrophy className="text-gray-600 mx-auto mb-4" size={40} />
                            <p className="text-white font-black italic uppercase text-xl mb-2">No Stories Yet</p>
                            <p className="text-gray-500 text-sm mb-6">Add your first success story to show on the landing page.</p>
                            <button onClick={() => setStoryModal({ open: true })}
                                className="px-6 py-2.5 bg-warrior-orange text-white text-[11px] font-black uppercase rounded-xl">
                                + Add First Story
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stories.map(story => (
                                <div key={story._id}
                                    className={`bg-warrior-grey border-2 rounded-2xl overflow-hidden transition-all ${story.isVisible ? 'border-neutral-700' : 'border-neutral-800 opacity-60'
                                        }`}>
                                    {/* Images */}
                                    <div className="grid grid-cols-2">
                                        <div className="relative">
                                            <img src={story.beforeImage} alt="Before" className="w-full h-32 object-cover" />
                                            <span className="absolute bottom-1 left-1 text-[8px] font-black uppercase bg-black/80 text-warrior-orange px-1.5 py-0.5 rounded">Before</span>
                                        </div>
                                        <div className="relative">
                                            <img src={story.afterImage} alt="After" className="w-full h-32 object-cover" />
                                            <span className="absolute bottom-1 left-1 text-[8px] font-black uppercase bg-black/80 text-warrior-orange px-1.5 py-0.5 rounded">After</span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-white font-black italic uppercase text-sm truncate">{story.memberName}</p>
                                                <p className="text-warrior-orange text-[10px] font-black uppercase tracking-widest">{story.duration}</p>
                                            </div>
                                            <span className={`shrink-0 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${story.isVisible
                                                ? 'text-green-400 bg-green-900/20 border-green-800/40'
                                                : 'text-gray-600 bg-neutral-800 border-neutral-700'
                                                }`}>
                                                {story.isVisible ? 'Visible' : 'Hidden'}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-xs line-clamp-2 italic">"{story.quote}"</p>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-1">
                                            <button onClick={() => toggleStoryVisibility(story)}
                                                className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-gray-400 hover:text-white text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 transition-colors">
                                                {story.isVisible ? <MdVisibilityOff size={12} /> : <MdVisibility size={12} />}
                                                {story.isVisible ? 'Hide' : 'Show'}
                                            </button>
                                            <button onClick={() => setStoryModal({ open: true, item: story })}
                                                className="flex-1 py-1.5 bg-neutral-800 hover:bg-warrior-orange/20 text-warrior-orange text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 transition-colors">
                                                <MdEdit size={12} /> Edit
                                            </button>
                                            <button onClick={() => setDeleteModal({ open: true, type: 'story', id: story._id, label: story.memberName })}
                                                className="py-1.5 px-3 bg-neutral-800 hover:bg-red-900/20 text-red-400 text-[10px] font-black uppercase rounded-lg flex items-center justify-center transition-colors">
                                                <MdDelete size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── MILESTONES TAB ── */}
            {tab === 'milestones' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{milestones.length} milestones</p>
                        <button onClick={() => setMsModal({ open: true })}
                            className="flex items-center gap-2 px-4 py-2 bg-warrior-orange hover:bg-orange-500 text-white text-[11px] font-black uppercase rounded-xl transition-colors shadow-lg shadow-warrior-orange/20">
                            <MdAdd size={16} /> Add Milestone
                        </button>
                    </div>

                    {milestones.length === 0 ? (
                        <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-16 text-center">
                            <GiLaurelCrown className="text-gray-600 mx-auto mb-4" size={40} />
                            <p className="text-white font-black italic uppercase text-xl mb-2">No Milestones Yet</p>
                            <p className="text-gray-500 text-sm mb-6">Add your first honor or milestone to showcase your achievements.</p>
                            <button onClick={() => setMsModal({ open: true })}
                                className="px-6 py-2.5 bg-warrior-orange text-white text-[11px] font-black uppercase rounded-xl">
                                + Add First Milestone
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {milestones.map(ms => (
                                <div key={ms._id}
                                    className={`bg-warrior-grey border-2 rounded-2xl overflow-hidden transition-all ${ms.isVisible ? 'border-neutral-700' : 'border-neutral-800 opacity-60'
                                        }`}>
                                    {/* Image */}
                                    <div className="relative h-36 overflow-hidden">
                                        <img src={ms.image} alt={ms.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-linear-to-t from-neutral-900 to-transparent" />
                                        <span className="absolute top-2 left-2 text-[9px] font-black uppercase bg-warrior-orange text-white px-2 py-0.5 rounded-lg">{ms.year}</span>
                                        <span className={`absolute top-2 right-2 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${ms.isVisible
                                            ? 'text-green-400 bg-green-900/30 border-green-800/40'
                                            : 'text-gray-600 bg-neutral-800/80 border-neutral-700'
                                            }`}>
                                            {ms.isVisible ? 'Visible' : 'Hidden'}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 space-y-2">
                                        <p className="text-white font-black italic uppercase text-sm">{ms.title}</p>
                                        <p className="text-gray-500 text-xs line-clamp-2">{ms.description}</p>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-1">
                                            <button onClick={() => toggleMilestoneVisibility(ms)}
                                                className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-gray-400 hover:text-white text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 transition-colors">
                                                {ms.isVisible ? <MdVisibilityOff size={12} /> : <MdVisibility size={12} />}
                                                {ms.isVisible ? 'Hide' : 'Show'}
                                            </button>
                                            <button onClick={() => setMsModal({ open: true, item: ms })}
                                                className="flex-1 py-1.5 bg-neutral-800 hover:bg-warrior-orange/20 text-warrior-orange text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 transition-colors">
                                                <MdEdit size={12} /> Edit
                                            </button>
                                            <button onClick={() => setDeleteModal({ open: true, type: 'milestone', id: ms._id, label: ms.title })}
                                                className="py-1.5 px-3 bg-neutral-800 hover:bg-red-900/20 text-red-400 text-[10px] font-black uppercase rounded-lg flex items-center justify-center transition-colors">
                                                <MdDelete size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Modals ── */}
            {storyModal.open && (
                <StoryModal
                    initial={storyModal.item}
                    onSave={handleSaveStory}
                    onClose={() => setStoryModal({ open: false })}
                />
            )}
            {msModal.open && (
                <MilestoneModal
                    initial={msModal.item}
                    onSave={handleSaveMilestone}
                    onClose={() => setMsModal({ open: false })}
                />
            )}
            {deleteModal?.open && (
                <DeleteModal
                    label={deleteModal.label}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteModal(null)}
                />
            )}
        </div>
    );
};

export default ContentManager;