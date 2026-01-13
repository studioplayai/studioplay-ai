import React from 'react';

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  PROCESSING_VIDEO = 'PROCESSING_VIDEO',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum ToolMode {
  // Background
  BACKGROUND_REMOVE = 'BACKGROUND_REMOVE',
  BACKGROUND_BLEND = 'BACKGROUND_BLEND',

  // Enhancement
  UPSCALE = 'UPSCALE',
  LIGHTING_FIX = 'LIGHTING_FIX',
  BACKGROUND_BLUR = 'BACKGROUND_BLUR',

  // Editing
  RECOLOR = 'RECOLOR',
  RETOUCH = 'RETOUCH',
  MAGIC_BRUSH = 'MAGIC_BRUSH', 

  // Strategy & Ideas
  AI_SMART_IDEAS = 'AI_SMART_IDEAS',
  SOCIAL_POST = 'SOCIAL_POST',

  // Creation
  GENERATE_ANGLES = 'GENERATE_ANGLES',
  CAMPAIGN_SHOT = 'CAMPAIGN_SHOT',
  ARTISTIC_STYLE = 'ARTISTIC_STYLE',
  MOOD_BOARD = 'MOOD_BOARD',
  MOOD_CREATOR = 'MOOD_CREATOR',
  AI_EMOTION_PAINTER = 'AI_EMOTION_PAINTER',

  // Marketing Suite
  TEMPLATE_BUILDER = 'TEMPLATE_BUILDER', 
  HERO_PRODUCT = 'HERO_PRODUCT', 
  PRODUCT_COLLAGE = 'PRODUCT_COLLAGE',
  MOCKUP_GENERATOR = 'MOCKUP_GENERATOR', 
  
  // Video
  REELS_GENERATOR = 'REELS_GENERATOR', 
  REELS_COVER_CREATOR = 'REELS_COVER_CREATOR', 
  
  // AI Lab
  AI_EDITOR = 'AI_EDITOR' 
}

export interface MarketingIdeas {
  posts: string[];
  stories: string[];
  videos: string[];
  trends: string[];
  campaign: string;
}

export interface PresetOption {
  id: string;
  labelKey: string;
}

export interface GeneratedItem {
  id: string;
  url: string;
  mediaType: 'image' | 'video' | 'data';
  type: ToolMode;
  description: string;
  timestamp: number;
}

export interface ReelsVideoSettings {
  logo: string | null;
  caption: string;
  style: string; 
  aspectRatio: '9:16' | '16:9';
}

export type TextLayoutStyle = 'modern' | 'bold' | 'minimal' | 'story' | 'product-tag' | 'dynamic-banner' | 'glass-box' | 'luxury-gold';

export interface TextTransform {
  x: number; 
  y: number; 
  scale: number;
  rotation: number; 
}

export interface CampaignSettings {
  showText: boolean;
  title: string;
  price: string;
  discount: string;
  style: string;
  aspectRatio: string;
  language?: 'hebrew' | 'english';
  textStyle: TextLayoutStyle;
  font: string; 
  titleTransform?: TextTransform;
  priceTransform?: TextTransform;
  discountTransform?: TextTransform;
}

export interface CampaignPreset {
  id: string;
  name: string;
  settings: CampaignSettings;
}

export interface SocialPostSettings {
  language: 'hebrew' | 'english';
}

export interface MoodSettings {
  style: string;
  aspectRatio: string;
}

export interface TemplateBuilderSettings {
  creationType: 'post' | 'story' | 'ad' | 'cover';
  aspectRatio: '1:1' | '9:16' | '4:5' | '16:9';
  style: string;
  primaryColor: string;
  headline: string;
  ctaText: string;
  font: string;
  language?: 'hebrew' | 'english';
}

export interface CollageLayout {
  id: string;
  labelKey: string; 
  icon: string;
  gridClass: string; 
  maxImages: number;
}

export interface DesignTemplate {
  id: string;
  name: string;
  niche: 'fashion' | 'jewelry' | 'electronics' | 'home' | 'beauty' | 'general';
  style: 'minimal' | 'bold' | 'luxury' | 'sale';
  overlayNode?: React.ReactNode;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  credits: number;
  plan: 'free' | 'pro' | 'agency';
  joinedAt: number;
  lastSeen?: number; 
  currentActivity?: string; 
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: number;
  planName: string;
  lemonSqueezyId?: string;
}

