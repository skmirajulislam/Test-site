// Hardcoded video URLs for home slider and category videos
// These cannot be changed by admin and are embedded in the application

export const HOME_SLIDER_CONTENT = [
    {
        type: 'image',
        url: 'https://res.cloudinary.com/demo/image/upload/v1/hotel-exterior-night.jpg',
        alt: 'Hotel exterior at night',
    },
    {
        type: 'image',
        url: 'https://res.cloudinary.com/demo/image/upload/v1/hotel-lobby.jpg',
        alt: 'Hotel lobby',
    },
    {
        type: 'video',
        url: 'https://res.cloudinary.com/demo/video/upload/v1/hotel-showcase.mp4',
        alt: 'Hotel showcase video',
    },
    {
        type: 'image',
        url: 'https://res.cloudinary.com/demo/image/upload/v1/hotel-pool.jpg',
        alt: 'Hotel swimming pool',
    },
] as const

export const CATEGORY_VIDEOS = {
    'attach-ac-single': 'https://res.cloudinary.com/demo/video/upload/v1/room-ac-single.mp4',
    'attach-nonac-single': 'https://res.cloudinary.com/demo/video/upload/v1/room-nonac-single.mp4',
    'nonattach-single': 'https://res.cloudinary.com/demo/video/upload/v1/room-shared.mp4',
} as const

export const GALLERY_CATEGORIES = [
    'Exterior',
    'Rooms',
    'Amenities',
] as const

export const ROOM_SPECS = {
    ac: 'Air Conditioning',
    wifi: 'WiFi',
    tv: 'Television',
    geyser: 'Hot Water',
    cctv: 'CCTV Security',
    parking: 'Parking',
    attached: 'Attached Bathroom',
} as const

// Slider duration in milliseconds (60 seconds)
export const SLIDER_DURATION = 60000