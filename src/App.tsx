/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  History, 
  User, 
  Upload, 
  Sparkles, 
  ChevronLeft, 
  Download, 
  Share2, 
  Copy, 
  Check,
  Edit2,
  Mail,
  Users,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandIdentity, Draft } from './types';
import { generateBrandIdentity } from './services/geminiService';

type Screen = 'create' | 'logo-system' | 'visual-identity' | 'history';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('create');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIdentity, setCurrentIdentity] = useState<BrandIdentity | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/drafts');
      const data = await res.json();
      setDrafts(data);
    } catch (err) {
      console.error('Failed to fetch drafts', err);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!description) return;
    setIsGenerating(true);
    try {
      const identity = await generateBrandIdentity(description, logo || undefined);
      setCurrentIdentity(identity);
      
      // Save to drafts
      await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: identity.name,
          description: description,
          logo_url: logo,
          identity: identity
        })
      });
      
      fetchDrafts();
      setCurrentScreen('logo-system');
    } catch (err) {
      console.error('Generation failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const renderCreateScreen = () => (
    <div className="flex flex-col gap-8 p-6 pb-24 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold">iBrand</h1>
        </div>
        <button className="text-slate-400">
          <HelpCircle className="w-6 h-6" />
        </button>
      </header>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Your Identity</h2>
        <p className="text-slate-400 text-sm">
          Upload your logo and describe your brand to generate a professional visual system instantly.
        </p>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="aspect-[4/3] border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary transition-colors bg-card-dark/30 group"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleLogoUpload} 
          className="hidden" 
          accept="image/*"
        />
        {logo ? (
          <img src={logo} alt="Logo preview" className="max-h-32 object-contain" />
        ) : (
          <>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Tap to upload logo</p>
              <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG (Max. 5MB)</p>
            </div>
          </>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Brand Narrative</label>
        <div className="relative">
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            placeholder="Describe your company's mission, values, and target audience..."
            className="w-full h-40 bg-card-dark border border-slate-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
          />
          <span className="absolute bottom-4 right-4 text-xs text-slate-500">
            {description.length}/500
          </span>
        </div>
      </div>

      <button 
        onClick={handleGenerate}
        disabled={!description || isGenerating}
        className="w-full h-14 bg-primary hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
      >
        {isGenerating ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Identity
          </>
        )}
      </button>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Recent Drafts</h3>
          <button onClick={() => setCurrentScreen('history')} className="text-primary text-sm font-medium">View All</button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {drafts.length > 0 ? drafts.slice(0, 3).map((draft) => (
            <div 
              key={draft.id} 
              onClick={() => {
                setCurrentIdentity(draft.identity);
                setCurrentScreen('visual-identity');
              }}
              className="min-w-[160px] cursor-pointer group"
            >
              <div className="aspect-square bg-card-dark rounded-xl flex items-center justify-center mb-2 overflow-hidden border border-slate-800 group-hover:border-primary/50 transition-colors">
                {draft.logo_url ? (
                  <img src={draft.logo_url} alt={draft.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-slate-800 rounded-lg" />
                )}
              </div>
              <p className="text-sm font-medium truncate">{draft.name}</p>
            </div>
          )) : (
            <div className="text-slate-500 text-sm italic">No drafts yet.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLogoSystemScreen = () => {
    if (!currentIdentity) return null;
    return (
      <div className="flex flex-col min-h-screen bg-background-dark">
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background-dark/95 backdrop-blur-sm border-b border-slate-800">
          <button onClick={() => setCurrentScreen('create')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center pr-10">Logo System</h1>
        </header>

        <main className="flex-1 p-4 flex flex-col gap-6 pb-32 max-w-md mx-auto w-full">
          <section 
            onClick={() => setCurrentScreen('visual-identity')}
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-card-dark shadow-sm hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className="absolute top-4 left-4 z-10">
              <span className="px-2 py-1 text-[10px] font-bold tracking-widest uppercase text-slate-400 bg-black/40 backdrop-blur-md rounded border border-white/10">
                Primary Lockup
              </span>
            </div>
            <div className="aspect-[4/3] w-full flex items-center justify-center p-8 bg-gradient-to-tr from-card-darker via-card-dark to-card-darker">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary rounded-full blur-[60px] opacity-20"></div>
                {logo ? (
                  <img src={logo} alt="Logo" className="max-h-full max-w-full object-contain relative z-10" />
                ) : (
                  <Sparkles className="w-20 h-20 text-white relative z-10" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-card-darker">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium">Resolution</span>
                <span className="text-sm font-semibold">4096 x 4096 px</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-xs font-bold text-slate-400 tracking-wider">READY</span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            {[
              { label: 'Logomark', content: logo ? <img src={logo} className="w-16 h-16 object-contain" /> : <Sparkles className="w-12 h-12 text-primary" /> },
              { label: 'Wordmark', content: <span className="text-2xl font-bold tracking-tighter uppercase">{currentIdentity.name}</span> },
              { label: 'Monochrome', content: logo ? <img src={logo} className="w-16 h-16 object-contain grayscale invert" /> : <Sparkles className="w-12 h-12 text-white" />, dark: true },
              { label: 'App Icon', content: (
                <div className="w-20 h-20 bg-primary rounded-[18px] shadow-lg flex items-center justify-center">
                  {logo ? <img src={logo} className="w-10 h-10 object-contain brightness-0 invert" /> : <Sparkles className="w-10 h-10 text-white" />}
                </div>
              ) },
            ].map((item, i) => (
              <div key={i} className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-card-dark hover:border-primary/40 transition-colors">
                <div className="absolute top-3 left-3 z-10">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">{item.label}</span>
                </div>
                <div className={`aspect-square flex items-center justify-center p-6 ${item.dark ? 'bg-black' : 'bg-card-darker'}`}>
                  {item.content}
                </div>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-2">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-500 px-1">Brand Colors</span>
            <div className="flex h-12 w-full rounded-lg overflow-hidden border border-slate-800 shadow-sm">
              <div className="flex-1 bg-primary" title={currentIdentity.colors.primary}></div>
              {currentIdentity.colors.secondary.map((c, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: c }} title={c}></div>
              ))}
              {currentIdentity.colors.neutral.map((c, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: c }} title={c}></div>
              ))}
            </div>
          </section>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-40 pb-8 pt-10">
          <div className="flex w-full max-w-md mx-auto gap-3">
            <button className="flex-1 h-14 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Download className="w-5 h-5" />
              Export All
            </button>
            <button className="flex-1 h-14 bg-card-dark hover:bg-slate-800 text-white border border-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
              <Share2 className="w-5 h-5" />
              Share Link
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVisualIdentityScreen = () => {
    if (!currentIdentity) return null;
    return (
      <div className="flex flex-col min-h-screen bg-background-dark">
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background-dark/95 backdrop-blur-sm border-b border-slate-800">
          <button onClick={() => setCurrentScreen('logo-system')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-base font-semibold">Visual Identity System</h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-slate-800 transition-colors">
            <Edit2 className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-40 max-w-md mx-auto w-full">
          <div className="px-4 py-6">
            <div className="relative w-full overflow-hidden rounded-2xl bg-card-dark shadow-lg ring-1 ring-white/10 aspect-[4/3] group">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                style={{ backgroundImage: `url('https://picsum.photos/seed/${currentIdentity.name}/800/600')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-transparent to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-blue-200 ring-1 ring-inset ring-blue-500/20">Active</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Brand v1.0</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{currentIdentity.name} Identity</h2>
                <p className="text-slate-400 text-xs mt-1">Updated just now</p>
              </div>
            </div>
          </div>

          <section className="px-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold tracking-tight">Color Palette</h3>
              <button className="text-sm font-medium text-primary">Export Swatches</button>
            </div>
            
            <div className="mb-4 overflow-hidden rounded-xl bg-card-dark shadow-md ring-1 ring-white/5">
              <div className="h-32 w-full" style={{ backgroundColor: currentIdentity.colors.primary }}></div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold">Primary Color</p>
                  <p className="text-xs text-slate-400 mt-0.5">Main Brand Color</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-slate-300 uppercase">{currentIdentity.colors.primary}</span>
                  <button 
                    onClick={() => copyToClipboard(currentIdentity.colors.primary)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-primary transition-all"
                  >
                    {copiedColor === currentIdentity.colors.primary ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentIdentity.colors.secondary.map((color, i) => (
                <div key={i} className="overflow-hidden rounded-xl bg-card-dark ring-1 ring-white/5">
                  <div className="h-20 w-full" style={{ backgroundColor: color }}></div>
                  <div className="p-3">
                    <p className="text-xs font-semibold mb-1">Accent {i + 1}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400 uppercase">{color}</span>
                      <button onClick={() => copyToClipboard(color)} className="text-slate-500 hover:text-white">
                        {copiedColor === color ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button className="flex h-full min-h-[120px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-transparent text-slate-500 hover:border-primary hover:text-primary transition-all">
                <Plus className="mb-1 w-6 h-6" />
                <span className="text-xs font-medium">Add Color</span>
              </button>
            </div>
          </section>

          <section className="px-4 mb-8">
            <h3 className="text-lg font-bold tracking-tight mb-4">Typography</h3>
            <div className="rounded-xl bg-card-dark p-6 ring-1 ring-white/5">
              <div className="mb-6 flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="text-5xl font-bold text-white mb-2">Aa</div>
                  <h4 className="text-xl font-semibold text-white">{currentIdentity.typography.fontFamily}</h4>
                </div>
                <div className="rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300 uppercase tracking-wider">Sans Serif</div>
              </div>
              <div className="space-y-6">
                <div className="pl-4 border-l-2 border-primary/30">
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Heading 1 • Bold 32px</p>
                  <h1 className="text-3xl font-bold text-white leading-tight">Visual Identity</h1>
                </div>
                <div className="pl-4 border-l-2 border-slate-800">
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Heading 2 • Semibold 24px</p>
                  <h2 className="text-2xl font-semibold text-slate-200 leading-tight">Design System</h2>
                </div>
                <div className="pl-4 border-l-2 border-slate-800">
                  <p className="mb-1 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Body • Regular 16px</p>
                  <p className="text-base text-slate-400 leading-relaxed">
                    {currentIdentity.narrative.slice(0, 150)}...
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 mb-8">
            <h3 className="text-lg font-bold tracking-tight mb-4">Application</h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
              {[
                { title: 'Stationery', img: `https://picsum.photos/seed/${currentIdentity.name}1/400/500` },
                { title: 'Digital Assets', img: `https://picsum.photos/seed/${currentIdentity.name}2/400/500` },
                { title: 'Merchandise', img: `https://picsum.photos/seed/${currentIdentity.name}3/400/500` },
              ].map((item, i) => (
                <div key={i} className="min-w-[200px] snap-center rounded-xl overflow-hidden bg-card-dark ring-1 ring-white/5">
                  <div className="aspect-[3/4] w-full bg-cover bg-center" style={{ backgroundImage: `url('${item.img}')` }}></div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-30 w-full bg-background-dark/80 backdrop-blur-xl border-t border-slate-800 p-4 pb-8">
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 px-4 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-blue-600 active:scale-95 transition-all">
              <Download className="w-5 h-5" />
              Download PDF Guide
            </button>
            <div className="flex items-center justify-center gap-8 text-slate-400">
              {[
                { icon: Share2, label: 'Share' },
                { icon: Mail, label: 'Email' },
                { icon: Users, label: 'Slack' },
              ].map((item, i) => (
                <button key={i} className="flex flex-col items-center gap-1.5 hover:text-white transition-colors group">
                  <div className="flex w-10 h-10 items-center justify-center rounded-full bg-slate-800 ring-1 ring-white/5 group-hover:bg-slate-700 transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryScreen = () => (
    <div className="flex flex-col min-h-screen bg-background-dark p-6 pb-24 max-w-md mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <button onClick={() => setCurrentScreen('create')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center pr-10">History</h1>
      </header>

      <div className="space-y-4">
        {drafts.map((draft) => (
          <div 
            key={draft.id} 
            onClick={() => {
              setCurrentIdentity(draft.identity);
              setCurrentScreen('visual-identity');
            }}
            className="flex items-center gap-4 p-4 bg-card-dark rounded-2xl border border-slate-800 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-card-darker rounded-xl flex items-center justify-center overflow-hidden border border-slate-800">
              {draft.logo_url ? (
                <img src={draft.logo_url} alt={draft.name} className="w-full h-full object-cover" />
              ) : (
                <Sparkles className="w-8 h-8 text-slate-700" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate">{draft.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{new Date(draft.created_at).toLocaleDateString()}</p>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
          </div>
        ))}
        {drafts.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No history found</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 selection:bg-primary selection:text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-screen"
        >
          {currentScreen === 'create' && renderCreateScreen()}
          {currentScreen === 'logo-system' && renderLogoSystemScreen()}
          {currentScreen === 'visual-identity' && renderVisualIdentityScreen()}
          {currentScreen === 'history' && renderHistoryScreen()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background-dark/80 backdrop-blur-xl border-t border-slate-800 z-50 flex items-center justify-around px-6">
        {[
          { id: 'create', icon: Plus, label: 'Create' },
          { id: 'history', icon: History, label: 'History' },
          { id: 'profile', icon: User, label: 'Profile' },
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setCurrentScreen(item.id as Screen)}
            className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === item.id ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