export type AppLanguage = 'he' | 'en';

export interface AppState {
  appLanguage: AppLanguage; 
  originalImage: string | null;
  generatedItems: GeneratedItem[];
  status: ProcessingStatus;
  currentTool: ToolMode;
  errorMessage: React.ReactNode | null;
  promptInput: string;
  selectedOption: string | null;
  campaignSettings: CampaignSettings;
  socialPostSettings: SocialPostSettings;
  reelsVideoSettings: ReelsVideoSettings;
  selectedTemplateId: string | null;
  marketingNiche: 'fashion' | 'jewelry' | 'electronics' | 'home' | 'beauty' | 'general';
  marketingCopy: { title: string; subtitle: string; footer: string; } | null; 
  marketingVariations: { title: string; subtitle: string; footer: string; }[] | null;
  collageImages: GeneratedItem[]; 
  activeCollageLayout: string;
  collageAspectRatio: string;
  moodSettings: MoodSettings;
  templateBuilderSettings: TemplateBuilderSettings;
  showWatermark: boolean;
  watermarkPosition: { x: number; y: number }; 
  savedPresets: CampaignPreset[]; 
  enableDeepThinking: boolean;
  showAuthModal: boolean;
  showAdminDashboard: boolean;
  generatedIdeas: MarketingIdeas | null;
}

export const TEXT_LAYOUTS: { id: TextLayoutStyle; labelKey: string }[] = [
    { id: 'luxury-gold', labelKey: 'layoutLuxury' },
    { id: 'modern', labelKey: 'layoutModern' },
    { id: 'bold', labelKey: 'layoutBold' },
    { id: 'minimal', labelKey: 'layoutMinimal' },
    { id: 'story', labelKey: 'layoutStory' },
    { id: 'product-tag', labelKey: 'layoutProductTag' },
    { id: 'dynamic-banner', labelKey: 'layoutDynamicBanner' },
    { id: 'glass-box', labelKey: 'layoutGlassBox' },
];

export const HEBREW_FONTS = [
  { id: 'Heebo', label: 'היבו (Heebo)' },
  { id: 'David Libre', label: 'יהודה (Yehuda)' },
  { id: 'Miriam Libre', label: 'מירי (Miri)' },
  { id: 'Varela Round', label: 'גן (Gan)' },
  { id: 'Alef', label: 'דוריאן (Dorian)' },
  { id: 'Tinos', label: 'דרוגולין (Drugulin)' },
  { id: 'Frank Ruhl Libre', label: 'יידישקייט (Yiddishkeit)' },
  { id: 'Assistant', label: 'אנקה (Anka)' },
  { id: 'Amatic SC', label: 'דנה יד (Dana Yad)' },
  { id: 'Rubik', label: 'רוביק (Rubik)' },
  { id: 'Secular One', label: 'כותרת (Secular)' },
  { id: 'Suez One', label: 'מודגש (Suez)' }
];

