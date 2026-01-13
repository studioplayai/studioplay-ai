import { CampaignSettings, TextTransform, GeneratedItem } from "../types";

export const createCompositeImage = async (
  imageSrc: string,
  settings: CampaignSettings,
  showWatermark: boolean,
  watermarkPosition: { x: number; y: number }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject("Could not get canvas context");
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (settings.showText) {
          const { title, price, discount, textStyle, font, titleTransform, priceTransform, discountTransform } = settings;
          
          if (textStyle === 'modern') {
             const contentHeight = canvas.height * 0.4;
             const gradient = ctx.createLinearGradient(0, canvas.height - contentHeight, 0, canvas.height);
             gradient.addColorStop(0, 'rgba(0,0,0,0)');
             gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
             ctx.fillStyle = gradient;
             ctx.fillRect(0, canvas.height * 0.5, canvas.width, canvas.height * 0.5);
          } else if (textStyle === 'luxury-gold') {
             // Subtle central vignette for depth
             const radGrad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
             radGrad.addColorStop(0, 'rgba(0,0,0,0)');
             radGrad.addColorStop(1, 'rgba(0,0,0,0.25)');
             ctx.fillStyle = radGrad;
             ctx.fillRect(0,0,canvas.width,canvas.height);
          }

          const drawTextItem = (text: string, transform: TextTransform | undefined, type: 'title' | 'price' | 'discount') => {
              if (!transform) return;

              const x = (transform.x / 100) * canvas.width;
              const y = (transform.y / 100) * canvas.height;
              const scale = transform.scale || 1;
              const rotation = transform.rotation || 0;

              ctx.save();
              ctx.translate(x, y);
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.scale(scale, scale);
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              const baseSize = canvas.width / 20; 

              if (type === 'title') {
                  if (textStyle === 'luxury-gold') {
                      const goldGradient = ctx.createLinearGradient(-150, -25, 150, 25);
                      goldGradient.addColorStop(0, '#BF953F');
                      goldGradient.addColorStop(0.2, '#FCF6BA');
                      goldGradient.addColorStop(0.4, '#B38728');
                      goldGradient.addColorStop(0.6, '#FBF5B7');
                      goldGradient.addColorStop(1, '#AA771C');
                      ctx.fillStyle = goldGradient;
                      ctx.font = `900 ${baseSize * 1.8}px "David Libre", serif`;
                      ctx.shadowColor = 'rgba(0,0,0,0.6)';
                      ctx.shadowBlur = 15;
                      ctx.shadowOffsetY = 10;
                  } else {
                      ctx.font = `900 ${baseSize * 1.5}px "${font}", sans-serif`;
                      ctx.fillStyle = '#ffffff';
                      ctx.shadowColor = 'rgba(0,0,0,0.6)';
                      ctx.shadowBlur = 30;
                  }
                  ctx.fillText(text, 0, 0);

              } else if (type === 'price') {
                  if (textStyle === 'luxury-gold') {
                      ctx.font = `italic 500 ${baseSize * 0.9}px "David Libre", serif`;
                      ctx.fillStyle = '#FCF6BA';
                      ctx.shadowColor = 'rgba(0,0,0,0.4)';
                      ctx.shadowBlur = 8;
                  } else {
                      ctx.font = `900 ${baseSize}px "${font}", sans-serif`;
                      ctx.fillStyle = 'rgba(255,255,255,0.9)';
                  }
                  ctx.fillText(text, 0, 0);

              } else if (type === 'discount') {
                  if (textStyle === 'luxury-gold') {
                      ctx.strokeStyle = '#BF953F';
                      ctx.lineWidth = 3;
                      const textW = ctx.measureText(text).width + 60;
                      ctx.strokeRect(-textW/2, -35, textW, 70);
                      ctx.fillStyle = '#FCF6BA';
                      ctx.font = `bold ${baseSize * 0.75}px "Assistant", sans-serif`;
                  } else {
                      ctx.fillStyle = '#ef4444';
                      const textW = ctx.measureText(text).width + 40;
                      ctx.fillRect(-textW/2, -25, textW, 50);
                      ctx.fillStyle = 'white';
                      ctx.font = `bold ${baseSize * 0.8}px "${font}", sans-serif`;
                  }
                  ctx.fillText(text, 0, 0);
              }
              ctx.restore();
          };

          drawTextItem(title, titleTransform, 'title');
          drawTextItem(price, priceTransform, 'price');
          if (discount) drawTextItem(discount, discountTransform, 'discount');
        }

        if (showWatermark) {
            const fontSize = canvas.width * 0.02;
            ctx.font = `bold ${fontSize}px Heebo, sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            const watermarkX = canvas.width * (watermarkPosition.x / 100);
            const watermarkY = canvas.height * (watermarkPosition.y / 100);
            ctx.textAlign = watermarkPosition.x > 50 ? 'right' : 'left';
            ctx.textBaseline = watermarkPosition.y > 50 ? 'bottom' : 'top';
            ctx.fillText('StudioPlay AI', watermarkX, watermarkY);
        }

        resolve(canvas.toDataURL("image/png"));
      } catch (e) { reject(e); }
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};

export const generateCollageImage = async (images: GeneratedItem[], layoutId: string): Promise<string> => {
    const size = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas Error");
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size);
    const loadedImages = await Promise.all(
        images.map(item => new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image(); img.crossOrigin = "anonymous";
            img.onload = () => resolve(img); img.onerror = reject; img.src = item.url;
        }))
    );
    const drawImageCover = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
        const imgRatio = img.width / img.height;
        const targetRatio = w / h;
        let renderW, renderH, renderX, renderY;
        if (targetRatio > imgRatio) { renderW = w; renderH = w / imgRatio; renderX = 0; renderY = (h - renderH) / 2; } 
        else { renderH = h; renderW = h * imgRatio; renderY = 0; renderX = (w - renderW) / 2; }
        ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
        ctx.drawImage(img, x + renderX, y + renderY, renderW, renderH);
        ctx.restore();
    };
    if (layoutId === 'grid-2x2') {
        const w = size / 2; const h = size / 2;
        if(loadedImages[0]) drawImageCover(loadedImages[0], 0, 0, w, h);
        if(loadedImages[1]) drawImageCover(loadedImages[1], w, 0, w, h);
        if(loadedImages[2]) drawImageCover(loadedImages[2], 0, h, w, h);
        if(loadedImages[3]) drawImageCover(loadedImages[3], w, h, w, h);
    } else if (layoutId === 'split-v') {
        const w = size / 2; const h = size;
        if(loadedImages[0]) drawImageCover(loadedImages[0], 0, 0, w, h);
        if(loadedImages[1]) drawImageCover(loadedImages[1], w, 0, w, h);
    } else if (layoutId === 'split-h') {
        const w = size; const h = size / 2;
        if(loadedImages[0]) drawImageCover(loadedImages[0], 0, 0, w, h);
        if(loadedImages[1]) drawImageCover(loadedImages[1], 0, h, w, h);
    }
    return canvas.toDataURL('image/png');
};