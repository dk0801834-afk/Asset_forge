import { useState } from 'react';
import { SparklesIcon, ArrowPathIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../utils/api';

const STYLE_PRESETS = [
  { label: 'None', value: '' },
  { label: '3D Model', value: '3d-model' },
  { label: 'Analog Film', value: 'analog-film' },
  { label: 'Anime', value: 'anime' },
  { label: 'Cinematic', value: 'cinematic' },
  { label: 'Comic Book', value: 'comic-book' },
  { label: 'Digital Art', value: 'digital-art' },
  { label: 'Fantasy Art', value: 'fantasy-art' },
  { label: 'Isometric', value: 'isometric' },
  { label: 'Line Art', value: 'line-art' },
  { label: 'Low Poly', value: 'low-poly' },
  { label: 'Neon Punk', value: 'neon-punk' },
  { label: 'Origami', value: 'origami' },
  { label: 'Photographic', value: 'photographic' },
  { label: 'Pixel Art', value: 'pixel-art' },
  { label: 'Texture', value: 'texture' },
];

export default function AIGenerator() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [stylePreset, setStylePreset] = useState('');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [numImages, setNumImages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (prompt.trim().length < 10) {
      toast.error('Please enter a more detailed prompt (at least 10 characters)');
      return;
    }
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const { data } = await api.post('/ai/generate', {
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim() || null,
        style_preset: stylePreset || null,
        width, height, num_images: numImages,
      });
      setResults(data.result_urls || []);
      if (data.result_urls?.length) {
        toast.success(`Generated ${data.result_urls.length} image(s)!`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Generation failed. Please try again.');
      toast.error('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = (path) => {
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL || ''}${path}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-4">
          <SparklesIcon className="w-4 h-4" /> Beta
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">AI Asset Generator</h1>
        <p className="text-dark-400 text-lg max-w-2xl mx-auto">
          Describe the asset you need in detail and our AI will generate high-resolution images for your project.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Controls */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Prompt <span className="text-red-400">*</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                placeholder="e.g., A minimalist 3D isometric icon of a rocket ship, soft clay material, studio lighting, pastel color palette, centered composition, white background, high detail..."
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 resize-none"
              />
              <p className="text-xs text-dark-500 mt-1">Be descriptive: style, materials, lighting, colors, camera angle.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Negative prompt</label>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                rows={2}
                placeholder="Things to avoid: blurry, low quality, distorted, ugly, watermark..."
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Style preset</label>
              <select value={stylePreset} onChange={(e) => setStylePreset(e.target.value)}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-brand-500">
                {STYLE_PRESETS.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Width</label>
                <select value={width} onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500">
                  {[512, 768, 1024, 1536].map((s) => (<option key={s} value={s}>{s}px</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Height</label>
                <select value={height} onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500">
                  {[512, 768, 1024, 1536].map((s) => (<option key={s} value={s}>{s}px</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Count</label>
                <select value={numImages} onChange={(e) => setNumImages(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500">
                  {[1, 2, 3, 4].map((n) => (<option key={n} value={n}>{n}</option>))}
                </select>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={loading || prompt.trim().length < 10}
              className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2">
              {loading ? (<><ArrowPathIcon className="w-5 h-5 animate-spin" /> Generating...</>) : (<><SparklesIcon className="w-5 h-5" /> Generate</>)}
            </button>
          </div>

          <div className="glass rounded-2xl p-5 mt-4 bg-brand-500/5 border-brand-500/20">
            <p className="text-xs text-dark-400 leading-relaxed">
              <strong className="text-brand-300">Tip:</strong> Generated assets are for prototyping and ideation.
              For production-ready assets, browse our curated bundles. Each generation counts as 1 credit per image.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl p-6 min-h-[500px]">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <ArrowPathIcon className="w-12 h-12 text-brand-400 animate-spin mb-4" />
                <p className="text-dark-300 font-medium">Generating your assets...</p>
                <p className="text-dark-500 text-sm mt-1">This can take 20-60 seconds</p>
              </div>
            )}

            {!loading && results.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <PhotoIcon className="w-16 h-16 text-dark-700 mb-4" />
                <p className="text-dark-400 font-medium">Your generated assets will appear here</p>
                <p className="text-dark-600 text-sm mt-1 max-w-sm">
                  Enter a detailed prompt on the left and click Generate to create custom assets.
                </p>
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-20">
                <p className="text-red-400 mb-2">Generation failed</p>
                <p className="text-dark-500 text-sm">{error}</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Generated assets</h3>
                <div className={`grid gap-4 ${results.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {results.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden bg-dark-800">
                      <img src={imageUrl(url)} alt={`Generated ${i+1}`} className="w-full h-auto" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <a href={imageUrl(url)} download={`assetforge-gen-${i}.png`}
                          className="px-4 py-2 bg-white text-dark-900 rounded-lg font-semibold text-sm hover:bg-dark-100">
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