export const TOOLS_CATEGORIES = [
  {
    id: 'strategy',
    titleKey: 'catStrategy',
    tools: [
      { id: ToolMode.AI_SMART_IDEAS, labelKey: 'toolSmartIdeas', icon: 'lightbulb', isPro: true },
      { id: ToolMode.SOCIAL_POST, labelKey: 'toolMagicPost', icon: 'sparkles', isPro: true },
    ]
  },
  {
    id: 'background',
    titleKey: 'catBackground',
    tools: [
      { id: ToolMode.BACKGROUND_REMOVE, labelKey: 'toolRemoveBg', icon: 'scissors', isPro: false },
      { id: ToolMode.BACKGROUND_BLEND, labelKey: 'toolBlendBg', icon: 'layers', isPro: false },
    ]
  },
  {
    id: 'enhance',
    titleKey: 'catEnhance',
    tools: [
      { id: ToolMode.UPSCALE, labelKey: 'toolUpscale', icon: 'scan', isPro: false },
      { id: ToolMode.LIGHTING_FIX, labelKey: 'toolLighting', icon: 'sun', isPro: false },
      { id: ToolMode.BACKGROUND_BLUR, labelKey: 'toolBlur', icon: 'blur', isPro: false },
    ]
  },
  {
    id: 'edit',
    titleKey: 'catEdit',
    tools: [
      { id: ToolMode.RECOLOR, labelKey: 'toolRecolor', icon: 'palette', isPro: false },
      { id: ToolMode.RETOUCH, labelKey: 'toolRetouch', icon: 'wand', isPro: false },
    ]
  },
  {
    id: 'create',
    titleKey: 'catCreate',
    tools: [
      { id: ToolMode.GENERATE_ANGLES, labelKey: 'toolAngles', icon: 'camera', isPro: false },
      { id: ToolMode.CAMPAIGN_SHOT, labelKey: 'toolCampaign', icon: 'image', isPro: true }, 
      { id: ToolMode.ARTISTIC_STYLE, labelKey: 'toolArtistic', icon: 'sparkles', isPro: false },
      { id: ToolMode.MOOD_BOARD, labelKey: 'toolMoodBoard', icon: 'layout', isPro: false },
      { id: ToolMode.MOOD_CREATOR, labelKey: 'toolMoodCreator', icon: 'feather', isPro: false },
      { id: ToolMode.AI_EMOTION_PAINTER, labelKey: 'toolEmotion', icon: 'brush', isPro: false },
    ]
  },
  {
    id: 'ecommerce',
    titleKey: 'catEcommerce',
    tools: [
      { id: ToolMode.MOCKUP_GENERATOR, labelKey: 'toolMockup', icon: 'box', isPro: false }, 
      { id: ToolMode.TEMPLATE_BUILDER, labelKey: 'toolTemplate', icon: 'layout', isPro: true },
      { id: ToolMode.HERO_PRODUCT, labelKey: 'toolHero', icon: 'star', isPro: false },
      { id: ToolMode.PRODUCT_COLLAGE, labelKey: 'toolCollage', icon: 'grid', isPro: false },
    ]
  },
  {
    id: 'video',
    titleKey: 'catVideo',
    tools: [
      { id: ToolMode.REELS_GENERATOR, labelKey: 'toolReels', icon: 'film', isPro: true },
      { id: ToolMode.REELS_COVER_CREATOR, labelKey: 'toolCovers', icon: 'image', isPro: false },
    ]
  },
  {
    id: 'lab',
    titleKey: 'catLab',
    tools: [
      { id: ToolMode.AI_EDITOR, labelKey: 'toolAiEditor', icon: 'send', isPro: false },
    ]
  }
];

export const TOOL_PRESETS: Record<string, PresetOption[]> = {
  [ToolMode.RECOLOR]: [
    { id: 'stealth_black', labelKey: 'p_stealth_black' },
    { id: 'luxury_gold', labelKey: 'p_luxury_gold' },
    { id: 'minimal_white', labelKey: 'p_minimal_white' },
    { id: 'soft_pastel', labelKey: 'p_soft_pastel' },
    { id: 'emerald_green', labelKey: 'p_emerald_green' },
    { id: 'vibrant_pop', labelKey: 'p_vibrant_pop' },
    { id: 'midnight_blue', labelKey: 'p_midnight_blue' },
    { id: 'rose_quartz', labelKey: 'p_rose_quartz' },
  ],
  [ToolMode.REELS_COVER_CREATOR]: [
    { id: 'cinematic', labelKey: 'p_cinematic' },
    { id: 'clean_collage', labelKey: 'p_clean_collage' },
    { id: 'mystery_teaser', labelKey: 'p_mystery_teaser' },
    { id: 'torn_paper', labelKey: 'p_torn_paper' },
    { id: 'magnifying_glass', labelKey: 'p_magnifying_glass' },
    { id: 'search_bar', labelKey: 'p_search_bar' },
    { id: 'before_after', labelKey: 'p_before_after' },
    { id: 'peel_reveal', labelKey: 'p_peel_reveal' },
    { id: 'magazine', labelKey: 'p_magazine' },
    { id: 'hologram', labelKey: 'p_hologram' },
    { id: 'motion_blur', labelKey: 'p_motion_blur' },
    { id: 'stop_motion', labelKey: 'p_stop_motion' },
    { id: 'light_trails', labelKey: 'p_light_trails' },
    { id: 'splash_art', labelKey: 'p_splash_art' },
    { id: 'exploded', labelKey: 'p_exploded' },
    { id: 'particle', labelKey: 'p_particle' },
    { id: 'shutter_drag', labelKey: 'p_shutter_drag' },
    { id: 'glitch', labelKey: 'p_glitch' },
    { id: 'focus_pull', labelKey: 'p_focus_pull' },
    { id: 'lens_flare', labelKey: 'p_lens_flare' },
  ],
  [ToolMode.REELS_GENERATOR]: [
    { id: 'orbit', labelKey: 'p_orbit' },
    { id: 'zoom_in', labelKey: 'p_zoom_in' },
    { id: 'pan', labelKey: 'p_pan' },
    { id: 'fpv_drone', labelKey: 'p_fpv_drone' },
    { id: 'dolly_zoom', labelKey: 'p_dolly_zoom' },
    { id: 'zoom_out', labelKey: 'p_zoom_out' },
    { id: 'flicker_neon', labelKey: 'p_flicker_neon' },
    { id: 'golden_hour', labelKey: 'p_golden_hour' },
    { id: 'smoke_reveal', labelKey: 'p_smoke_reveal' },
    { id: 'water_reflect', labelKey: 'p_water_reflect' },
    { id: 'falling_petals', labelKey: 'p_falling_petals' },
    { id: 'vhs', labelKey: 'p_vhs' },
    { id: 'cyberpunk_glitch', labelKey: 'p_cyberpunk_glitch' },
  ],
  [ToolMode.AI_EMOTION_PAINTER]: [
    { id: 'joy', labelKey: 'p_joy' },
    { id: 'peace', labelKey: 'p_peace' },
    { id: 'drama', labelKey: 'p_drama' },
    { id: 'mystery', labelKey: 'p_mystery' },
    { id: 'energy', labelKey: 'p_energy' },
    { id: 'passion', labelKey: 'p_passion' },
    { id: 'dreamy', labelKey: 'p_dreamy' },
    { id: 'calm_minimal', labelKey: 'p_calm_minimal' },
  ],
  [ToolMode.MOOD_CREATOR]: [
    { id: 'cozy_home', labelKey: 'p_cozy_home' },
    { id: 'minimal_studio', labelKey: 'p_minimal_studio' },
    { id: 'urban_cafe', labelKey: 'p_urban_cafe' },
    { id: 'nature', labelKey: 'p_nature' },
    { id: 'luxury_marble', labelKey: 'p_luxury_marble' },
    { id: 'beach_vibe', labelKey: 'p_beach_vibe' },
  ],
  [ToolMode.MOCKUP_GENERATOR]: [
    { id: 'real_estate_staging', labelKey: 'p_re_staging' },
    { id: 'real_estate_exterior_night', labelKey: 'p_re_exterior_night' },
    { id: 'real_estate_modern_kitchen', labelKey: 'p_re_kitchen' },
    { id: 'real_estate_luxury_pool', labelKey: 'p_re_pool' },
    { id: 'real_estate_garden_fire', labelKey: 'p_re_garden' },
    { id: 'real_estate_office_glass', labelKey: 'p_re_office' },
    { id: 'fashion_studio', labelKey: 'p_fashion_studio' },
    { id: 'fashion_street', labelKey: 'p_fashion_street' },
    { id: 'mannequin', labelKey: 'p_mannequin' },
    { id: 'flat_lay', labelKey: 'p_flat_lay' },
    { id: 'shirt_print', labelKey: 'p_shirt_print' },
    { id: 'folded_shirt', labelKey: 'p_folded_shirt' },
    { id: 'hanger', labelKey: 'p_hanger' },
    { id: 'label_closeup', labelKey: 'p_label_closeup' },
    { id: 'jewelry_on_model', labelKey: 'p_jewelry_on_model' },
    { id: 'hand_manicure', labelKey: 'p_hand_manicure' },
    { id: 'velvet_display', labelKey: 'p_velvet_display' },
    { id: 'luxury_box', labelKey: 'p_luxury_box' },
    { id: 'silk_surface', labelKey: 'p_silk_surface' },
    { id: 'grand_piano', labelKey: 'p_grand_piano' },
    { id: 'sea_pearl', labelKey: 'p_sea_pearl' },
    { id: 'marble_statue', labelKey: 'p_marble_statue' },
    { id: 'floral', labelKey: 'p_floral' },
    { id: 'vintage_book', labelKey: 'p_vintage_book' },
    { id: 'bubbles', labelKey: 'p_bubbles' },
    { id: 'lifestyle_wine', labelKey: 'p_lifestyle_wine' },
    { id: 'basalt_rock', labelKey: 'p_basalt_rock' },
    { id: 'rustic_branch', labelKey: 'p_rustic_branch' },
    { id: 'food_presentation', labelKey: 'p_food_presentation' },
    { id: 'restaurant_table', labelKey: 'p_restaurant_table' },
    { id: 'takeaway', labelKey: 'p_takeaway' },
    { id: 'menu_open', labelKey: 'p_menu_open' },
    { id: 'food_flatlay', labelKey: 'p_food_flatlay' },
    { id: 'professional_kitchen', labelKey: 'p_professional_kitchen' },
    { id: 'luxury_tray', labelKey: 'p_luxury_tray' },
    { id: 'packaging_box', labelKey: 'p_packaging_box' },
    { id: 'shopping_bag', labelKey: 'p_shopping_bag' },
    { id: 'display_shelf', labelKey: 'p_display_shelf' },
    { id: 'billboard', labelKey: 'p_billboard' },
    { id: 'held_hand', labelKey: 'p_held_hand' },
    { id: 'showcase', labelKey: 'p_showcase' },
    { id: 'screen_break', labelKey: 'p_screen_break' },
    { id: 'floating_clouds', labelKey: 'p_floating_clouds' },
    { id: 'water_splash', labelKey: 'p_water_splash' },
    { id: 'underwater', labelKey: 'p_underwater' },
    { id: 'beach_rock', labelKey: 'p_beach_rock' },
    { id: 'ice_cubes', labelKey: 'p_ice_cubes' },
  ],
  [ToolMode.HERO_PRODUCT]: [
    { id: 'classic_studio', labelKey: 'p_classic_studio' },
    { id: 'dramatic_modern', labelKey: 'p_dramatic_modern' },
    { id: 'podium_3d', labelKey: 'p_podium_3d' },
    { id: 'floating_magic', labelKey: 'p_floating_magic' },
    { id: 'glass_reflect', labelKey: 'p_glass_reflect' },
    { id: 'soft_pastel', labelKey: 'p_soft_pastel' },
    { id: 'neon_edge', labelKey: 'p_neon_edge' }
  ],
  [ToolMode.CAMPAIGN_SHOT]: [
    { id: 'deep_ocean', labelKey: 'p_deep_ocean' },
    { id: 'infinity_pool', labelKey: 'p_infinity_pool' },
    { id: 'cloudscape', labelKey: 'p_cloudscape' },
    { id: 'tropical_beach', labelKey: 'p_tropical_beach' },
    { id: 'stormy_sea', labelKey: 'p_stormy_sea' },
    { id: 'mirror_lake', labelKey: 'p_mirror_lake' },
    { id: 'sunset_horizon', labelKey: 'p_sunset_horizon' },
    { id: 'rainforest', labelKey: 'p_rainforest' },
    { id: 'luxury', labelKey: 'p_luxury' },
    { id: 'silk', labelKey: 'p_silk' },
    { id: 'marble', labelKey: 'p_marble' },
    { id: 'dark_slate', labelKey: 'p_dark_slate' },
    { id: 'royal_velvet', labelKey: 'p_royal_velvet' },
    { id: 'monochrome', labelKey: 'p_monochrome' },
    { id: 'architectural_shadows', labelKey: 'p_architectural_shadows' },
    { id: 'mirror_reflect', labelKey: 'p_mirror_reflect' },
    { id: 'broken_mirrors', labelKey: 'p_broken_mirrors' },
    { id: 'exploded_view', labelKey: 'p_exploded_view' },
    { id: 'water_splash', labelKey: 'p_water_splash' },
    { id: 'levitation', labelKey: 'p_levitation' },
    { id: 'podium_minimal', labelKey: 'p_podium_minimal' },
    { id: 'tech_future', labelKey: 'p_tech_future' },
    { id: 'concrete', labelKey: 'p_concrete' },
    { id: 'neon_city', labelKey: 'p_neon_city' },
    { id: 'shattered_glass', labelKey: 'p_shattered_glass' },
    { id: 'screen_break', labelKey: 'p_screen_break' },
    { id: 'melting_glass', labelKey: 'p_melting_glass' },
    { id: 'stained_glass', labelKey: 'p_stained_glass' },
  ],
  [ToolMode.SOCIAL_POST]: [
    { id: 'magic_auto', labelKey: 'p_magic_auto' },
    { id: 'jewelry_macro', labelKey: 'p_jewelry_macro' },
    { id: 'dark_luxury', labelKey: 'p_dark_luxury' },
    { id: 'silk_satin', labelKey: 'p_silk_satin' },
    { id: 'golden_hour_jewelry', labelKey: 'p_golden_hour_jewelry' },
    { id: 'water_reflection', labelKey: 'p_water_reflection' },
    { id: 'organic_stone', labelKey: 'p_organic_stone' },
    { id: 'model_vibe', labelKey: 'p_model_vibe' },
    { id: 'unboxing', labelKey: 'p_unboxing' },
    { id: 'bts_studio', labelKey: 'p_bts_studio' },
    { id: 'clean_lines', labelKey: 'p_clean_lines' },
    { id: 'feature_highlight', labelKey: 'p_feature_highlight' },
    { id: 'testimonial', labelKey: 'p_testimonial' },
    { id: 'new_arrival', labelKey: 'p_new_arrival' },
    { id: 'summer_vibe', labelKey: 'p_summer_vibe' },
    { id: 'how_to', labelKey: 'p_how_to' },
    { id: 'minimal_clean', labelKey: 'p_minimal_clean' },
    { id: 'sale', labelKey: 'p_sale' },
    { id: 'pop_bold', labelKey: 'p_pop_bold' },
    { id: 'complete_look', labelKey: 'p_complete_look' },
    { id: 'fabric_focus', labelKey: 'p_fabric_focus' },
    { id: 'street_style', labelKey: 'p_street_style' },
    { id: 'chefs_special', labelKey: 'p_chefs_special' },
    { id: 'fresh_ingredients', labelKey: 'p_fresh_ingredients' },
    { id: 'customer_exp', labelKey: 'p_customer_exp' },
    { id: 'real_estate_staging', labelKey: 'p_real_estate_staging' },
    { id: 'real_estate_golden', labelKey: 'p_real_estate_golden' },
  ],
  [ToolMode.ARTISTIC_STYLE]: [
    { id: 'original', labelKey: 'p_original' },
    { id: 'blueprint', labelKey: 'p_blueprint' },
    { id: 'clay3d', labelKey: 'p_clay3d' },
    { id: 'double_exposure', labelKey: 'p_double_exposure' },
    { id: 'oil_painting', labelKey: 'p_oil_painting' },
    { id: 'cyberpunk_neon', labelKey: 'p_cyberpunk_neon' },
    { id: 'pencil_sketch', labelKey: 'p_pencil_sketch' },
    { id: 'anime_manga', labelKey: 'p_anime_manga' },
    { id: 'pop_art', labelKey: 'p_pop_art' },
    { id: 'low_poly', labelKey: 'p_low_poly' },
    { id: 'watercolor', labelKey: 'p_watercolor' },
    { id: 'vaporwave', labelKey: 'p_vaporwave' },
    { id: 'halftone', labelKey: 'p_halftone' },
    { id: 'paper_cutout', labelKey: 'p_paper_cutout' },
    { id: 'patent_sketch', labelKey: 'p_patent_sketch' },
    { id: 'liquid_metal', labelKey: 'p_liquid_metal' },
    { id: 'holographic', labelKey: 'p_holographic' },
    { id: 'stone_sculpt', labelKey: 'p_stone_sculpt' },
    { id: 'fashion_illust', labelKey: 'p_fashion_illust' },
    { id: 'textile_art', labelKey: 'p_textile_art' },
    { id: 'magazine_collage', labelKey: 'p_magazine_collage' },
    { id: 'xray', labelKey: 'p_xray' }
  ],
  [ToolMode.GENERATE_ANGLES]: [
    { id: 'angle_grid', labelKey: 'p_angle_grid' },
    { id: 'flat_lay', labelKey: 'p_flat_lay' },
    { id: 'hero_shot', labelKey: 'p_hero_shot' },
    { id: 'macro', labelKey: 'p_macro' },
    { id: 'side_profile', labelKey: 'p_side_profile' }
  ],
  [ToolMode.BACKGROUND_REMOVE]: [
    { id: 'clean_studio', labelKey: 'p_clean_studio' },
    { id: 'transparent_png', labelKey: 'p_transparent_png' },
    { id: 'water_reflect', labelKey: 'p_water_reflect' },
    { id: 'black_mirror', labelKey: 'p_black_mirror' },
    { id: 'ghost_mannequin', labelKey: 'p_ghost_mannequin' },
    { id: 'soft_shadow', labelKey: 'p_soft_shadow' },
    { id: 'hard_shadow', labelKey: 'p_hard_shadow' },
    { id: 'glass_reflect', labelKey: 'p_glass_reflect' },
    { id: 'neutral_gray', labelKey: 'p_neutral_gray' },
    { id: 'white_outline', labelKey: 'p_white_outline' }
  ],
  [ToolMode.BACKGROUND_BLEND]: [
    { id: 'water_ripple', labelKey: 'p_water_ripple' },
    { id: 'golden_beach', labelKey: 'p_golden_beach' },
    { id: 'wooden_pier', labelKey: 'p_wooden_pier' },
    { id: 'blue_sky', labelKey: 'p_blue_sky' },
    { id: 'rainforest', labelKey: 'p_rainforest' },
    { id: 'desert', labelKey: 'p_desert' },
    { id: 'marble', labelKey: 'p_marble' },
    { id: 'travertine', labelKey: 'p_travertine' },
    { id: 'terrazzo', labelKey: 'p_terrazzo' },
    { id: 'oak_wood', labelKey: 'p_oak_wood' },
    { id: 'concrete', labelKey: 'p_concrete' },
    { id: 'silk_satin', labelKey: 'p_silk_satin' },
    { id: 'velvet', labelKey: 'p_velvet' },
    { id: 'window_light', labelKey: 'p_window_light' },
    { id: 'bokeh', labelKey: 'p_bokeh' },
    { id: 'gobo', labelKey: 'p_gobo' },
    { id: 'brushed_metal', labelKey: 'p_brushed_metal' }
  ],
  [ToolMode.LIGHTING_FIX]: [
    { id: 'soft_studio', labelKey: 'p_soft_studio' },
    { id: 'dramatic_contrast', labelKey: 'p_dramatic_contrast' },
    { id: 'warm_natural', labelKey: 'p_warm_natural' },
    { id: 'cool_modern', labelKey: 'p_cool_modern' }
  ]
};

export const COLLAGE_LAYOUTS: CollageLayout[] = [
  { id: 'grid-2x2', labelKey: 'collageGrid', icon: 'grid', gridClass: 'grid-cols-2 grid-rows-2', maxImages: 4 },
  { id: 'split-v', labelKey: 'collageSplitV', icon: 'split', gridClass: 'grid-cols-2 grid-rows-1', maxImages: 2 },
  { id: 'split-h', labelKey: 'collageSplitH', icon: 'layout', gridClass: 'grid-cols-1 grid-rows-2', maxImages: 2 },
  { id: 'mix-3', labelKey: 'collageMix', icon: 'three', gridClass: 'grid-cols-2 grid-rows-2', maxImages: 3 },
];

export const NICHE_LABELS: Record<string, string> = {
  'fashion': 'אופנה וסטייל',
  'jewelry': 'תכשיטים ויוקרה',
  'electronics': 'גאדג\'טים וטק',
  'home': 'עיצוב הבית',
  'beauty': 'טיפוח וביוטי',
  'general': 'כללי'
};

export const TEMPLATE_REGISTRY: DesignTemplate[] = [];