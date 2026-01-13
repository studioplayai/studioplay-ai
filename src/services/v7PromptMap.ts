import { ToolMode } from "../types";

type PromptCtx = {
  customPrompt?: string;
  selectedOptionId?: string; // preset id (כמו clean_studio)
  style?: string;            // אם יש סטייל גלובלי
};

export function getV7Prompt(mode: ToolMode, ctx: PromptCtx): string | null {
  switch (mode) {
    case ToolMode.SOCIAL_POST: {
      return [
        ctx.customPrompt?.trim() ? `User context: ${ctx.customPrompt.trim()}` : "",
        "Act as a professional studio retoucher and lighting expert.",
        "Enhance the provided image into a high-end commercial asset.",
        "Composition: Do NOT crop or move the subject. Keep framing identical.",
        "Lighting: Apply premium studio lighting (soft shadows, rim light, depth).",
        "Colors: Grade the colors to look expensive, vibrant yet realistic.",
        "Vibe: Professional, clean, and ready for a premium social feed.",
        "Strict Rule: No text, no logos, no watermarks inside the image.",
        "Output: Only the enhanced image.",
      ].filter(Boolean).join("\n");
    }

    case ToolMode.BACKGROUND_REMOVE: {
      const styleInstructions: Record<string, string> = {
        clean_studio: "Remove the background and place the subject in a clean professional studio background. Keep lighting premium.",
        transparent_png: "Remove the background completely and output a clean transparent PNG (subject only).",
        water_reflect: "Remove background and place subject on a calm reflective surface with subtle reflection. Keep it realistic and premium.",
        black_mirror: "Remove background and place subject on a polished black mirror surface with realistic reflection and studio lighting.",
        soft_shadow: "Remove background and place subject on a clean neutral surface with a soft realistic shadow under the subject.",
        hard_shadow: "Remove background and place subject on a clean neutral surface with a sharper realistic shadow under the subject.",
        glass_reflect: "Remove background and place subject on thick frosted/clear glass with subtle reflection and premium lighting.",
        neutral_gray: "Remove background and place subject on a neutral catalog gray background with clean studio lighting.",
        white_outline: "Remove background and create a clean sticker-style cutout with a consistent white outline around the subject.",
      };

      const specific =
        styleInstructions[ctx.selectedOptionId || ""] ||
        "Remove the background cleanly. Keep edges crisp. Preserve fine details.";

      return [
        "Act as a professional high-end retoucher for product and social images.",
        specific,
        "Keep the subject intact. Do NOT distort the subject.",
        "Edges must be clean and accurate (hair/fur details preserved).",
        "No text, no logos, no watermarks.",
        "Output: only the final image.",
      ].filter(Boolean).join("\n");
    }

    case ToolMode.BACKGROUND_BLEND: {
  const envInstructions: Record<string, string> = {
    water_ripple: "Place the subject on a crystal-clear, deep blue water surface. Generate realistic circular ripples and reflections.",
    golden_beach: "Set the subject on fine, warm golden sand at sunset. Apply a soft, warm back light and subtle shadows.",
    wooden_pier: "Place the subject on aged, textured oak planks of a rustic pier. Integrate with realistic shadows and perspective.",
    blue_sky: "Levitate the subject in a vast, ethereal blue sky filled with soft, hyper-realistic white clouds.",
    rainforest: "Nestle the subject within lush, damp tropical foliage. Add soft god rays and atmospheric depth.",
    desert: "Place the subject on orange sand dunes under a scorching midday sun. Apply high-contrast lighting and heat haze.",
    marble: "Place the subject on a polished white Carrara marble slab. Create a crisp, mirror-like reflection and premium lighting.",
    travertine: "Set the subject on a warm, matte travertine stone surface. Integrate with soft, multi-directional lighting.",
    terrazzo: "Place on a trendy, colorful terrazzo floor. Use vibrant, pop lighting with clean realistic shadows.",
    oak_wood: "Place the subject on a warm, natural oak tabletop. Add a realistic coffee-shop atmosphere blur.",
    concrete: "Set the subject in a minimalist, brutalist concrete environment. Apply harsh architectural shadows and depth.",
    silk_satin: "Elegantly drape the subject within flowing, luxurious liquid-silk fabric. Keep it premium and realistic.",
    velvet: "Place the subject on a deep royal velvet cushion with soft folds and realistic shadows.",
    window_light: "Place the subject near a window-lit surface with realistic gobo-style shadows.",
    bokeh: "Place the subject on a dark neutral surface with cinematic city-light bokeh in the background.",
    gobo: "Integrate the subject into a scene with artistic gobo light projections across the environment."
  };

  const specific =
    envInstructions[ctx.selectedOptionId || ""] ||
    "Blend the subject into a realistic environment with correct scale, lighting, shadows, and reflections.";

  return [
    ctx.customPrompt?.trim() ? `User context: ${ctx.customPrompt.trim()}` : "",
    "Act as a professional photo compositor and environment integration expert.",
    "Seamlessly blend the subject into the target environment while preserving identity and proportions.",
    specific,
    "Match lighting direction, color temperature, shadow softness, and perspective.",
    "Preserve fine details such as hair and edges with natural transitions.",
    "No text, no logos, no watermarks.",
    "Output: only the final blended image."
  ].filter(Boolean).join("\n");
}
case ToolMode.GENERATE_ANGLES: {
  const angleInstructions: Record<string, string> = {
    angle_grid:
      "Create a sophisticated 4-panel commercial contact sheet. Each panel shows the subject from a different professional camera angle. Keep consistent identity and product geometry across all panels.",
    flat_lay:
      "Act as a flat-lay stylist. Re-image the subject from a precise 90-degree perpendicular top-down view. Keep lighting premium and clean.",
    hero_shot:
      "Generate a definitive 'Hero' image. Use an 85mm prime lens perspective for zero distortion. Apply premium studio lighting and high-end commercial styling.",
    macro:
      "Act as a Macro Photography specialist. Use a 100mm Macro lens perspective. Focus on extreme precision and texture detail while preserving the subject identity.",
    side_profile:
      "Capture a precise, architectural side profile. Focus on the silhouette and industrial design lines. Keep perspective realistic and clean.",
  };

  const specificAngle =
    angleInstructions[ctx.selectedOptionId || ""] ||
    "Generate the subject from a professional alternative camera angle with consistent identity and geometry.";

  return [
    "You are a World-Class Commercial Photographer and Creative Director.",
    `CAMERA DIRECTION: ${specificAngle}`,
    "",
    "STRICT SUBJECT LOCK (MANDATORY):",
    "- The subject's identity, brand marks, and geometry MUST remain 100% identical.",
    "- DO NOT deform, warp, or change the proportions of the subject.",
    "- Apply the requested angle shift realistically as if the camera physically moved around the object.",
    "",
    "CREATIVE QUALITY:",
    "- Ensure the final result looks like a 'scroll-stopping' professional social media asset.",
    "- If a STYLE hint is provided in the prompt, adapt the lighting and background of the new angle to match it.",
    "- Output: HIGH-QUALITY IMAGE only. No text, no logos, no watermarks.",
    "",
    ctx.customPrompt?.trim()
      ? `ADDITIONAL CREATIVE DIRECTION: ${ctx.customPrompt.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
case ToolMode.CAMPAIGN_SHOT: {
  const campaignInstructions: Record<string, string> = {
    deep_ocean: "Submerge the subject in a hyper-realistic deep ocean abyss. Rays of caustic light (sunlight filtering through water) should dance across the surface. Tiny bubbles and subtle particles.",
    infinity_pool: "Place the subject on the edge of a luxurious infinity pool at a cliffside resort. The background features a blurred, vast azure Mediterranean ocean. Crisp, high-end travel ad vibe.",
    cloudscape: "Ethereal, surreal campaign. The subject floats amongst soft, golden-hour cumulus clouds. Use ultra-diffused morning light. Dreamy/heavenly luxury vibe.",
    tropical_beach: "Set the subject on white Maldivian sand. Blurred palm fronds in the foreground create depth. Exotic, vibrant island lighting with clear turquoise water in the far distance.",
    stormy_sea: "Brutal and powerful. The subject stands on a dark basalt rock while giant foaming waves crash behind it under a dramatic storm sky. Moody, cold lighting.",
    mirror_lake: "Perfect symmetry. The subject sits on a mirror-like alpine lake surface. Snow-capped mountains reflect perfectly. Ethereal, crisp morning atmosphere.",
    sunset_horizon: "The subject is backlit by a massive burning orange sun setting on the horizon. Create a cinematic silhouette effect with warm rim light defining edges.",
    rainforest: "Buried in lush, damp Amazonian jungle. Deep emerald greens. God rays through canopy. Subtle mist. Moisture droplets for extreme realism.",
    luxury: "Ultimate expensive look. Place the subject on a bed of dark diamonds/crushed crystals. Use Hollywood high-key lighting with sharp pinpoint specular highlights.",
    silk: "Nestled in heavy, liquid-gold silk fabric folds. The material should wrap around realistically. Soft poetic lighting emphasizing fabric-skin interplay.",
    marble: "Classic gallery look. Place on a thick block of white Carrara marble. Background is a minimalist dark museum hall. Architectural lighting emphasizing form.",
    dark_slate: "Modern and industrial. Subject sits on raw wet dark slate rock. Cold moody side-light. Very textural and masculine.",
    royal_velvet: "Placed on deep burgundy velvet. Soft focused spotlight with heavy falloff. Heritage and prestige vibe.",
    monochrome: "High-fashion black and white. Use intense contrast (chiaroscuro). The subject's form is defined by light/shadow alone.",
    architectural_shadows: "Set in a sun-drenched brutalist concrete building. Large geometric shadows from pillars/windows cast across the scene. Sophisticated lighting.",
    mirror_reflect: "Subject stands between two giant mirrors creating a recursive infinite reflection. Complex lighting to avoid glare while keeping reflections crisp.",
    broken_mirrors: "Surreal and edgy. Surround with large shards of broken mirrors on a dark floor. Each shard reflects a different part.",
    exploded_view: "Deconstruct the environment: elements like flowers/water drops/materials frozen mid-air explosion around the subject. Keep subject intact.",
    water_splash: "A massive artistic frozen time water splash surrounds the subject. High-speed photography aesthetic with crystal-clear droplets and caustic reflections.",
    levitation: "Subject floats in a minimal pedestal scene. Small decorative elements (gold dust/petals) float, defying gravity. Magic + innovation vibe.",
    podium_minimal: "A simple matte-black cylinder podium. Background is a clean warm-gray gradient. High-end tech product launch style.",
    tech_future: "Cyberpunk laboratory: blue holographic interfaces and neon fiber-optic cables. Moody dark lighting with cyan/magenta accents.",
    concrete: "Brutalist raw. Empty concrete hall with a single dramatic skylight hitting the subject. Architectural and bold.",
    neon_city: "Midnight in Tokyo. Subject on a wet asphalt street. Vibrant neon signs in blurred background cast colorful light spills.",
    shattered_glass: "Edgy fashion. Subject behind a glass pane that is dramatically shattering. Shards flying toward camera. Intense energy.",
    screen_break: "Subject appears stepping out of a digital screen/smartphone. Mix of Digital + Real textures.",
    melting_glass: "Surrealism: environment of melting liquid glass shapes. Rainbow dispersions and prismatic effects in lighting.",
    strong_stained_glass: "Ancient cathedral-style setting. Complex stained-glass window casts colorful intricate patterns over the subject.",
  };

  const specificCampaign =
    campaignInstructions[ctx.selectedOptionId || ""] ||
    "Place the subject in a high-end, imaginative marketing campaign environment. Focus on 'scroll-stopping' professional visual storytelling.";

  return [
    "Act as a World-Class Creative Director and Commercial Photographer.",
    `CAMPAIGN CONCEPT: ${specificCampaign}`,
    "",
    "MANDATORY REQUIREMENTS:",
    "- SUBJECT LOCK: The main subject's identity, proportions, brand marks, and geometry must remain 100% AUTHENTIC and identical.",
    "- INTEGRATION: The subject must interact with the new environment's lighting, reflections, and shadows in a hyper-realistic way.",
    "- RESOLUTION: Ensure textures are crisp, lighting is 8K studio quality, and the result is ready for a premium brand feed.",
    "- CLEANLINESS: Absolutely no text, no watermarks, no distorted artifacts. Output IMAGE only.",
    "",
    ctx.customPrompt?.trim()
      ? `ADDITIONAL CREATIVE DIRECTION: ${ctx.customPrompt.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

case ToolMode.ARTISTIC_STYLE: {
  const styleInstructions: Record<string, string> = {
    blueprint: "Translate the subject into a professional technical drafting blueprint. Use a deep cyanotype blue background with crisp white grid lines and architectural drafting notation. The subject should be rendered in precise white line-art with subtle technical callouts and measurements.",
    clay3d: "Transform the subject into a hyper-realistic 'claymorphism' 3D model. Apply soft, matte surfaces with high-quality global illumination. Use playful, slightly rounded proportions and a clean, pastel studio backdrop. The vibe is a premium tech-toy or modern app illustration.",
    double_exposure: "Create a poetic double exposure. Merge the subject's silhouette with a stunning natural landscape (like a dense pine forest or a starry night sky). Ensure the original subject's form remains recognizable through the textures and elements of the second image. Ethereal and artistic.",
    oil_painting: "Re-imagine the subject as a classic 17th-century oil painting. Apply heavy, visible impasto brushstrokes and a rich, warm color palette. Use Chiaroscuro lighting (intense light/dark contrast) to create drama and depth. The texture should feel like authentic aging canvas.",
    cyberpunk_neon: "Infuse the subject with a futuristic Cyberpunk neon aesthetic. Apply vibrant magenta, cyan, and electric blue rim-lighting. Add subtle digital glitch artifacts and holographic light spills. The background should be a blurred, rain-slicked midnight Tokyo street.",
    pencil_sketch: "Render the subject as a master-class graphite pencil sketch on textured off-white paper. Use expert cross-hatching and shading to create depth. Maintain razor-sharp focus on the subject's core lines while allowing the edges to blend artistically into the paper grain.",
    anime_manga: "Redraw the subject in a high-end 90s retro Anime or modern Studio Ghibli style. Use clean, bold line-art with cel-shaded lighting. The colors should be vibrant but harmonious, with an atmospheric, painted-background feel.",
    pop_art: "Transform into a bold Andy Warhol-style Pop Art piece. Use a 4-panel grid of high-contrast, non-realistic neon colors (Yellow, Hot Pink, Electric Blue). Apply a subtle Ben-Day dot halftone texture to the shadows for a vintage comic effect.",
    low_poly: "Reconstruct the subject using a sophisticated low-poly geometric 3D aesthetic. Each polygon should be distinct but contribute to a smooth overall form. Use elegant faceted lighting that highlights the subject's geometric structure. Modern and minimalist.",
    watercolor: "Translate the subject into a delicate, loose watercolor painting. Use soft, bleeding edges and realistic 'wet-on-wet' paint textures. Add subtle paper texture and occasional artistic paint splatters. The palette should be airy and sophisticated.",
    vaporwave: "Apply a nostalgic 80s Vaporwave aesthetic. Use a palette of soft lavender, teal, and bubblegum pink. Integrate the subject with lo-fi glitch effects, low-poly sunset grids, and Roman-bust-style marble textures in the background.",
    halftone: "Create a striking Risograph or vintage newspaper halftone effect. Use a limited palette (like Black and Red) with a coarse dot pattern that defines the subject's shading and form. Very trendy, high-fashion editorial look.",
    paper_cutout: "Rebuild the subject as a multi-layered paper-cut illustration. Each part of the subject should appear as a separate piece of heavy, textured cardstock with physical depth and realistic drop shadows between the layers.",
    patent_sketch: "Transform into a 19th-century US Patent Office technical drawing. Use aged, yellowed parchment paper and precise black ink lines. Include technical annotations, figure numbers (e.g., FIG. 1), and formal drafting signatures.",
    liquid_metal: "Convert the subject into molten, mirror-finished liquid chrome. The surface should be highly reflective, showing distorted reflections of a dark, high-contrast environment. The form should feel fluid and mercury-like.",
    holographic: "Render the subject as a high-tech, iridescent holographic projection. Use rainbow-sheen caustic reflections and glowing digital scanning lines. The subject should appear slightly translucent and shimmering.",
    stone_sculpt: "Carve the subject out of a single block of raw, white Carrara marble. Maintain every detail of the original subject but with the texture and weight of polished stone. Add subtle cracks and realistic chisel marks for authenticity.",
    fashion_illust: "Translate into a high-end fashion editorial illustration. Use elongated, elegant lines and a mix of loose markers and fine-liner ink. Focus on the silhouette and 'vibe' while keeping the subject's identity recognizable and premium.",
    textile_art: "Transform the subject into a detailed piece of embroidery or woven tapestry. Render the textures using thousands of individual colored threads with realistic stitch patterns and subtle fabric ripples. Warm and handcrafted.",
    magazine_collage: "Create a punk-zine inspired magazine collage. The subject should appear hand-cut with rough white paper edges. Mix with textures of newsprint, duct tape, and vibrant spray-paint accents. High-energy and edgy.",
    xray: "Apply a futuristic X-ray or thermal vision effect. Use a deep navy or black background with the subject's internal structure or heat-map silhouette glowing in bright cyan or neon orange. Technical and cool.",
  };

  const specificStyle =
    styleInstructions[ctx.selectedOptionId || ""] ||
    "Transform the subject into a professional, creative piece of art. Focus on sophisticated visual storytelling and aesthetic appeal.";

  return [
    "Act as a World-Class Creative Director and Multi-Disciplinary Artist.",
    `ARTISTIC MISSION: ${specificStyle}`,
    "",
    "CORE CONSTRAINTS (MANDATORY):",
    "- SUBJECT LOCK: The main subject's identity, core shape, and recognizable features MUST remain intact.",
    "- ARTISTIC INTEGRITY: Do not just apply a 'filter'. Re-imagine the subject through the lens of the chosen artistic medium.",
    "- COMPOSITION: Keep the original camera angle and framing. The subject remains the visual hero.",
    "- CLEANLINESS: No text, no watermarks, no distorted artifacts. Output IMAGE only.",
    "",
    ctx.customPrompt?.trim() ? `USER SPECIFIC DIRECTION: ${ctx.customPrompt.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
case ToolMode.MOOD_BOARD: {
  const moodInstructions: Record<string, string> = {
    minimal_zen:
      "Create a minimalist Zen brand mood board. Place the product as the large central hero. Surround with smaller artistic tiles: 1. A smooth beach stone texture, 2. A sprig of dried eucalyptus, 3. A macro shot of neutral linen fabric. Include a row of 5 circular hex color swatches in tones of Sage, Sand, Cream, Slate, and White. Lighting is soft, natural, and morning-bright.",
    vibrant_street:
      "Generate a high-energy urban street mood board. The product is featured in a 'cut-out' collage style. Surrounding elements: 1. A blurred neon Tokyo night scene, 2. A texture of wet asphalt, 3. A snippet of bold typography. Color swatches: Electric Blue, Hot Pink, Cyber Green, Deep Black. Lighting is high-contrast with colorful rim lights.",
    luxury_editorial:
      "Act as a creative director for a luxury magazine. Build a 'quiet luxury' mood board. Product is centered on a marble podium. Surrounding tiles: 1. Gold leaf texture, 2. Macro shot of fine jewelry detail, 3. A blurred view of a Parisian hotel balcony. Color swatches: Champagne Gold, Charcoal, Pearl, Midnight Navy. Lighting is dramatic and expensive.",
    nature_organic:
      "Create an earthy, organic brand board. Product is nestled in moss and wood. Tiles: 1. Sunlight filtering through leaves, 2. Raw clay texture, 3. Macro of water droplets on a leaf. Color swatches: Forest Green, Terracotta, Ochre, Mud Brown, Pale Sky. Vibe is sustainable and grounding.",
    cyber_tech:
      "Build a futuristic Cyber-Tech mood board. Product appears integrated with digital circuits. Tiles: 1. Blue fiber optic glow, 2. Brushed titanium texture, 3. Abstract digital data stream. Color swatches: Neon Cyan, Matrix Green, Darkest Steel, White. High-tech and innovative aesthetic.",
    vintage_film:
      "Generate a nostalgic 70s film-photography mood board. Product has a warm, grainy texture. Tiles: 1. A sunset over a desert road, 2. Aged leather texture, 3. A blurred retro diner sign. Color swatches: Burnt Orange, Mustard, Avocado Green, Sepia. Vibe is warm, fuzzy, and classic.",
    boho_chic:
      "Create a dreamy Boho-Chic mood board. Product is surrounded by pampas grass. Tiles: 1. Macramé texture, 2. A sun-drenched wicker chair, 3. Macro of raw cotton. Color swatches: Dusty Rose, Warm Beige, Peach, Off-White. Vibe is airy, feminine, and soft.",
    scandinavian:
      "Build a clean Scandinavian design mood board. Product is on a light oak surface. Tiles: 1. Geometric architectural lines, 2. A macro of a wool knit, 3. A single minimalist glass vase. Color swatches: Ice Blue, Light Gray, Natural Oak, Charcoal. Vibe is functional, clean, and bright.",
  };

  const specificMood =
    moodInstructions[ctx.selectedOptionId || ""] ||
    "Build a professional, artistic mood board collage around the main subject. Include color swatches, textures, and lifestyle elements that match its style.";

  return [
    "You are a world-class Brand Identity Designer and Creative Strategist.",
    `MISSION: ${specificMood}`,
    "",
    "LAYOUT & COMPOSITION:",
    "- Create a single 4K image that looks like a curated Brand Mood Board collage.",
    "- The MAIN PRODUCT must be the dominant central focus.",
    "- Include small aesthetic tiles for textures, lifestyle vibes, and color palettes.",
    "- Add professional Hex color swatch circles or squares integrated into the design.",
    "",
    "STRICT SUBJECT LOCK:",
    "- The original product identity and shape must remain 100% accurate.",
    "- Do NOT distort or change the product itself.",
    "",
    "TECHNICAL QUALITY:",
    "- Output: One high-end, professionally designed COLLAGE image.",
    "- Vibe: Scroll-stopping, high-retention, aesthetically perfect for social media.",
    "- No text, no watermarks, no logos in the generated tiles.",
    "",
    ctx.customPrompt?.trim()
      ? `ADDITIONAL CREATIVE DIRECTION: ${ctx.customPrompt.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
case ToolMode.MOOD_CREATOR: {
  const moodInstructions: Record<string, string> = {
    cozy_home:
      "Infuse the subject into a warm, inviting high-end home environment. Apply soft, warm 'Golden Hour' sunlight streaming through a nearby window. Surround with textures like soft wool, aged wood, and organic linen. The lighting should emphasize comfort and domestic luxury, with soft, long shadows.",
    minimal_studio:
      "Place the subject in an ultra-clean, minimalist professional studio. Use high-end 'Butterfly' lighting to create crisp highlights and very soft, expensive-looking contact shadows. The background should be a perfect neutral off-white or light gray with a subtle gradient to emphasize depth.",
    urban_cafe:
      "Integrate the subject into a trendy, high-end urban coffee shop atmosphere. The lighting should be a mix of warm indoor pendant lights and cool daylight from the street. The background should be a creamy 'Bokeh' blur of brick walls, green plants, and industrial-chic furniture.",
    nature:
      "Nestle the subject within a lush, organic natural setting. Use dappled sunlight filtering through vibrant green leaves to create dynamic light patterns on the subject's surface. Add realistic moisture/dew effects and surround with organic textures like moss, stone, and earth.",
    luxury_marble:
      "Set the subject on a thick slab of polished white Carrara marble. Create sharp, premium studio lighting with intentional specular reflections on the marble surface. The background should be a clean, dark gallery wall. This is a definitive 'High-Jewelry' or 'Premium Tech' production look.",
    beach_vibe:
      "Apply an effortless, high-end coastal lifestyle mood. Use the intense, warm light of a low sunset (rim lighting). Surround with textures of warm golden sand and a blurred background of clear turquoise ocean water. The feeling is vibrant, vacation-ready, and premium.",
  };

  const specificMood =
    moodInstructions[ctx.selectedOptionId || ""] ||
    "Enhance the subject's atmosphere and lighting to create a compelling, professional creative story. Focus on hyper-realistic integration and mood.";

  return [
    "Act as a World-Class Director of Photography and Creative Director.",
    `ATMOSPHERIC MISSION: ${specificMood}`,
    "",
    "TECHNICAL PRODUCTION STANDARDS (MANDATORY):",
    "- SUBJECT LOCK: The main subject's identity, proportions, and brand marks MUST remain 100% AUTHENTIC.",
    "- COLOR GRADING: Apply cinematic color grading that enhances the chosen mood without looking fake.",
    "- LIGHT INTEGRATION: Environment light MUST wrap around the subject realistically. Match the light source direction perfectly.",
    "- TEXTURE MAPPING: Ensure the subject's surface finish (matte, gloss, metallic) reacts correctly to the new environment.",
    "- DEPTH OF FIELD: Use a professional shallow depth of field (f/1.8 or f/2.8) to make the subject the visual hero.",
    "- CLEANLINESS: No text, no watermarks, no distorted artifacts. Output HIGH-QUALITY IMAGE only.",
    "",
    ctx.customPrompt?.trim()
      ? `USER SPECIFIC ATMOSPHERIC REQUEST: ${ctx.customPrompt.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
case ToolMode.AI_EMOTION_PAINTER: {
  const emotionInstructions: Record<string, string> = {
    joy: "Infuse the image with pure, vibrant joy. Apply a warm 'golden hour' color grade. Add hyper-realistic sun-rays (God rays) filtering through the scene. The colors should be saturated and high-key. Small particles of golden dust or subtle floral elements can dance in the air. The lighting should feel like a perfect summer morning.",
    peace: "Apply a serene, minimalist peace. Use a palette of soft pastels, desaturated teals, and cream whites. Add a gentle morning mist or a soft-focus haze. The lighting should be extremely diffused and omnidirectional, removing harsh shadows. The environment should feel quiet, vast, and harmonious.",
    drama: "Generate an intense, cinematic drama. Use 'Chiaroscuro' lighting with deep, rich shadows and a single powerful light source. The color grade should be high-contrast with deep reds or cold blues. Add a dramatic, moody sky in the background (like a storm approaching) and sharp highlights that define the subject's form like a movie poster.",
    mystery: "Create a mysterious, noir-style atmosphere. Use deep indigo and violet tones. Add a layer of low-hanging fog and subtle, glowing particles (fireflies or digital bokeh). The subject should be partially obscured by artistic shadows or a misty silhouette. The vibe is 'magical realism' or 'midnight secret'.",
    energy: "Infuse the scene with high-octane energy. Use vibrant neon light trails (cyan, magenta, yellow) that appear to zip around the subject. The colors should be electric and high-saturation. Add a subtle 'motion blur' effect to the background and sharp 'action' lighting that makes the subject look dynamic and unstoppable.",
    passion: "Paint with intense passion. Use a rich palette of deep crimson, burnt orange, and warm gold. Apply a romantic, soft-focus 'bokeh' to the background. The lighting should be intimate and warm, emphasizing textures like velvet or silk if applicable. The feeling should be bold, seductive, and high-end fashion editorial.",
    dreamy: "Transform into an ethereal, surreal dreamscape. Use a 'Bloom' effect that makes highlights glow softly. Integrate elements of double exposure (like the subject merging with a soft nebula or a field of clouds). The palette should be iridescent and shifting. The vibe is 'otherworldly' and poetic.",
    calm_minimal: "Apply a sophisticated, calm minimalism. Desaturate the colors to a 'quiet luxury' palette of grays, beiges, and soft whites. Use clean lines and plenty of negative space. The lighting is soft and flat, emphasizing the subject's pure geometry and material quality without any visual noise.",
  };

  const specificEmotion =
    emotionInstructions[ctx.selectedOptionId || ""] ||
    "Re-imagine the subject through a professional artistic lens, focusing on high-end color grading and atmospheric lighting to evoke a specific creative mood.";

  return [
    "Act as a World-Class Colorist and Creative Director.",
    `ARTISTIC EMOTION: ${specificEmotion}`,
    "",
    "PROFESSIONAL CONSTRAINTS (MANDATORY):",
    "- SUBJECT LOCK: The main subject's identity, brand marks, and geometry MUST remain 100% AUTHENTIC.",
    "- COLOR THEORY: Apply advanced color grading that matches professional social media aesthetics (Instagram/Pinterest high-tier).",
    "- LIGHTING: Re-light the scene realistically to match the emotion. Use volume, depth, and shadow to tell the story.",
    "- NO ARTIFACTS: Do not warp the subject. No text, no watermarks, no distorted faces or fingers.",
    "- Output: One HIGH-QUALITY, 'SCROLL-STOPPING' IMAGE only.",
    "",
    ctx.customPrompt?.trim()
      ? `USER SPECIFIC ARTISTIC DIRECTION: ${ctx.customPrompt.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
case ToolMode.MOCKUP_GENERATOR: {
  const mockupInstructions: Record<string, string> = {
    real_estate_staging:
      "Place the product into a multi-million dollar minimalist penthouse living room. Use high-end architectural lighting. The environment features floor-to-ceiling windows with a sunset city view. Ensure hyper-realistic reflections on the product from the room's lighting.",
    real_estate_exterior_night:
      "Integrate the subject into a luxury modern villa's exterior at twilight. Use warm landscape lighting, a glowing infinity pool, and a starry sky. The product should be positioned as a hero element in this prestigious setting.",
    real_estate_modern_kitchen:
      "Place the subject on a thick, backlit quartz kitchen island in a gourmet kitchen. Surround with minimalist designer appliances and a blurred background of a sun-drenched breakfast nook.",
    real_estate_luxury_pool:
      "Set the subject on a sun-lounger or marble edge of a stunning resort infinity pool. The background is a crystal-clear turquoise Mediterranean sea. Bright, high-contrast coastal morning lighting.",
    real_estate_garden_fire:
      "Integrate into a high-end outdoor patio setting at night. The subject is lit by the warm, flickering glow of a modern fire-pit. Surround with luxury outdoor furniture and dark greenery.",
    real_estate_office_glass:
      "Place inside an executive corner office with glass walls. Reflections of the office's cool LED lighting and the city skyline should appear on the subject's surface. Vibe: Power and Tech.",
    fashion_studio:
      "The product is styled on a professional fashion model in a clean, high-key photo studio. Use 'Butterfly' lighting. The model's skin and clothing must look 100% natural, with the product perfectly integrated into their pose.",
    fashion_street:
      "Place the subject on a fashion model walking through a trendy district in New York or Paris. Use natural street light, with a creamy 'bokeh' of the urban background. High-energy lifestyle feel.",
    mannequin:
      "Style the product on a high-end, matte-finish invisible 'ghost' mannequin in a designer boutique setting. Focus on the drape and fit, with professional retail lighting.",
    flat_lay:
      "Create a masterfully arranged flat-lay on a neutral, textured linen surface. Surround with aesthetic props like a sprig of eucalyptus, a designer magazine, and soft morning shadows from a window.",
    shirt_print:
      "Map the subject as a high-quality print onto a premium heavy-cotton t-shirt. The texture of the fabric must be visible through the design, following the folds and shadows of the shirt realistically.",
    folded_shirt:
      "The product appears as a neat, professionally folded garment on a boutique wooden shelf. Focus on fabric texture and the precision of the fold.",
    hanger:
      "The product hangs on a minimalist wooden hanger against a clean, off-white plaster wall. Soft side-lighting to emphasize the silhouette and material.",
    label_closeup:
      "A macro, cinematic closeup of the product's label or branding. Focus on the stitching, material grain, and the tactile quality of the piece.",
    jewelry_on_model:
      "The jewelry piece is worn by a professional model. Focus on the neckline or wrist. Skin must have realistic pores and texture. Lighting is high-fashion editorial (Chiaroscuro).",
    hand_manicure:
      "The product is held in or worn on a hand with a perfect, clean manicure. The background is a soft-focus high-end beauty salon or boutique.",
    velvet_display:
      "Place the subject on a deep charcoal royal velvet jewelry bust. Intense spotlighting to create brilliant specular highlights and deep, rich shadows.",
    luxury_box:
      "The product is nestling inside a premium, open silk-lined gift box. One edge of the box is slightly out of focus in the foreground to create depth.",
    silk_surface:
      "Set the subject on flowing, heavy-weight mulberry silk fabric. The fabric should wrap and ripple around the product's base realistically. Soft, poetic lighting.",
    grand_piano:
      "Place on the polished black lacquer surface of a Steinway grand piano. Create a crisp, vertical reflection in the piano's finish. Moody, dark studio lighting.",
    sea_pearl:
      "Nestle the subject inside a large, iridescent mother-of-pearl shell on a bed of wet, black volcanic sand. Magical, ethereal lighting with tiny water droplets.",
    marble_statue:
      "Place the subject at the base of, or held by, a classical white marble statue in a minimalist museum gallery. Sharp, architectural lighting.",
    floral:
      "Weave the product into a lush, dense arrangement of exotic fresh flowers. Dappled sunlight should filter through the petals onto the product's surface.",
    vintage_book:
      "Set the subject on a stack of thick, aged leather-bound books. The background is a warm, blurred private library with a glowing desk lamp.",
    bubbles:
      "The subject floats weightlessly inside a cluster of large, hyper-realistic translucent soap bubbles or crystal spheres. Iridescent rainbow reflections.",
    lifestyle_wine:
      "Place the product on a rustic oak table next to a glass of premium red wine and a piece of artisanal cheese. Blurred vineyard sunset background.",
    basalt_rock:
      "Set on a raw, wet basalt rock in a misty Icelandic landscape. Cold, blue-ish cinematic lighting with high texture detail.",
    rustic_branch:
      "The subject hangs from a weathered, mossy tree branch in a deep forest. Soft, foggy morning light with God-rays filtering through the canopy.",
    food_presentation:
      "The product is part of a high-end Michelin-star chef's presentation. Place on a handmade ceramic plate with artistic smears of sauce and micro-greens. Warm, focused table lighting.",
    restaurant_table:
      "Place on a white-linen covered table in a fine-dining restaurant. Blurred background of other diners and candlelight.",
    takeaway:
      "The product is integrated into a trendy, high-end branded takeaway packaging set on a clean urban park bench. Natural daylight.",
    menu_open:
      "Place the subject directly on an open, high-quality leather-bound menu. The text of the menu is blurred, focusing entirely on the product hero.",
    food_flatlay:
      "A high-energy food flat-lay on a dark slate surface. Surround with fresh ingredients (herbs, spices, raw elements) that match the product's story.",
    professional_kitchen:
      "The product sits on a stainless steel prep table in a busy, high-end professional kitchen. Blurred chefs in the background add a sense of action.",
    luxury_tray:
      "Place on a polished silver or gold serving tray held by a gloved hand. Vibe: 5-star hotel room service.",
    packaging_box:
      "The subject is integrated into a professional product packaging mockup. Place in a minimalist white studio with clean, commercial lighting.",
    shopping_bag:
      "The product appears to be inside a high-end boutique shopping bag with rope handles. The bag is sitting on a polished boutique floor.",
    display_shelf:
      "Place the subject on a glass and metal display shelf in a futuristic tech flagship store. Cool blue and white LED lighting.",
    billboard:
      "Map the subject onto a massive outdoor billboard in Times Square at night. Realistic perspective and light-bleed from the surrounding neon signs.",
    held_hand:
      "The subject is being held naturally in a person's hand. The hand should look realistic and be interacting with the product's shape.",
    showcase:
      "The product is seen through the glass of a high-end jewelry or tech storefront window. Include subtle reflections of the street on the glass.",
    screen_break:
      "The subject appears to be physically breaking out of a high-end smartphone screen. Shards of glass and digital particles float around the point of exit.",
    floating_clouds:
      "A surreal mockup. The subject floats among soft, pink-tinted cumulus clouds at sunrise. Ethereal, dreamlike lighting.",
    water_splash:
      "Capture the subject at the moment of a high-speed water splash. Crystal clear droplets and frozen motion. Caustic light reflections.",
    underwater:
      "The subject is submerged in clear turquoise water. Sunbeams dance through the surface. Tiny bubbles and a sense of weightlessness.",
    beach_rock:
      "Place on a sun-drenched rock at a private beach. Blurred waves in the background. High-saturation, vibrant summer lighting.",
    ice_cubes:
      "The subject is trapped inside a large, clear block of ice. Intricate internal cracks and frozen bubbles. Cold, crisp lighting.",
  };

  const specificMockup =
    mockupInstructions[ctx.selectedOptionId || ""] ||
    "Place the subject into a professional, realistic mockup environment. Focus on hyper-realistic integration, lighting, and texture mapping.";

  return [
    "Act as a World-Class Mockup Artist and Commercial Photographer.",
    `MOCKUP MISSION: ${specificMockup}`,
    "",
    "PRODUCTION QUALITY (MANDATORY):",
    "- SUBJECT LOCK: The main subject's identity, proportions, and brand marks MUST remain 100% AUTHENTIC.",
    "- SURFACE INTEGRATION: The subject must interact with the environment's physics (shadows, reflections, weight/compression).",
    "- TEXTURE MAPPING: Material finishes (metal, glass, leather, fabric) must react correctly to the lighting in the scene.",
    "- LENS CHOICE: Use a cinematic 85mm prime lens perspective for zero distortion and professional depth of field (bokeh).",
    "- CLEANLINESS: No text, no watermarks, no distorted artifacts. Output HIGH-QUALITY IMAGE only.",
    "",
    ctx.customPrompt?.trim()
      ? `ADDITIONAL USER DIRECTION: ${ctx.customPrompt.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
case ToolMode.TEMPLATE_BUILDER: {
  const templateInstructions: Record<string, string> = {
    editorial_vogue:
      "Act as an Art Director for a high-end fashion magazine (Vogue/Elle). Transform the image into a definitive 'Editorial' layout. Place the subject off-center using the Rule of Thirds. Use a minimalist, sophisticated studio background with soft architectural shadows. Apply a grain-film texture and a high-contrast cinematic color grade. Surround the subject with negative space designed for high-end typography.",
    minimal_ikea:
      "Create a clean, functional Scandinavian design layout. Use a palette of natural oak, soft grays, and white. The subject should be perfectly centered with a subtle, realistic contact shadow. The lighting is bright and natural, like a sun-drenched minimalist apartment. Vibe is functional, modern, and trustworthy.",
    vibrant_tiktok:
      "Generate a high-energy, 'Viral' social media layout. Use bold, saturated colors and dynamic lighting (cyan and magenta rim lights). Integrate trendy graphic elements like abstract shapes, stickers, or digital light streaks in the background. The subject should pop with extreme clarity and 'scroll-stopping' vibrancy.",
    luxury_boutique:
      "Transform into a 'Quiet Luxury' boutique catalog shot. Use heavy textures like velvet, silk, or marble in the environment. Apply a warm, expensive-looking color grade (Champagne and Deep Slate). Lighting should be dramatic 'Spotlight' style to emphasize premium quality and craftsmanship. Vibe is exclusive and elite.",
    organic_wellness:
      "Create a soft, organic 'Wellness' brand layout. Surround the subject with natural elements like eucalyptus sprigs, river stones, or soft linen textures. Use a palette of sage green, sand, and cream. Diffused, ethereal morning light with a subtle bloom effect. Vibe is sustainable, calm, and pink.",
    tech_dark_mode:
      "Build a futuristic 'Tech' dark mode layout. Use a deep obsidian or charcoal background with glowing blue or green fiber-optic light trails. The subject should have sharp, technical highlights and a cool-toned industrial finish. Vibe is high-performance, innovative, and sleek.",
    sale_hype:
      "Generate a high-conversion 'Flash Sale' layout. Use high-contrast, energetic colors (Red/Yellow/Black). The subject is positioned dynamically. The background should have high-energy 'speed line' textures or abstract geometric shards to create a sense of urgency. Vibe is bold, direct, and action-oriented.",
    story_scrapbook:
      "Transform into an artistic 'Scrapbook' or 'Mood Board' style. The subject should appear as a hand-cut photo with slightly rough edges. Integrate with textures of torn paper, washi tape, and hand-written notes in the background. Lighting is warm and nostalgic. Vibe is personal, creative, and handcrafted.",
  };

  const specificTemplate =
    templateInstructions[ctx.selectedOptionId || ""] ||
    "Re-imagine the subject within a professional, high-end digital design template. Focus on sophisticated layout, lighting, and environmental storytelling matching the chosen style.";

  return [
    "You are a World-Class Graphic Designer and Creative Director for top-tier Social Media Agencies.",
    `MISSION: ${specificTemplate}`,
    "",
    "CORE PRODUCTION STANDARDS (MANDATORY):",
    "- SUBJECT LOCK: The main subject's identity, shape, and proportions MUST remain 100% AUTHENTIC.",
    "- LAYOUT: Ensure the composition is balanced and leaves intentional 'Negative Space' for text/CTAs.",
    "- INTEGRATION: If the subject is placed in a new environment, ensure shadows, reflections, and lighting are hyper-realistic.",
    "- AESTHETIC: The final result must look like a professionally designed, ready-to-post social media asset.",
    "- NO ARTIFACTS: Absolutely no distorted text, logos, or watermarks in the generated image.",
    "- Output: One HIGH-QUALITY 'Scroll-Stopping' TEMPLATE image only.",
    "",
    ctx.customPrompt?.trim()
      ? `ADDITIONAL DESIGN DIRECTION: ${ctx.customPrompt.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
case ToolMode.HERO_PRODUCT: {
  const heroInstructions: Record<string, string> = {
    classic_studio:
      "Place the subject in a world-class professional photography studio. Use a seamless, neutral gray or off-white cyclorama wall background. Apply a master 3-point lighting setup: a soft key light, a gentle fill light, and a crisp rim light to separate the subject from the background. Include a very soft, realistic contact shadow at the base. This is pure, catalog-grade commercial excellence.",
    dramatic_modern:
      "Create a high-end, dramatic hero shot. Use a dark, textured obsidian or raw concrete backdrop. Lighting should be high-contrast 'Chiaroscuro' style with a single, sharp side-light that emphasizes every detail, texture, and edge of the subject. Apply deep blacks and brilliant specular highlights. Vibe: Exclusive, powerful, and mysterious.",
    podium_3d:
      "Elevate the subject onto a minimalist 3D architectural podium (a low cylinder or slab). The podium should have a premium matte stone or frosted glass finish. Place the scene in a clean, infinite gallery space with soft global illumination and elegant geometric shadows cast by hidden light sources. Vibe: High-tech product launch or premium design showcase.",
    floating_magic:
      "Defy gravity. The subject floats weightlessly in the center of a magical, atmospheric studio. Surround the subject with subtle, out-of-focus floating elements matching its vibe (e.g., gold leaf, water droplets, or soft petals). Use ethereal, multi-directional soft-glow lighting. The subject should appear as if it is the source of light in the scene.",
    glass_reflect:
      "Place the subject on a highly polished black mirror surface. Generate a perfectly symmetrical, crisp vertical reflection. Use cinematic studio lighting to create long, elegant highlights. Add subtle caustic light patterns (refractions) on the background to enhance the sense of luxury. Vibe: High-jewelry or premium electronics commercial.",
    soft_pastel:
      "Create a trendy, airy 'lifestyle' hero shot. Use a palette of soft cream, blush pink, and mint green. Lighting is extremely bright and diffused (High Key), eliminating harsh shadows. The environment should feel like a sun-drenched, high-end minimalist boutique or a designer loft. Vibe: Clean, fresh, and perfectly aesthetic for Pinterest/Instagram.",
    neon_edge:
      "Generate a vibrant, high-energy 'Cyberpunk' hero shot. Apply electric blue and hot pink rim lighting to define the subject's silhouette. The background should be a dark, industrial space with blurred neon tubes and digital artifacts. Reflections on the subject should be colorful and sharp. Vibe: High-performance, tech-driven, and scroll-stopping.",
  };

  const specificHero =
    heroInstructions[ctx.selectedOptionId || ""] ||
    "Re-imagine the subject as the definitive 'Hero' of a professional commercial shoot. Focus on world-class studio lighting, high-end textures, and sophisticated composition.";

  return [
    "Act as a World-Class Commercial Photographer and Studio Art Director.",
    `HERO MISSION: ${specificHero}`,
    "",
    "PRODUCTION STANDARDS (MANDATORY):",
    "- SUBJECT LOCK: The main subject's identity, brand marks, shape, and recognizable features MUST remain 100% AUTHENTIC.",
    "- COMPOSITION: Keep the original camera angle. The subject is the undisputed visual hero.",
    "- QUALITY: Ensure textures (metal, fabric, glass, skin) react realistically to the new lighting setup.",
    "- CLEANLINESS: No text, no logos, no watermarks. Output One HIGH-QUALITY, 'SCROLL-STOPPING' IMAGE only.",
    "",
    ctx.customPrompt?.trim()
      ? `ADDITIONAL CREATIVE DIRECTION: ${ctx.customPrompt.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
case ToolMode.PRODUCT_COLLAGE: {
  const collageInstructions: Record<string, string> = {
    "grid-2x2":
      "Create an elite, high-end commercial 4-panel grid. Arrange the provided products with perfect alignment and equal margins. Apply a unified studio lighting setup across all panels so they look like a single collection. Background should be a consistent, expensive neutral gray with soft contact shadows.",
    "split-v":
      "Generate a sophisticated vertical split-screen composition. Place products on either side with a clear, artistic central division. Use color-blocking or high-contrast backgrounds that complement each product's colors. Ensure consistent lighting direction across both halves.",
    "split-h":
      "Create a dynamic horizontal split-screen layout. Top half features a 'Hero' product, while the bottom half shows supporting items. Blend the transition area with subtle textures or lighting spills to create a cohesive professional look.",
    "mix-3":
      "Arrange the products in a trendy, asymmetrical 'Mix' layout. One large central focal piece and two smaller, overlapping or adjacent supporting items. Create a shared environment—like all products sitting on a single travertine stone slab or floating in a shared atmospheric mist. Use cinematic depth-of-field.",
  };

  const specificCollage =
    collageInstructions[ctx.selectedOptionId || "mix-3"] ||
    "Compose these products into a professional, creative collage. Focus on unified lighting, realistic shadows, and a shared aesthetic environment that makes them look like a single high-end collection.";

  return [
    "You are a World-Class Creative Director and Master Compositor for social media brands.",
    `COMPOSITION MISSION: ${specificCollage}`,
    "",
    "PRODUCTION STANDARDS (MANDATORY):",
    "- PRODUCT INTEGRITY: Each product must remain 100% AUTHENTIC. Do NOT warp, distort, or merge the items into a single blob.",
    "- UNIFIED LIGHTING: Apply a consistent light source direction to all items in the collage. If one has a highlight on the left, all must have it.",
    "- SHADOW HARMONY: Generate realistic contact shadows where items 'touch' a surface or each other. Shadow softness must be consistent.",
    "- AESTHETIC BLENDING: If products are from different photos, re-grade their colors to match a unified professional palette.",
    "- CLEANLINESS: No text, no logos, no watermarks. Output One HIGH-QUALITY 'Scroll-Stopping' COLLAGE image.",
    "",
    ctx.customPrompt?.trim()
      ? `ADDITIONAL CREATIVE DIRECTION: ${ctx.customPrompt.trim()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}


    default:
      return null;
  }
}
