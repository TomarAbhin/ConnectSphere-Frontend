import { useRef, useState } from 'react';
import { useCreatePost } from '../../hooks/usePosts';
import { inferMediaType, mediaApi } from '../../api/mediaApi';
import { Image, Send, Globe, Users, Lock } from 'lucide-react';

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public', icon: Globe },
  { value: 'FOLLOWERS_ONLY', label: 'Followers', icon: Users },
  { value: 'PRIVATE', label: 'Private', icon: Lock },
];

export default function CreatePostForm() {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [postType, setPostType] = useState('TEXT');
  const [mediaUrls, setMediaUrls] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const createPost = useCreatePost();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setUploading(true);
    try {
      const parsed = mediaUrls.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
      if (files && files.length) {
        for (const file of files) {
          try {
            const mt = inferMediaType(file);
            const res = await mediaApi.uploadMedia(file, { linkedPostId: null, mediaType: mt });
            const url = res?.url || res?.mediaUrl || res?.path || res?.data || null;
            if (url) parsed.push(url);
          } catch {}
        }
      }
      await createPost.mutateAsync({
        content,
        visibility,
        postType: parsed.length > 0 ? 'MEDIA' : postType,
        mediaUrls: parsed,
      });
      setContent('');
      setVisibility('PUBLIC');
      setPostType('TEXT');
      setMediaUrls('');
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const VisIcon = VISIBILITY_OPTIONS.find((v) => v.value === visibility)?.icon || Globe;

  return (
    <form id="compose-post" onSubmit={handleSubmit} className="glass-card overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <div>
          <p className="text-sm font-semibold text-slate-800">Create a post</p>
          <p className="mt-0.5 text-xs text-slate-400">Share with your network.</p>
        </div>
        <span className="cs-badge bg-indigo-50 text-indigo-600 border border-indigo-200"><VisIcon className="h-3 w-3" /> Composer</span>
      </div>
      <div className="px-5 pt-3"><textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="What's on your mind?" className="cs-input resize-none" /></div>
      <div className="mt-3 grid gap-3 px-5 sm:grid-cols-2">
        <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Visibility</span>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="cs-input py-2.5">{VISIBILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        </label>
        <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Post type</span>
          <select value={postType} onChange={(e) => setPostType(e.target.value)} className="cs-input py-2.5"><option value="TEXT">Text</option><option value="MEDIA">Media</option></select>
        </label>
      </div>
      <div className="mt-3 px-5"><label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Media URLs</span><textarea value={mediaUrls} onChange={(e) => setMediaUrls(e.target.value)} rows={2} placeholder="Paste URLs separated by commas" className="cs-input resize-none" /></label></div>
      <div className="mt-3 px-5">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-indigo-300 hover:bg-indigo-50/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500"><Image className="h-5 w-5" /></div>
          <div className="flex-1"><p className="text-sm font-medium text-slate-700">Upload media</p><p className="text-xs text-slate-400">Images or videos</p></div>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} className="hidden" />
          {files.length > 0 ? <span className="cs-badge bg-emerald-50 text-emerald-600 border border-emerald-200">{files.length} file{files.length > 1 ? 's' : ''}</span> : null}
        </label>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 px-5 py-4">
        <p className="text-xs text-slate-400">Public by default.</p>
        <button type="submit" disabled={uploading || createPost.isPending} className="cs-btn cs-btn-primary"><Send className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Share post'}</button>
      </div>
    </form>
  );
}
