import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { Button } from './Button';
import { TEMPLATE_REGISTRY, GeneratedItem, COLLAGE_LAYOUTS, CampaignSettings, TemplateBuilderSettings, ToolMode, AppLanguage, TextTransform, MarketingIdeas } from '../types';
import { TRANSLATIONS } from '../translations';

interface WorkspaceProps {
  originalImage: string;
  generatedImage: string | null;
  onEdit: () => void;
  onUploadNew: () => void;
  selectedTemplateId?: string | null;
  isCollageMode?: boolean;
  collageImages?: GeneratedItem[];
  collageLayout?: string;
  onRemoveFromCollage?: (id: string) => void;
  onUploadToCollage?: () => void;
  showWatermark?: boolean;
  watermarkPosition: { x: number; y: number };
  onWatermarkMove: (pos: { x: number; y: number }) => void;
  campaignSettings: CampaignSettings;
  templateBuilderSettings: TemplateBuilderSettings;
  activeTool: ToolMode;
  onCampaignSettingChange: (field: keyof CampaignSettings, value: any) => void;
  language: AppLanguage;
  marketingIdeas?: MarketingIdeas | null;
}

const getClientCoords = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
  if ('touches' in e) { return { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
  return { x: (e as any).clientX, y: (e as any).clientY };
};

// --- DRAGGABLE COMPONENT LOGIC ---

interface DraggableTextElementProps {
    transform?: TextTransform;
    onTransformChange: (t: TextTransform) => void;
    children?: React.ReactNode;
    containerRef: React.RefObject<HTMLDivElement | null>;
    style?: React.CSSProperties;
    className?: string;
    isSelected?: boolean;
    onSelect?: () => void;
}

const DraggableTextElement = ({
    transform,
    onTransformChange,
    children,
    containerRef,
    style,
    className,
    isSelected,
    onSelect
}: DraggableTextElementProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    
    const startPos = useRef({ x: 0, y: 0 });
    const startTransform = useRef(transform);

    const handleStart = (e: React.MouseEvent | React.TouchEvent, mode: 'drag' | 'resize') => {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
        
        if (onSelect) onSelect();

        if (mode === 'drag') setIsDragging(true);
        if (mode === 'resize') setIsResizing(true);

        const coords = getClientCoords(e);
        startPos.current = { x: coords.x, y: coords.y };
        if (transform) {
            startTransform.current = { ...transform };
        }
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging && !isResizing) return;
            if (e.cancelable) e.preventDefault();
            
            const containerRect = containerRef.current?.getBoundingClientRect();
            if (!containerRect || !startTransform.current) return;

            const coords = getClientCoords(e);
            const deltaX = coords.x - startPos.current.x;
            const deltaY = coords.y - startPos.current.y;

            if (isDragging) {
                const deltaPercentX = (deltaX / containerRect.width) * 100;
                const deltaPercentY = (deltaY / containerRect.height) * 100;

                const newX = startTransform.current.x + deltaPercentX;
                const newY = startTransform.current.y + deltaPercentY;

                onTransformChange({
                    ...startTransform.current,
                    x: Math.max(-50, Math.min(150, newX)),
                    y: Math.max(-50, Math.min(150, newY))
                });
            } else if (isResizing) {
                const scaleDelta = (deltaY + deltaX) / 300; 
                const newScale = Math.max(0.2, Math.min(5, startTransform.current.scale + scaleDelta));
                
                onTransformChange({
                    ...startTransform.current,
                    scale: newScale
                });
            }
        };

        const handleEnd = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMove, { passive: false });
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, isResizing, onTransformChange, transform, containerRef]);

    if (!transform) return <div style={style} className={className}>{children}</div>;

    const isActive = isDragging || isResizing || isSelected;

    return (
        <div
            onMouseDown={(e) => handleStart(e, 'drag')}
            onTouchStart={(e) => handleStart(e, 'drag')}
            style={{
                position: 'absolute',
                left: `${transform.x}%`,
                top: `${transform.y}%`,
                transform: `translate(-50%, -50%) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                touchAction: 'none',
                zIndex: isActive ? 50 : 10,
                width: 'max-content',
                ...style
            }}
            className={`group ${className || ''}`}
        >
            <div className={`relative transition-all duration-200 p-2 ${isActive ? 'ring-2 ring-purple-500/80 bg-purple-500/10 rounded-xl' : 'hover:ring-1 hover:ring-white/40 rounded-xl'}`}>
                {children}
                
                <div 
                    className={`absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg items-center justify-center cursor-nwse-resize text-slate-800 hover:scale-110 hover:bg-purple-100 z-50 transition-all ${isActive ? 'flex' : 'hidden group-hover:flex'}`}
                    onMouseDown={(e) => handleStart(e, 'resize')}
                    onTouchStart={(e) => handleStart(e, 'resize')}
                >
                    <Icons.Move className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
};

const DraggableWatermark = ({ 
    position, 
    onMove, 
    containerRef 
}: { 
    position: { x: number, y: number }, 
    onMove: (pos: { x: number, y: number }) => void,
    containerRef: React.RefObject<HTMLDivElement | null>
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ mouseX: 0, mouseY: 0, watermarkX: 0, watermarkY: 0 });
    const dragContainerRect = useRef<DOMRect | null>(null);

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (containerRef.current) {
            dragContainerRect.current = containerRef.current.getBoundingClientRect();
        }
        const coords = getClientCoords(e);
        setIsDragging(true);
        dragStartPos.current = {
            mouseX: coords.x,
            mouseY: coords.y,
            watermarkX: position.x,
            watermarkY: position.y,
        };
    };

    useEffect(() => {
        const handleDragMove = (e: MouseEvent | TouchEvent) => {
            const rect = dragContainerRect.current;
            if (!isDragging || !rect) return;
            if (e.cancelable) e.preventDefault();

            const coords = getClientCoords(e);
            const deltaX = coords.x - dragStartPos.current.mouseX;
            const deltaY = coords.y - dragStartPos.current.mouseY;

            const deltaPercentX = (deltaX / rect.width) * 100;
            const deltaPercentY = (deltaY / rect.height) * 100;

            let newX = dragStartPos.current.watermarkX + deltaPercentX;
            let newY = dragStartPos.current.watermarkY + deltaPercentY;

            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            onMove({ x: newX, y: newY });
        };

        const handleDragEnd = () => {
            setIsDragging(false);
            dragContainerRect.current = null;
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove, { passive: false });
            window.addEventListener('touchmove', handleDragMove, { passive: false });
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchend', handleDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, onMove]); 

    const transformX = position.x > 50 ? '-100%' : '0%';
    const transformY = position.y > 50 ? '-100%' : '0%';

    return (
      <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={{
              position: 'absolute',
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: `translate(${transformX}, ${transformY})`,
              touchAction: 'none',
          }}
          className={`bg-black/60 px-2.5 md:px-3 py-1.5 rounded-lg border border-white/10 z-40 flex items-center gap-1.5 md:gap-2 shadow-lg transition-all pointer-events-auto ${isDragging ? 'cursor-grabbing scale-105 shadow-2xl ring-1 ring-purple-500' : 'cursor-grab hover:bg-black/70'}`}
        >
          <Icons.Sparkles className="w-2.5 md:w-3 h-2.5 md:h-3 text-purple-400" />
          <span className="text-[8px] md:text-[10px] font-bold text-white/90 tracking-widest uppercase">StudioPlay AI</span>
      </div>
    );
};

export const Workspace: React.FC<WorkspaceProps> = ({ 
  originalImage, generatedImage, onEdit, onUploadNew, selectedTemplateId,
  isCollageMode = false, collageImages = [], collageLayout = 'grid-2x2',
  onRemoveFromCollage, onUploadToCollage, showWatermark = false,
  watermarkPosition, onWatermarkMove,
  campaignSettings, templateBuilderSettings, activeTool, onCampaignSettingChange,
  language, marketingIdeas
}) => {
  const t = (key: string) => {
      // @ts-ignore
      return TRANSLATIONS[language][key] || key;
  };

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [sliderPos, setSliderPos] = useState(50);
  const [selectedLayer, setSelectedLayer] = useState<'title' | 'price' | 'discount' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayContainerRef = useRef<HTMLDivElement>(null);

  const isVideo = generatedImage && (generatedImage.startsWith('data:video') || generatedImage.startsWith('blob:'));
  const isIdeasMode = activeTool === ToolMode.AI_SMART_IDEAS;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const scaleAdjustment = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, scale + scaleAdjustment), 5);
    setScale(newScale);
  };

  const resetView = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

  const handlePanStart = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.group') || target.closest('.draggable-watermark') || target.closest('.ideas-container')) return;

    if (!containerRef.current) return;
    setIsPanning(true);
    const coords = getClientCoords(e);
    setPanStart({ x: coords.x - position.x, y: coords.y - position.y });
    setSelectedLayer(null);
  };

  const handleSliderStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsSliding(true);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const coords = getClientCoords(e);
      if (isPanning) {
        if (e.cancelable) e.preventDefault();
        setPosition({ x: coords.x - panStart.x, y: coords.y - panStart.y });
      }
      if (isSliding && containerRef.current) {
         if (e.cancelable) e.preventDefault();
         const parentRect = containerRef.current.getBoundingClientRect();
         const relativeX = coords.x - parentRect.left;
         let newPos = (relativeX / parentRect.width) * 100;
         newPos = Math.max(0, Math.min(100, newPos));
         setSliderPos(newPos);
      }
    };
    const handleEnd = () => { setIsPanning(false); setIsSliding(false); };

    if (isPanning || isSliding) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isPanning, isSliding, panStart]);

  useEffect(() => { resetView(); setSliderPos(50); }, [originalImage, generatedImage, activeTool]);

  const activeTemplate = TEMPLATE_REGISTRY.find(t => t.id === selectedTemplateId);
  const activeLayout = COLLAGE_LAYOUTS.find(l => l.id === collageLayout);

  const renderCollage = () => {
    if (!activeLayout) return null;
    const placeholders = Array.from({ length: activeLayout.maxImages }, (_, i) => i);
    const renderCell = (img: GeneratedItem | undefined, index: number) => (
      <div key={index} className="relative w-full h-full bg-slate-800/50 group overflow-hidden">
        {img ? (
          <>
            <img src={img.url} className="w-full h-full object-cover" alt={`Collage item ${index + 1}`} />
            <button onClick={() => onRemoveFromCollage && onRemoveFromCollage(img.id)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 shadow-lg"><Icons.X className="w-4 h-4" /></button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-600"><Icons.Image className="w-8 h-8 md:w-10 md:h-10 mb-2" /><span className="text-[10px] md:text-xs font-bold">{t('emptyPlace')}</span></div>
        )}
      </div>
    );
    let gridContent: React.ReactNode[] = placeholders.map((_, i) => renderCell(collageImages[i], i));
    if (activeLayout.id === 'mix-3') {
        gridContent = [<div key="cell-0" className="row-span-2">{renderCell(collageImages[0], 0)}</div>, <div key="cell-1">{renderCell(collageImages[1], 1)}</div>, <div key="cell-2">{renderCell(collageImages[2], 2)}</div>];
    }
    return (<div className={`grid ${activeLayout.gridClass} gap-2 w-full h-full p-2 bg-slate-900`}>{gridContent}</div>);
  };

  const renderTextOverlay = () => {
    if (!campaignSettings.showText) return null;
    const { title, price, discount, textStyle, language: textLang, font, titleTransform, priceTransform, discountTransform } = campaignSettings;
    const isHebrew = textLang !== 'english';

    const containerStyle: React.CSSProperties = {
        direction: isHebrew ? 'rtl' : 'ltr',
        fontFamily: `'${font}', sans-serif`
    };

    const TitleElement = (
        <DraggableTextElement 
            transform={titleTransform} 
            onTransformChange={(t) => onCampaignSettingChange('titleTransform', t)} 
            containerRef={overlayContainerRef}
            isSelected={selectedLayer === 'title'}
            onSelect={() => setSelectedLayer('title')}
        >
            <h2 className={`font-black leading-[1.1] drop-shadow-2xl whitespace-nowrap text-center ${
                textStyle === 'bold' ? 'text-4xl md:text-6xl text-white uppercase tracking-tighter' :
                textStyle === 'minimal' ? 'text-2xl md:text-3xl text-slate-900 font-bold' :
                textStyle === 'story' ? 'text-3xl md:text-5xl text-white uppercase tracking-tight' :
                textStyle === 'modern' ? 'text-3xl md:text-5xl text-white' :
                textStyle === 'glass-box' ? 'text-2xl md:text-4xl text-white' :
                'text-2xl md:text-4xl text-white'
            }`}>
                {title}
            </h2>
        </DraggableTextElement>
    );

    const PriceElement = (
        <DraggableTextElement 
            transform={priceTransform} 
            onTransformChange={(t) => onCampaignSettingChange('priceTransform', t)} 
            containerRef={overlayContainerRef}
            isSelected={selectedLayer === 'price'}
            onSelect={() => setSelectedLayer('price')}
        >
            <p className={`font-black drop-shadow-xl whitespace-nowrap ${
                textStyle === 'bold' ? 'text-xl md:text-3xl text-white/90 border-t-2 border-white/20 pt-2 mt-2' :
                textStyle === 'minimal' ? 'text-lg md:text-xl text-slate-700 font-medium' :
                textStyle === 'story' ? 'text-xl bg-white text-black px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black' :
                textStyle === 'modern' ? 'text-xl md:text-3xl text-white/80' :
                textStyle === 'glass-box' ? 'text-lg md:text-2xl text-white/90' :
                'text-lg md:text-2xl text-white'
            }`}>
                {price}
            </p>
        </DraggableTextElement>
    );

    const DiscountElement = discount ? (
        <DraggableTextElement 
            transform={discountTransform} 
            onTransformChange={(t) => onCampaignSettingChange('discountTransform', t)} 
            containerRef={overlayContainerRef}
            isSelected={selectedLayer === 'discount'}
            onSelect={() => setSelectedLayer('discount')}
        >
            <div className={`w-max whitespace-nowrap ${
                textStyle === 'bold' ? 'bg-black text-white font-black px-4 md:px-6 py-1.5 md:py-2 uppercase italic text-xl md:text-2xl shadow-2xl' :
                textStyle === 'minimal' ? 'text-sm md:text-base font-bold text-pink-600 uppercase tracking-widest' :
                textStyle === 'story' ? 'bg-pink-500 text-white px-4 md:px-5 py-1.5 md:py-2 rounded-full font-black text-base md:text-lg shadow-xl' :
                textStyle === 'modern' ? 'bg-white/20 border border-white/20 text-white text-[10px] md:text-sm font-black px-3 md:px-4 py-1 rounded-full uppercase tracking-tighter' :
                textStyle === 'glass-box' ? 'bg-white/30 text-white font-bold px-3 md:px-4 py-1 rounded-lg border border-white/20 text-sm' :
                'text-white bg-red-600 px-3 py-1 rounded-lg text-xs md:text-sm font-bold'
            }`}>
                {discount}
            </div>
        </DraggableTextElement>
    ) : null;

    const renderBackgroundEffects = () => {
        if (textStyle === 'modern') {
            return (
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
            );
        }
        if (textStyle === 'story') {
            return (
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            );
        }
        if (textStyle === 'glass-box') {
            return (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[85%] md:w-[70%] h-[70%] md:h-[60%] bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[3rem] shadow-2xl" />
                </div>
            );
        }
        return null;
    };

    return (
        <div ref={overlayContainerRef} className="absolute inset-0 overflow-hidden" style={containerStyle}>
            {renderBackgroundEffects()}
            {TitleElement}
            {PriceElement}
            {DiscountElement}
        </div>
    );
  };

  const IdeaCard = ({ title, items, icon, color }: { title: string, items: string[], icon: React.ReactNode, color: string }) => (
    <div className={`bg-slate-900/80 border border-white/10 rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 flex flex-col h-full hover:border-${color}-500/50 transition-all group overflow-hidden relative`}>
        <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-${color}-500`}>{icon}</div>
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-400 shrink-0`}>
                {icon}
            </div>
            <h4 className="font-black text-white text-sm md:text-base uppercase tracking-wider">{title}</h4>
        </div>
        <ul className="space-y-2.5 md:space-y-3 flex-1">
            {items.map((item, i) => (
                <li key={i} className="flex gap-2.5 md:gap-3 text-xs md:text-sm text-slate-300 group/item">
                    <span className={`text-${color}-500 font-black`}>{i + 1}.</span>
                    <span className="flex-1">{item}</span>
                    <button 
                        onClick={() => navigator.clipboard.writeText(item)}
                        className="opacity-0 md:group-hover/item:opacity-100 p-1 hover:text-white transition-all"
                        title={t('copyIdea')}
                    >
                        <Icons.Copy className="w-3 md:w-3.5 h-3 md:h-3.5" />
                    </button>
                </li>
            ))}
        </ul>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6 h-full">
      <div className="bg-slate-900/40 border border-white/10 rounded-[1.5rem] md:rounded-3xl p-0.5 md:p-1 backdrop-blur-xl relative group shadow-2xl flex-1 flex flex-col overflow-hidden select-none">
        {isIdeasMode ? (
            <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar ideas-container bg-[#050810]">
                 {!marketingIdeas ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto p-8 md:p-12 animate-pulse">
                         <div className="w-20 h-20 md:w-24 md:h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 text-yellow-500 border border-yellow-500/20">
                            <Icons.Lightbulb className="w-10 h-10 md:w-12 md:h-12" />
                         </div>
                         <h3 className="text-2xl md:text-3xl font-black text-white mb-3 md:mb-4">{t('giveMeIdeas')}</h3>
                         <p className="text-slate-400 text-sm md:text-lg leading-relaxed">
                            {t('ideasDescription')}
                         </p>
                         <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 text-[10px] md:text-xs text-slate-500">
                            <Icons.Zap className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>{language === 'he' ? 'השתמש בכפתור בפינה או בתחתית כדי להתחיל' : 'Use the button in the corner or bottom to start'}</span>
                         </div>
                    </div>
                 ) : (
                    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-8">
                             <div>
                                <h2 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2 tracking-tight">אסטרטגיית התוכן שלך</h2>
                                <p className="text-xs md:text-sm text-slate-400">רעיונות מותאמים אישית שנבנו עבורך ע"י הבינה המלאכותית</p>
                             </div>
                             <div className="flex gap-2 w-full md:w-auto">
                                <Button onClick={() => window.print()} variant="glass" className="flex-1 md:flex-initial !py-2 !px-4 !text-[10px] md:!text-xs">הורד כ-PDF</Button>
                                <Button onClick={() => window.location.reload()} variant="primary" className="flex-1 md:flex-initial !py-2 !px-4 !text-[10px] md:!text-xs">צור תוכנית חדשה</Button>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <div className="lg:col-span-2">
                                <IdeaCard title={t('postIdeas')} items={marketingIdeas.posts} icon={<Icons.LayoutGrid />} color="blue" />
                            </div>
                            <div className="flex flex-col gap-4 md:gap-6">
                                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 text-black shadow-xl">
                                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                                        <Icons.Zap className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                                        <h4 className="font-black uppercase tracking-wider text-sm md:text-base">{t('campaignTitle')}</h4>
                                    </div>
                                    <p className="text-xs md:text-sm font-bold leading-relaxed">{marketingIdeas.campaign}</p>
                                </div>
                                <div className="bg-slate-900/80 border border-white/10 rounded-[1.5rem] md:rounded-3xl p-5 md:p-6">
                                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                                        <Icons.Globe className="w-5 h-5 text-green-400" />
                                        <h4 className="font-black text-white uppercase tracking-wider text-sm md:text-base">{t('trendsTitle')}</h4>
                                    </div>
                                    <ul className="space-y-2.5 md:space-y-3">
                                        {marketingIdeas.trends.map((trend, i) => (
                                            <li key={i} className="text-xs md:text-sm text-slate-300 flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                                {trend}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <IdeaCard title={t('storyIdeas')} items={marketingIdeas.stories} icon={<Icons.Instagram />} color="pink" />
                            <IdeaCard title={t('videoIdeas')} items={marketingIdeas.videos} icon={<Icons.Film />} color="purple" />
                        </div>
                    </div>
                 )}
            </div>
        ) : (
            <>
                <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20 flex flex-col gap-1.5 md:gap-2 bg-black/60 backdrop-blur-md p-1 md:p-1.5 rounded-xl border border-white/10 shadow-xl">
                    <button onClick={() => setScale(s => Math.min(s + 0.5, 5))} className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg text-white transition-colors" title="Zoom In"><Icons.ZoomIn className="w-4 h-4 md:w-5 md:h-5"/></button>
                    <button onClick={() => setScale(s => Math.max(s - 0.5, 0.5))} className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg text-white transition-colors" title="Zoom Out"><Icons.ZoomOut className="w-4 h-4 md:w-5 md:h-5"/></button>
                    <button onClick={resetView} className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg text-white transition-colors" title="Reset View"><Icons.Scan className="w-4 h-4 md:w-5 md:h-5"/></button>
                </div>
                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
                    {originalImage ? (
                        <Button variant="glass" onClick={onEdit} className="!rounded-lg !py-1 !md:py-1.5 !px-2.5 !md:px-3 !text-[10px] md:!text-xs shadow-lg bg-black/50 hover:bg-black/70 flex items-center gap-1.5 md:gap-2">
                            <Icons.Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span>{t('editor')}</span>
                        </Button>
                    ) : null}
                </div>

                <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden p-1.5 md:p-2">
                    <div ref={containerRef} className={`flex-grow relative w-full flex items-center justify-center overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-900/50 rounded-[1.1rem] md:rounded-[1.3rem] ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`} onWheel={handleWheel} onMouseDown={handlePanStart} onTouchStart={handlePanStart} style={{ touchAction: 'none' }}>
                        <div style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transformOrigin: 'center', transition: (isPanning || isSliding) ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div ref={contentRef} className="relative shadow-2xl inline-block max-w-none max-h-none">
                                {!originalImage && !isCollageMode ? (
                                    <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-slate-900/80 border-2 border-dashed border-white/10 rounded-[1.5rem] md:rounded-[2rem] gap-4 md:gap-6 animate-in fade-in zoom-in-95">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-600/10 rounded-full flex items-center justify-center text-purple-400">
                                            <Icons.Upload className="w-8 h-8 md:w-10 md:h-10" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-xl md:text-2xl font-black text-white mb-1.5 md:mb-2">{t('demoTitle')}</h3>
                                            <p className="text-slate-400 text-xs md:text-sm max-w-[220px] md:max-w-xs">{t('demoSubtitle')}</p>
                                        </div>
                                        <Button onClick={onUploadNew} className="px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl text-sm">{t('demoButton')}</Button>
                                    </div>
                                ) : isCollageMode ? (
                                    <div className="w-[85vw] max-w-2xl aspect-square bg-white flex items-center justify-center rounded-lg overflow-hidden shadow-2xl">{renderCollage()}</div>
                                ) : isVideo ? (
                                    <div className="relative"><video src={generatedImage || ''} controls autoPlay loop playsInline className="max-h-[60vh] md:max-h-[65vh] w-auto object-contain pointer-events-auto rounded-lg" />{showWatermark && <DraggableWatermark position={watermarkPosition} onMove={onWatermarkMove} containerRef={contentRef} />}</div>
                                ) : (
                                    <>
                                        <div className="relative"><img src={originalImage} alt="Original" className="max-h-[65vh] md:max-h-[70vh] w-auto object-contain pointer-events-none block" draggable={false} /></div>
                                        {generatedImage && (
                                            <div className="absolute inset-0 h-full w-full" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
                                                <img src={generatedImage} alt="Generated" className="w-full h-full object-contain block pointer-events-none" draggable={false} />
                                                <div className="absolute inset-0 w-full h-full z-10">{renderTextOverlay()}</div>
                                            </div>
                                        )}
                                        {generatedImage && !isVideo && showWatermark && <DraggableWatermark position={watermarkPosition} onMove={onWatermarkMove} containerRef={contentRef} />}
                                        {generatedImage && !isVideo && (
                                            <div className="absolute top-0 bottom-0 z-30 flex items-center justify-center w-12 md:w-16 -translate-x-1/2 cursor-col-resize" style={{ left: `${sliderPos}%` }} onMouseDown={handleSliderStart} onTouchStart={handleSliderStart}>
                                                <div className="absolute top-0 bottom-0 w-1 bg-white/90 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-[2px]" />
                                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 md:border-[3px] border-white flex items-center justify-center text-purple-600 shadow-2xl transition-all duration-200 ${isSliding ? 'scale-110 bg-purple-50' : 'scale-100 bg-white hover:scale-105'}`}><Icons.Compare className="w-4 h-4 md:w-5 md:h-5" /></div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-3 md:p-4 flex justify-between items-center text-[10px] md:text-xs text-slate-400 bg-slate-900/30">
                    <div className="flex items-center gap-2">
                        {isCollageMode ? (
                            <><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span><span className="font-bold text-slate-300 hidden md:inline">{t('selectImages')}</span><span>{collageImages.length} {t('selectedImages')}</span></>
                        ) : isVideo ? (
                            <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="font-bold text-slate-300">Video Preview</span></>
                        ) : generatedImage ? (
                        <><span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span><span className="font-bold text-slate-300 hidden md:inline">{t('compareMode')}</span><span>{t('dragCursor')}</span></>
                        ) : (
                        <><span className="w-2 h-2 rounded-full bg-slate-500"></span><span>{t('viewOriginal')}</span></>
                        )}
                    </div>
                    {originalImage && (
                        <button onClick={onUploadNew} className="font-bold text-slate-300 hover:text-white cursor-pointer transition-colors flex items-center gap-2 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5">
                            <Icons.Upload className="w-3.5 h-3.5" />
                            <span className="text-[10px] md:text-xs">{t('replaceImage')}</span>
                        </button>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};