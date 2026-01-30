/**
 * ==============================================
 * SHOP IDENTITY TYPES - Based on API Spec v1.0.0
 * ==============================================
 * 
 * API Endpoints:
 * - GET /api/v1/public/shops/{shopId}/identity → ShopIdentityResponse
 * - GET /api/v1/public/shops/{shopId}/stats → ShopStatsResponse
 * - GET /api/v1/user/interactions/shop?shopId={shopId} → ShopInteractionResponse
 * 
 * @see shopHomeDesign/SHOP_IDENTITY_API_SPEC.md
 */

import { z } from 'zod';

// ============================================
// SECTION 1: IDENTITY (Nhận diện thương hiệu)
// ============================================

export const ShopIdentitySchema = z.object({
    shopId: z.string(),
    shopName: z.string(),
    slug: z.string(),
    logoUrl: z.string(),
    coverDesktopUrl: z.string().nullable().optional(),
    coverMobileUrl: z.string().nullable().optional(),
    tagline: z.string().nullable().optional(),
});

export type ShopIdentity = z.infer<typeof ShopIdentitySchema>;

// ============================================
// SECTION 2: LEGAL (Pháp lý & Công ty)
// ============================================

export const ShopLegalSchema = z.object({
    isOfficial: z.boolean().default(false),
    isMall: z.boolean().default(false),
    companyName: z.string().nullable().optional(),
    taxId: z.string().nullable().optional(),
    registrationNumber: z.string().nullable().optional(),
    headquarters: z.string().nullable().optional(),
    foundedYear: z.number().nullable().optional(),
});

export type ShopLegal = z.infer<typeof ShopLegalSchema>;

// ============================================
// SECTION 3: BRAND STORY (Widget-based)
// ============================================

/**
 * Click Action Types
 */
export const ClickActionTypeEnum = z.enum([
    'INTERNAL_ROUTE',
    'EXTERNAL_WEB',
    'VIEW_IMAGE',
]);

export type ClickActionType = z.infer<typeof ClickActionTypeEnum>;

/**
 * Internal Route Screen Names
 */
export const InternalScreenEnum = z.enum([
    'PRODUCT_DETAIL',
    'PRODUCT_LIST',
    'CATEGORY_DETAIL',
    'VOUCHER_HUNT',
]);

export type InternalScreen = z.infer<typeof InternalScreenEnum>;

/**
 * Click Action Payload Schemas
 */
export const InternalRoutePayloadSchema = z.object({
    screen: InternalScreenEnum,
    params: z.record(z.string(), z.union([z.string(), z.number()])),
});

export const ExternalWebPayloadSchema = z.object({
    url: z.string(),
});

export const ViewImagePayloadSchema = z.object({
    imageUrl: z.string(),
    zoomable: z.boolean().optional().default(true),
});

/**
 * Click Action Schema (Union type)
 */
export const ClickActionSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('INTERNAL_ROUTE'),
        payload: InternalRoutePayloadSchema,
    }),
    z.object({
        type: z.literal('EXTERNAL_WEB'),
        payload: ExternalWebPayloadSchema,
    }),
    z.object({
        type: z.literal('VIEW_IMAGE'),
        payload: ViewImagePayloadSchema,
    }),
]);

export type ClickAction = z.infer<typeof ClickActionSchema>;

/**
 * Brand Story Section Types
 */
export const BrandStorySectionTypeEnum = z.enum([
    'TEXT_BLOCK',
    'RICH_TEXT',
    'IMAGE_HERO',
    'VIDEO_INTRO',
    'GALLERY_GRID',
    'TIMELINE',
]);

export type BrandStorySectionType = z.infer<typeof BrandStorySectionTypeEnum>;

/**
 * Rich Text Span (for RICH_TEXT sections)
 */
export const RichTextSpanSchema = z.object({
    text: z.string(),
    style: z.object({
        bold: z.boolean().optional(),
        italic: z.boolean().optional(),
        color: z.object({
            light: z.string().optional(),
            dark: z.string().optional(),
        }).optional(),
        size: z.number().optional(),
    }).optional(),
});

export type RichTextSpan = z.infer<typeof RichTextSpanSchema>;

/**
 * Gallery Grid Item
 */
export const GalleryGridItemSchema = z.object({
    thumbnailUrl: z.string(),
    originalUrl: z.string(),
    clickAction: ClickActionSchema.optional(),
});

export type GalleryGridItem = z.infer<typeof GalleryGridItemSchema>;

/**
 * Timeline Item
 */
export const TimelineItemSchema = z.object({
    year: z.string(),
    title: z.string(),
    description: z.string().optional(),
});

export type TimelineItem = z.infer<typeof TimelineItemSchema>;

/**
 * Section Data Schemas by Type
 */
export const TextBlockDataSchema = z.object({
    title: z.string().optional(),
    content: z.string(),
});

export const RichTextDataSchema = z.object({
    spans: z.array(RichTextSpanSchema),
});

export const ImageHeroDataSchema = z.object({
    thumbnailUrl: z.string(),
    originalUrl: z.string(),
    aspectRatio: z.number().optional(),
    clickAction: ClickActionSchema.optional(),
});

