import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Seed room features first
    const roomFeatures = [
        { key: 'ac', label: 'Air Conditioning', category: 'amenity', sortOrder: 1 },
        { key: 'wifi', label: 'Free Wi-Fi', category: 'amenity', sortOrder: 2 },
        { key: 'tv', label: 'Television', category: 'feature', sortOrder: 3 },
        { key: 'geyser', label: 'Hot Water', category: 'feature', sortOrder: 4 },
        { key: 'cctv', label: 'CCTV Security', category: 'feature', sortOrder: 5 },
        { key: 'parking', label: 'Parking', category: 'feature', sortOrder: 6 },
        { key: 'attached', label: 'Attached Bathroom', category: 'feature', sortOrder: 7 },
    ]

    for (const feature of roomFeatures) {
        await prisma.roomFeature.upsert({
            where: { key: feature.key },
            update: { label: feature.label, category: feature.category, sortOrder: feature.sortOrder },
            create: feature,
        })
    }

    console.log(`✅ Room features seeded: ${roomFeatures.length} features`)

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dollyhotel.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    const admin = await prisma.admin.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedPassword,
            isActive: true,
        },
    })

    console.log(`✅ Admin user created: ${admin.email}`)

    // Hardcoded video URLs for categories (using placeholder videos)
    const videoUrls = {
        'attach-ac-single': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'attach-nonac-single': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'nonattach-single': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    }

    // Create hotel categories
    const categories = [
        {
            slug: 'attach-ac-single',
            title: 'Attached AC + Single Bed',
            description: 'Comfortable single bed room with attached bathroom and air conditioning',
            specs: {
                ac: true,
                wifi: true,
                tv: true,
                geyser: true,
                cctv: true,
                parking: true,
                attached: true,
            },
            essentialAmenities: ['Free Wi-Fi', 'Air Conditioning', 'Daily Housekeeping'],
            videoUrl: videoUrls['attach-ac-single'],
            roomCount: 15,
        },
        {
            slug: 'attach-nonac-single',
            title: 'Attached Non-AC Single Bed',
            description: 'Single bed room with attached bathroom, fan-cooled for budget-conscious travelers',
            specs: {
                ac: false,
                wifi: true,
                tv: true,
                geyser: true,
                cctv: true,
                parking: true,
                attached: true,
            },
            essentialAmenities: ['Free Wi-Fi', 'Daily Housekeeping', '24/7 Reception'],
            videoUrl: videoUrls['attach-nonac-single'],
            roomCount: 20,
        },
        {
            slug: 'nonattach-single',
            title: 'Non-Attached Single Bed',
            description: 'Economical single bed room with shared bathroom facilities',
            specs: {
                ac: false,
                wifi: true,
                tv: false,
                geyser: true,
                cctv: true,
                parking: true,
                attached: false,
            },
            essentialAmenities: ['Free Wi-Fi', 'Shared Bathroom', 'Common Area Access'],
            videoUrl: videoUrls['nonattach-single'],
            roomCount: 10,
        },
    ]

    for (const categoryData of categories) {
        const category = await prisma.hotelCategory.upsert({
            where: { slug: categoryData.slug },
            update: categoryData,
            create: categoryData,
        })
        console.log(`✅ Category created: ${category.title}`)

        // Create sample prices for each category
        const prices = [
            { hourlyHours: 2, rateCents: 50000, label: '2 hours' },
            { hourlyHours: 4, rateCents: 80000, label: '4 hours' },
            { hourlyHours: 24, rateCents: 150000, label: '24 hours' },
        ]

        for (const priceData of prices) {
            await prisma.price.upsert({
                where: {
                    categoryId_hourlyHours: {
                        categoryId: category.id,
                        hourlyHours: priceData.hourlyHours,
                    },
                },
                update: priceData,
                create: {
                    ...priceData,
                    categoryId: category.id,
                },
            })
        }
        console.log(`✅ Prices created for: ${category.title}`)
    }

    // Create sample gallery images with working placeholder URLs
    const galleryImages = [
        {
            category: 'Exterior',
            url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
            publicId: 'hotel-exterior-1',
            caption: 'Hotel Front View',
        },
        {
            category: 'Rooms',
            url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
            publicId: 'hotel-room-1',
            caption: 'AC Single Bed Room',
        },
        {
            category: 'Amenities',
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
            publicId: 'hotel-amenities-1',
            caption: 'Reception Area',
        },
        {
            category: 'Exterior',
            url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
            publicId: 'hotel-exterior-night',
            caption: 'Hotel Night View',
        },
    ]

    for (const imageData of galleryImages) {
        await prisma.galleryImage.create({
            data: imageData,
        })
        console.log(`✅ Gallery image created: ${imageData.caption}`)
    }

    console.log('🎉 Seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })