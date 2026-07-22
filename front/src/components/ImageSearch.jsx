import { useState, useRef } from 'react';
import { X, Camera, Search, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storeApi, getImageUrl } from '../services/api';
import coatImg from '../assets/coat.png';

// ── colour helpers ────────────────────────────────────────────
const hexToRgb = (hex) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
};

const colorDist = (a, b) =>
  Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);

const getDominantColor = (file) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = 60;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 60, 60);
      const d = ctx.getImageData(0, 0, 60, 60).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      const px = d.length / 4;
      URL.revokeObjectURL(url);
      resolve({ r: r / px, g: g / px, b: b / px });
    };
    img.src = url;
  });

// ── main component ────────────────────────────────────────────
const ImageSearch = ({ onClose }) => {
  const [preview, setPreview]   = useState(null);
  const [file, setFile]         = useState(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults]   = useState(null);   // null = not searched yet
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResults(null);
  };

  const handleSearch = async () => {
    if (!file) return;
    setSearching(true);
    try {
      const dominantColor = await getDominantColor(file);
      const data = await storeApi.getProducts({ limit: 50, sort: 'newest' });
      const products = data.products || data || [];

      const scored = products.map((p) => {
        if (!p.colors?.length) return { ...p, _score: 999 };
        const best = Math.min(
          ...p.colors.map((hex) => {
            const rgb = hexToRgb(hex);
            return rgb ? colorDist(dominantColor, rgb) : 999;
          })
        );
        return { ...p, _score: best };
      });

      scored.sort((a, b) => a._score - b._score);
      setResults(scored.slice(0, 8));
    } catch (err) {
      console.error('Visual search error:', err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setFile(null);
    setResults(null);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-serif text-gray-900">Search by Image</h2>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">
              Upload a photo to find similar products
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Drop zone */}
          {!preview ? (
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              className={`border-2 border-dashed cursor-pointer flex flex-col items-center justify-center py-14 gap-3 transition-colors ${
                dragOver ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Camera size={32} className="text-gray-300" />
              <p className="text-sm text-gray-500">Drop image here or <span className="font-medium text-gray-900">browse</span></p>
              <p className="text-[10px] uppercase tracking-widest text-gray-300">PNG · JPG · WEBP</p>
              <input
                ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <img src={preview} alt="uploaded" className="w-20 h-20 object-cover border border-gray-100" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-1">Image ready</p>
                <p className="text-[10px] text-gray-400 mb-3">We'll match products by colour & style</p>
                <button onClick={reset} className="text-[10px] text-gray-400 hover:text-gray-700 underline uppercase tracking-widest">
                  Change image
                </button>
              </div>
            </div>
          )}

          {/* Search button */}
          {preview && (
            <button
              onClick={handleSearch}
              disabled={searching}
              className="w-full bg-gray-900 text-white py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {searching ? (
                <><Upload size={13} className="animate-bounce" /> Searching...</>
              ) : (
                <><Search size={13} /> Find Similar Products</>
              )}
            </button>
          )}

          {/* Results */}
          {results !== null && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">
                {results.length > 0 ? `${results.length} products found` : 'No products found'}
              </p>
              {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {results.map((p) => (
                    <Link
                      key={p._id}
                      to={`/product/${p._id}`}
                      onClick={onClose}
                      className="group block"
                    >
                      <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-2">
                        <img
                          src={getImageUrl(p.image) || coatImg}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <p className="text-[11px] font-bold text-gray-900 truncate uppercase tracking-wide">{p.name}</p>
                      <p className="text-[10px] text-gray-400">${p.price}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Camera size={28} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400">No matching products found</p>
                  <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest">Try a different image</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSearch;