export const VideoIntroDataSchema = z.object({
    url: z.string(),
    posterUrl: z.string().optional(),
    duration: z.number().optional(),
    isAutoplay: z.boolean().optional().default(true),
    isMuted: z.boolean().optional().default(true),
    controls: z.boolean().optional().default(false),
    aspectRatio: z.number().optional().default(1.78), // 16:9
});

export const GalleryGridDataSchema = z.object({
    columnCount: z.number().optional().default(2),
    items: z.array(GalleryGridItemSchema),
});

export const TimelineDataSchema = z.object({
    items: z.array(TimelineItemSchema),
});

/**
 * Brand Story Section (Union by type)
 */
export const BrandStorySectionSchema = z.object({
    type: BrandStorySectionTypeEnum,
    name: z.string().optional(),
    title: z.string().optional(),
    order: z.number(),
    data: z.union([
        TextBlockDataSchema,
        RichTextDataSchema,
        ImageHeroDataSchema,
        VideoIntroDataSchema,
        GalleryGridDataSchema,
        TimelineDataSchema,
    ]),
});

export type BrandStorySection = z.infer<typeof BrandStorySectionSchema>;

/**
 * Brand Story Container
 */
export const BrandStorySchema = z.object({
    version: z.number().default(1),
    sections: z.array(BrandStorySectionSchema).default([]),
});

export type BrandStory = z.infer<typeof BrandStorySchema>;

// ============================================
// SECTION 4: SUPPORT (Hỗ trợ khách hàng)
// ============================================

/**
 * Operating Hours for a single day
 */
export const OperatingHoursSchema = z.object({
    day: z.number().min(1).max(7), // 1 = Monday, 7 = Sunday
    open: z.number().nullable(), // Minutes from midnight (e.g., 480 = 8:00 AM)
    close: z.number().nullable(), // Minutes from midnight (e.g., 1200 = 8:00 PM)
});

export type OperatingHours = z.infer<typeof OperatingHoursSchema>;

export const ShopSupportSchema = z.object({
    hotline: z.string().nullable().optional(),
    supportEmail: z.string().nullable().optional(),
    workingHoursDisplay: z.string().nullable().optional(),
    operatingHours: z.array(OperatingHoursSchema).nullable().optional(),
    holidays: z.array(z.string()).nullable().optional(), // YYYY-MM-DD format
    returnPolicyUrl: z.string().nullable().optional(),
});

export type ShopSupport = z.infer<typeof ShopSupportSchema>;

// ============================================
// SECTION 5: COMBINED IDENTITY RESPONSE
// ============================================

/**
 * Full Shop Identity Response (Cache 24h)
 * Endpoint: GET /api/v1/public/shops/{shopId}/identity
 */
export const ShopIdentityResponseDataSchema = z.object({
    identity: ShopIdentitySchema,
    legal: ShopLegalSchema,
    brandStory: BrandStorySchema.nullable().optional(),
    support: ShopSupportSchema.nullable().optional(),
});

export type ShopIdentityResponseData = z.infer<typeof ShopIdentityResponseDataSchema>;

// ============================================
// SECTION 6: STATS RESPONSE (Real-time)
// ============================================

/**
 * Shop Stats Response
 * Endpoint: GET /api/v1/public/shops/{shopId}/stats
 */
export const ShopStatsSchema = z.object({
    rating: z.number().nullable().optional(),
    reviewCount: z.number().default(0),
    followerCount: z.number().default(0),
    responseRate: z.number().nullable().optional(),
    joinedDate: z.string().nullable().optional(),
});

export type ShopStats = z.infer<typeof ShopStatsSchema>;

// ============================================
// SECTION 7: USER INTERACTION
// ============================================

/**
 * User Interaction with Shop
 * Endpoint: GET /api/v1/user/interactions/shop?shopId={shopId}
 */
export const ShopInteractionSchema = z.object({
    isFollowed: z.boolean().default(false),
    isBlocked: z.boolean().default(false),
});

export type ShopInteraction = z.infer<typeof ShopInteractionSchema>;

// ============================================
// TYPE GUARDS & UTILITIES
// ============================================

/**
 * Type guard for section data types
 */
export const isVideoIntroSection = (section: BrandStorySection): section is BrandStorySection & { data: z.infer<typeof VideoIntroDataSchema> } => {
    return section.type === 'VIDEO_INTRO';
};

export const isRichTextSection = (section: BrandStorySection): section is BrandStorySection & { data: z.infer<typeof RichTextDataSchema> } => {
    return section.type === 'RICH_TEXT';
};

export const isGalleryGridSection = (section: BrandStorySection): section is BrandStorySection & { data: z.infer<typeof GalleryGridDataSchema> } => {
    return section.type === 'GALLERY_GRID';
};

export const isTimelineSection = (section: BrandStorySection): section is BrandStorySection & { data: z.infer<typeof TimelineDataSchema> } => {
    return section.type === 'TIMELINE';
};

export const isTextBlockSection = (section: BrandStorySection): section is BrandStorySection & { data: z.infer<typeof TextBlockDataSchema> } => {
    return section.type === 'TEXT_BLOCK';
};

export const isImageHeroSection = (section: BrandStorySection): section is BrandStorySection & { data: z.infer<typeof ImageHeroDataSchema> } => {
    return section.type === 'IMAGE_HERO';
};
