
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { Button } from './Button';
import { AppLanguage, ToolMode } from '../types';
import { TRANSLATIONS } from '../translations';
import { processImageWithGemini } from '../services/geminiService';

interface ImageEditorProps {
  imageSrc: string;
  onSave: (newImage: string) => void;
  onCancel: () => void;
  language: AppLanguage;
}

interface EditState {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  rotation: number;
  fineRotation: number;
  flipX: boolean;
  flipY: boolean;
  aspectRatio: number | null;
}

const INITIAL_STATE: EditState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  rotation: 0,
  fineRotation: 0,
  flipX: false,
  flipY: false,
  aspectRatio: null,
};

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onSave, onCancel, language }) => {
  const t = (key: string) => {
    // @ts-ignore
    return TRANSLATIONS[language][key] || key;
  };
  
  // --- History & State Management ---
  const [history, setHistory] = useState<EditState[]>([INITIAL_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const currentState = history[historyIndex];

  // UI State
  const [activeTab, setActiveTab] = useState<'adjust' | 'transform' | 'magic-brush'>('magic-brush');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  // Magic Brush State
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('');
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingContainerRef = useRef<HTMLDivElement>(null);
  const [maskHasContent, setMaskHasContent] = useState(false);

  // Sync UI state when history index changes
  const [uiState, setUiState] = useState<EditState>(INITIAL_STATE);
  useEffect(() => {
    setUiState(history[historyIndex]);
  }, [historyIndex, history]);

  const commitToHistory = (newState: EditState) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newState);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
  };

  const handleImmediateChange = (changes: Partial<EditState>) => {
      const newState = { ...uiState, ...changes };
      setUiState(newState);
      commitToHistory(newState);
  };

  const handleSliderChange = (changes: Partial<EditState>) => {
      setUiState(prev => ({ ...prev, ...changes }));
  };

  const handleSliderCommit = () => {
      commitToHistory(uiState);
  };

  const undo = () => {
      if (historyIndex > 0) setHistoryIndex(historyIndex - 1);
  };

  const redo = () => {
      if (historyIndex < history.length - 1) setHistoryIndex(historyIndex + 1);
  };

  const resetEdits = () => {
      handleImmediateChange(INITIAL_STATE);
      clearMask();
  };

  // --- Magic Brush Drawing Logic ---
  const getPointerPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      let clientX, clientY;
      
      if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = (e as React.MouseEvent).clientX;
          clientY = (e as React.MouseEvent).clientY;
      }

      return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
      };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = maskCanvasRef.current;
      if (!canvas) return;
      setIsDrawing(true);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const { x, y } = getPointerPos(e, canvas);
      ctx.beginPath();
      ctx.moveTo(x, y);
      setMaskHasContent(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      const canvas = maskCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const { x, y } = getPointerPos(e, canvas);
      ctx.lineTo(x, y);
      ctx.stroke();
  };

  const stopDrawing = () => {
      setIsDrawing(false);
      const canvas = maskCanvasRef.current;
      if(canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.closePath();
      }
  };

  const clearMask = () => {
      const canvas = maskCanvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
          setMaskHasContent(false);
      }
  };

  const runMagicBrush = async () => {
      if (!maskHasContent || !magicPrompt.trim()) return;
      setIsProcessing(true);

      try {
          const currentImageBase64 = await getProcessedImageBase64();
          const maskBase64 = getMaskImageBase64();

          const newImageUrl = await processImageWithGemini(
              currentImageBase64,
              ToolMode.MAGIC_BRUSH,
              magicPrompt,
              null,
              undefined, undefined,
              [maskBase64]
          );

          onSave(newImageUrl);
          
      } catch (e) {
          console.error("Magic Brush Error:", e);
          alert(t('error'));
      } finally {
          setIsProcessing(false);
      }
  };

  const getMaskImageBase64 = (): string => {
      const canvas = maskCanvasRef.current;
      if (!canvas) return '';
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return '';

      tempCtx.fillStyle = 'black';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      tempCtx.globalCompositeOperation = 'source-over';
      tempCtx.drawImage(canvas, 0, 0);
      
      tempCtx.globalCompositeOperation = 'source-in';
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      return tempCanvas.toDataURL('image/png');
  };

  const getProcessedImageBase64 = (): Promise<string> => {
      return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
              if(!ctx) return resolve(imageSrc);
              
              const isRotated90or270 = uiState.rotation % 180 !== 0;
              canvas.width = isRotated90or270 ? img.height : img.width;
              canvas.height = isRotated90or270 ? img.width : img.height;

              ctx.filter = `brightness(${uiState.brightness}%) contrast(${uiState.contrast}%) saturate(${uiState.saturation}%) sepia(${uiState.warmth}%)`;
              ctx.translate(canvas.width / 2, canvas.height / 2);
              ctx.scale(uiState.flipX ? -1 : 1, uiState.flipY ? -1 : 1);
              const totalRotationRad = ((uiState.rotation + uiState.fineRotation) * Math.PI) / 180;
              ctx.rotate(totalRotationRad);
              ctx.drawImage(img, -img.width / 2, -img.height / 2);
              
              resolve(canvas.toDataURL('image/png'));
          };
          img.src = imageSrc;
      });
  };

  const applyEdits = async () => {
    setIsProcessing(true);
    setTimeout(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            if (!ctx) return;

            const isRotated90or270 = uiState.rotation % 180 !== 0;
            const width = isRotated90or270 ? img.height : img.width;
            const height = isRotated90or270 ? img.width : img.height;

            canvas.width = width;
            canvas.height = height;

            ctx.filter = `brightness(${uiState.brightness}%) contrast(${uiState.contrast}%) saturate(${uiState.saturation}%) sepia(${uiState.warmth}%)`;
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(uiState.flipX ? -1 : 1, uiState.flipY ? -1 : 1);
            const totalRotationRad = ((uiState.rotation + uiState.fineRotation) * Math.PI) / 180;
            ctx.rotate(totalRotationRad);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            
            if (uiState.aspectRatio) {
                const cropCanvas = document.createElement('canvas');
                const cropCtx = cropCanvas.getContext('2d');
                if (cropCtx) {
                    let cropWidth, cropHeight;
                    if (width / height > uiState.aspectRatio) {
                        cropHeight = height;
                        cropWidth = height * uiState.aspectRatio;
                    } else {
                        cropWidth = width;
                        cropHeight = width / uiState.aspectRatio;
                    }
                    cropCanvas.width = cropWidth;
                    cropCanvas.height = cropHeight;
                    const sourceX = (width - cropWidth) / 2;
                    const sourceY = (height - cropHeight) / 2;
                    cropCtx.drawImage(canvas, sourceX, sourceY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
                    onSave(cropCanvas.toDataURL('image/png'));
                }
            } else {
                onSave(canvas.toDataURL('image/png'));
            }
            setIsProcessing(false);
        };
        img.src = imageSrc;
    }, 100);
  };

  const rotate = () => handleImmediateChange({ rotation: (uiState.rotation + 90) % 360 });

  const previewStyle: React.CSSProperties = {
     transform: `scaleX(${uiState.flipX ? -1 : 1}) scaleY(${uiState.flipY ? -1 : 1}) rotate(${uiState.rotation + uiState.fineRotation}deg)`,
     filter: showOriginal ? 'none' : `brightness(${uiState.brightness}%) contrast(${uiState.contrast}%) saturate(${uiState.saturation}%) sepia(${uiState.warmth}%)`,
     transition: 'filter 0.2s ease-out, transform 0.3s ease-out'
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.target as HTMLImageElement;
      if (maskCanvasRef.current) {
          maskCanvasRef.current.width = img.naturalWidth;
          maskCanvasRef.current.height = img.naturalHeight;
      }
  };

  const SOCIAL_RATIOS = [
      { label: 'Story', ratio: 9/16, icon: <Icons.Tiktok /> },
      { label: 'Portrait', ratio: 4/5, icon: <Icons.Instagram /> },
      { label: 'Square', ratio: 1/1, icon: <Icons.Instagram /> },
      { label: 'Cover', ratio: 16/9, icon: <Icons.Facebook /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0f1d] flex flex-col md:flex-row font-heebo animate-in fade-in duration-300" dir={language === 'he' ? 'rtl' : 'ltr'}>
      
      {/* --- Main Canvas Area (Left/Center) --- */}
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
          
          {/* Top Bar inside Canvas Area */}
          <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
              <div className="pointer-events-auto">
                  <button onClick={onCancel} className="bg-black/40 backdrop-blur-md hover:bg-white/10 text-white p-2 rounded-full border border-white/10 transition-colors">
                      <Icons.X className="w-5 h-5"/>
                  </button>
              </div>
              <div className="pointer-events-auto flex gap-2">
                  <button 
                      onClick={undo}
                      disabled={historyIndex === 0}
                      className="p-2 bg-black/40 backdrop-blur-md text-white rounded-full border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                      <Icons.Undo className="w-4 h-4"/>
                  </button>
                  <button 
                      onClick={redo}
                      disabled={historyIndex < history.length - 1}
                      className="p-2 bg-black/40 backdrop-blur-md text-white rounded-full border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                      <Icons.Redo className="w-4 h-4"/>
                  </button>
              </div>
          </div>

          {/* The Canvas */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-900 overflow-hidden relative">
              <div 
                  ref={drawingContainerRef}
                  className="relative shadow-2xl transition-all duration-300 group select-none max-w-full max-h-full"
                  style={{
                      // Ensure responsive sizing without overflow
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      ...previewStyle
                  }}
              >
                  <img 
                      src={imageSrc} 
                      alt="Editing Preview" 
                      onLoad={onImageLoad}
                      className="max-h-[85vh] w-auto object-contain pointer-events-none select-none block"
                      draggable={false}
                  />
                  
                  {activeTab === 'magic-brush' && (
                      <canvas
                          ref={maskCanvasRef}
                          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                      />
                  )}
                  
                  {uiState.aspectRatio && !showOriginal && (
                       <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <div 
                              className="border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.85)] transition-all duration-300 relative"
                              style={{
                                  aspectRatio: `${uiState.aspectRatio}`,
                                  width: uiState.aspectRatio >= 1 ? '100%' : 'auto',
                                  height: uiState.aspectRatio < 1 ? '100%' : 'auto'
                              }}
                          >
                              <div className="absolute w-full h-px bg-white/20 top-1/3"></div>
                              <div className="absolute w-full h-px bg-white/20 top-2/3"></div>
                              <div className="absolute h-full w-px bg-white/20 left-1/3"></div>
                              <div className="absolute h-full w-px bg-white/20 left-2/3"></div>
                          </div>
                       </div>
                  )}
              </div>

              {/* Compare Button Floating */}
              <button 
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95"
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onMouseLeave={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
              >
                  <Icons.Layers className="w-4 h-4"/>
                  {showOriginal ? t('viewOrig') : t('compare')}
              </button>
          </div>
      </div>

      {/* --- Controls Sidebar (Right on Desktop, Bottom on Mobile) --- */}
      <div className="bg-[#121826] border-t md:border-t-0 md:border-l border-white/5 w-full md:w-80 lg:w-96 flex flex-col shrink-0 z-40 shadow-2xl">
          
          {/* Header Actions (Save/Reset) */}
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <button onClick={resetEdits} className="text-xs text-slate-400 hover:text-white transition-colors">
                  {t('reset')}
              </button>
              <Button onClick={applyEdits} isLoading={isProcessing} className="!py-2 !px-6 !text-sm !rounded-xl shadow-purple-500/20">
                  <Icons.Check className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                  {t('save')}
              </Button>
          </div>

          {/* Tools Navigation (Tabs) */}
          <div className="flex md:grid md:grid-cols-3 border-b border-white/5 bg-black/20">
               {['magic-brush', 'adjust', 'transform'].map((tab) => (
                   <button 
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex-1 py-4 flex flex-col items-center gap-1.5 transition-all relative ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                      <div className={`p-2 rounded-lg transition-all ${activeTab === tab ? 'bg-purple-600/20 text-purple-400' : ''}`}>
                          {tab === 'magic-brush' && <Icons.Brush className="w-5 h-5"/>}
                          {tab === 'adjust' && <Icons.Palette className="w-5 h-5"/>}
                          {tab === 'transform' && <Icons.Crop className="w-5 h-5"/>}
                      </div>
                      <span className="text-[10px] font-bold tracking-wide">
                          {tab === 'magic-brush' ? t('magicBrush') : tab === 'adjust' ? t('adjust') : t('crop')}
                      </span>
                      {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>}
                   </button>
               ))}
          </div>

          {/* Controls Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              
              {/* MAGIC BRUSH CONTROLS */}
              {activeTab === 'magic-brush' && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                      <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5">
                          <div className="flex justify-between items-center mb-4">
                              <label className="text-xs font-bold text-white uppercase tracking-wider">{t('paintArea')}</label>
                              <button onClick={clearMask} className="text-[10px] text-pink-400 hover:text-pink-300 flex items-center gap-1 bg-pink-500/10 px-2 py-1 rounded">
                                  <Icons.Trash className="w-3 h-3"/> {t('clear')}
                              </button>
                          </div>
                          <div className="space-y-3">
                              <div className="flex justify-between text-xs text-slate-400">
                                  <span>{t('brushSize')}</span>
                                  <span className="text-white font-mono">{brushSize}px</span>
                              </div>
                              <input 
                                  type="range" min="5" max="100" 
                                  value={brushSize} 
                                  onChange={(e) => setBrushSize(Number(e.target.value))}
                                  className="w-full accent-pink-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                              />
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('prompt')}</label>
                          <textarea 
                              value={magicPrompt}
                              onChange={(e) => setMagicPrompt(e.target.value)}
                              placeholder={t('magicPrompt')}
                              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-pink-500 outline-none resize-none h-24 placeholder:text-slate-600 transition-colors"
                          />
                      </div>

                      <Button 
                          onClick={runMagicBrush} 
                          disabled={!maskHasContent || !magicPrompt.trim() || isProcessing}
                          isLoading={isProcessing}
                          className="w-full py-4 text-lg bg-gradient-to-r from-pink-600 to-purple-600 border-none shadow-xl shadow-purple-900/20"
                      >
                          <Icons.Sparkles className="w-5 h-5 ltr:mr-2 rtl:ml-2"/>
                          {t('runMagic')}
                      </Button>
                  </div>
              )}

              {/* ADJUST CONTROLS */}
              {activeTab === 'adjust' && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                       {[
                           { icon: <Icons.Sun/>, label: 'brightness', key: 'brightness', min: 50, max: 150, color: 'accent-yellow-400' },
                           { icon: <Icons.Contrast/>, label: 'contrast', key: 'contrast', min: 50, max: 150, color: 'accent-gray-200' },
                           { icon: <Icons.Drop/>, label: 'saturation', key: 'saturation', min: 0, max: 200, color: 'accent-blue-400' },
                           { icon: <Icons.Palette/>, label: 'warmth', key: 'warmth', min: 0, max: 100, color: 'accent-orange-400' },
                       ].map((item) => (
                           <div key={item.key} className="bg-slate-800/20 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex justify-between text-xs text-slate-300 mb-3 font-medium items-center">
                                    <span className="flex items-center gap-2 text-slate-200">
                                        <div className="p-1 bg-white/5 rounded text-white/70 scale-75">{item.icon}</div>
                                        {t(item.label)}
                                    </span>
                                    <span className="bg-black/30 px-2 py-0.5 rounded text-white/50 font-mono">
                                        {/* @ts-ignore */}
                                        {uiState[item.key]}%
                                    </span>
                                </div>
                                <input 
                                    type="range" min={item.min} max={item.max}
                                    /* @ts-ignore */
                                    value={uiState[item.key]} 
                                    /* @ts-ignore */
                                    onChange={(e) => handleSliderChange({ [item.key]: Number(e.target.value) })} 
                                    onMouseUp={handleSliderCommit}
                                    onTouchEnd={handleSliderCommit}
                                    className={`w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer ${item.color}`}
                                />
                           </div>
                       ))}
                  </div>
              )}

              {/* TRANSFORM CONTROLS */}
              {activeTab === 'transform' && (
                  <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
                      
                      <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('socialOpt')}</label>
                          <div className="grid grid-cols-3 gap-2">
                              <button
                                  onClick={() => handleImmediateChange({ aspectRatio: null })}
                                  className={`p-3 rounded-xl text-[10px] font-bold transition-all border flex flex-col items-center justify-center gap-2 ${
                                      uiState.aspectRatio === null
                                      ? 'bg-white text-black border-white shadow-lg' 
                                      : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800'
                                  }`}
                              >
                                  <Icons.Image className="w-4 h-4"/> Orig
                              </button>
                              {SOCIAL_RATIOS.map((opt) => (
                                  <button
                                      key={opt.label}
                                      onClick={() => handleImmediateChange({ aspectRatio: opt.ratio })}
                                      className={`p-3 rounded-xl text-[10px] font-bold transition-all border flex flex-col items-center justify-center gap-2 ${
                                          uiState.aspectRatio === opt.ratio 
                                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                                          : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800'
                                      }`}
                                  >
                                      <span className="scale-75 opacity-80">{opt.icon}</span>
                                      {opt.label}
                                  </button>
                              ))}
                          </div>
                      </div>
                      
                      <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('alignment')}</label>
                          <div className="flex gap-2">
                              <button onClick={rotate} className="flex-1 flex flex-col items-center gap-1 p-3 bg-slate-800/50 hover:bg-slate-700/80 rounded-xl text-slate-300 transition-colors border border-white/5" title={t('rotate')}>
                                  <Icons.RotateCw className="w-5 h-5"/>
                                  <span className="text-[10px] mt-1">90°</span>
                              </button>
                              <button onClick={() => handleImmediateChange({ flipX: !uiState.flipX })} className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-colors border border-white/5 ${uiState.flipX ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/80'}`} title={t('flipH')}>
                                  <Icons.Flip className="w-5 h-5"/>
                                  <span className="text-[10px] mt-1">Flip X</span>
                              </button>
                              <button onClick={() => handleImmediateChange({ flipY: !uiState.flipY })} className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-colors border border-white/5 ${uiState.flipY ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/80'}`} title={t('flipV')}>
                                  <div className="rotate-90"><Icons.Flip className="w-5 h-5"/></div>
                                  <span className="text-[10px] mt-1">Flip Y</span>
                              </button>
                          </div>
                      </div>

                      <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5">
                          <div className="flex justify-between text-xs text-slate-400 mb-3">
                              <span className="font-bold uppercase tracking-wider">{t('fineRotate')}</span>
                              <span dir="ltr" className="font-mono text-white/70">{uiState.fineRotation}°</span>
                          </div>
                          <input 
                              type="range" 
                              min="-45" 
                              max="45" 
                              value={uiState.fineRotation} 
                              onChange={(e) => handleSliderChange({ fineRotation: Number(e.target.value) })}
                              onMouseUp={handleSliderCommit}
                              onTouchEnd={handleSliderCommit}
                              className="w-full accent-white h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
