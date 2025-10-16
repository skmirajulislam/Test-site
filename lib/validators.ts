import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

export const categorySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    description: z.string().optional(),
    roomCount: z.number().min(0, 'Room count must be non-negative'),
    bedType: z.string().optional(),
    maxOccupancy: z.number().min(1, 'Max occupancy must be at least 1').optional(),
    roomSize: z.string().optional(),
    specs: z.object({
        ac: z.boolean(),
        wifi: z.boolean(),
        tv: z.boolean(),
        geyser: z.boolean(),
        cctv: z.boolean(),
        parking: z.boolean(),
        attached: z.boolean(),
    }).optional(),
})

// Proper update schema with fully optional specs
export const categoryUpdateSchema = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
    description: z.string().optional(),
    roomCount: z.number().min(0, 'Room count must be non-negative').optional(),
    bedType: z.string().optional(),
    maxOccupancy: z.number().min(1, 'Max occupancy must be at least 1').optional(),
    roomSize: z.string().optional(),
    specs: z.object({
        ac: z.boolean().optional(),
        wifi: z.boolean().optional(),
        tv: z.boolean().optional(),
        geyser: z.boolean().optional(),
        cctv: z.boolean().optional(),
        parking: z.boolean().optional(),
        attached: z.boolean().optional(),
    }).optional(),
})

export const priceSchema = z.object({
    categoryId: z.number().positive('Category ID must be positive'),
    hourlyHours: z.number().positive('Hours must be positive'),
    rateCents: z.number().positive('Rate must be positive'),
    label: z.string().optional(),
})

export const galleryImageSchema = z.object({
    category: z.enum(['Exterior', 'Rooms', 'Dining', 'Amenities']),
    caption: z.string().optional(),
    categoryId: z.number().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>
export type PriceInput = z.infer<typeof priceSchema>
export type GalleryImageInput = z.infer<typeof galleryImageSchema>