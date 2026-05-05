import { useState } from 'react';
import { useCreatePost } from '../../hooks/usePosts';
import { inferMediaType, mediaApi } from '../../api/mediaApi';
import { Image, Send, Globe, Users, Lock } from 'lucide-react';

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public', icon: Globe, color: 'text-emerald-600' },
  { value: 'FOLLOWERS_ONLY', label: 'Followers', icon: Users, color: 'text-amber-600' },
  { value: 'PRIVATE', label: 'Private', icon: Lock, color: 'text-slate-500' },
];

export default function CreatePostForm() {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [postType, setPostType] = useState('TEXT');
  const [mediaUrls, setMediaUrls] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const createPost = useCreatePost();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    setUploading(true);
    const parsedMediaUrls = mediaUrls
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (files && files.length) {
      for (const file of files) {
        try {
          const mediaType = inferMediaType(file);
          const res = await mediaApi.uploadMedia(file, { linkedPostId: null, mediaType });
          const url = res?.url || res?.mediaUrl || res?.path || res?.data || null;
          if (url) parsedMediaUrls.push(url);
        } catch (err) {
          console.warn('Media upload failed', err);
        }
      }
    }

    await createPost.mutateAsync({ content, visibility, postType, mediaUrls: parsedMediaUrls });
    setContent('');
    setVisibility('PUBLIC');
    setPostType('TEXT');
    setMediaUrls('');
    setFiles([]);
    setUploading(false);
  };

  const VisIcon = VISIBILITY_OPTIONS.find((v) => v.value === visibility)?.icon || Globe;

  return (
    <form onSubmit={handleSubmit} className="glass-card overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <div>
          <p className="text-sm font-semibold text-slate-800">Create a post</p>
          <p className="text-xs text-slate-400 mt-0.5">Choose visibility and share with your network.</p>
        </div>
        <span className="cs-badge bg-brand-50 text-brand-600 border border-brand-100">
          <VisIcon className="h-3 w-3" /> Composer
        </span>
      </div>

      <div className="px-5 pt-4">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          placeholder="What's on your mind?"
          className="cs-input resize-none"
        />
      </div>

      <div className="mt-3 grid gap-3 px-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Visibility</span>
          <select value={visibility} onChange={(event) => setVisibility(event.target.value)} className="cs-input py-2.5">
            {VISIBILITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Post type</span>
          <select value={postType} onChange={(event) => setPostType(event.target.value)} className="cs-input py-2.5">
            <option value="TEXT">Text</option>
            <option value="MEDIA">Media</option>
          </select>
        </label>
      </div>

      <div className="mt-3 px-5">
        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Media URLs</span>
          <textarea value={mediaUrls} onChange={(event) => setMediaUrls(event.target.value)} rows={2}
            placeholder="Paste media URLs separated by commas or new lines"
            className="cs-input resize-none" />
        </label>
      </div>

      <div className="mt-3 px-5">
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-4 transition hover:border-brand-300 hover:bg-brand-50/30">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
            <Image className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700">Upload media</p>
            <p className="text-xs text-slate-400">Images or videos (JPEG, PNG, WebP, MP4)</p>
          </div>
          <input type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles(Array.from(e.target.files || []))} className="hidden" />
          {files.length > 0 ? (
            <span className="cs-badge bg-emerald-50 text-emerald-700 border border-emerald-100">{files.length} file{files.length > 1 ? 's' : ''}</span>
          ) : null}
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 px-5 py-4">
        <p className="text-xs text-slate-400">Public by default. Switch visibility for a narrower audience.</p>
        <button type="submit" disabled={uploading || createPost.isPending} className="cs-btn cs-btn-primary">
          <Send className="h-4 w-4" />
          {uploading ? 'Uploading…' : 'Post'}
        </button>
      </div>
    </form>
  );
}
