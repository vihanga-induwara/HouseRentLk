export const SRI_LANKAN_TOWNS = [
    "Colombo", "Kandy", "Galle", "Negombo", "Batticaloa", "Jaffna",
    "Trincomalee", "Anuradhapura", "Ratnapura", "Badulla", "Matara",
    "Kurunegala", "Nuwara Eliya", "Kotte", "Dehiwala", "Moratuwa",
    "Maharagama", "Kelaniya", "Panadura", "Kaduwela", "Rajagiriya",
    "Nugegoda", "Piliyandala", "Malabe", "Wattala", "Kadawatha",
    "Homagama", "Kottawa", "Mount Lavinia", "Borella", "Nawala",
    "Thalawathugoda", "Battaramulla", "Athurugiriya", "Kiribathgoda",
    "Hokandara", "Horana", "Avissawella", "Kalutara", "Beruwala",
    "Hikkaduwa", "Unawatuna", "Mirissa", "Tangalle", "Hambantota",
    "Ella", "Bandarawela", "Haputale", "Sigiriya", "Dambulla",
    "Polonnaruwa", "Matale", "Ampara", "Puttalam", "Chilaw",
    "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya",
    "Wellawatte", "Bambalapitiya", "Kollupitiya", "Fort", "Pettah",
    "Kohuwala", "Pepiliyana", "Boralesgamuwa"
];

export const PROPERTY_TYPES = [
    "House",
    "Apartment",
    "Annex",
    "Villa",
    "Bungalow",
    "Studio",
    "Office",
    "Shop",
    "Warehouse",
    "Land",
    "Boarding Room"
];

export const AMENITIES_LIST = [
    { id: 'ac', label: 'Air Conditioning', icon: 'Wind' },
    { id: 'parking', label: 'Parking', icon: 'Car' },
    { id: 'wifi', label: 'WiFi', icon: 'Wifi' },
    { id: 'garden', label: 'Garden', icon: 'Trees' },
    { id: 'solarPower', label: 'Solar Power', icon: 'Sun' },
    { id: 'hotWater', label: 'Hot Water', icon: 'Thermometer' },
    { id: 'security', label: '24/7 Security', icon: 'Shield' },
    { id: 'pool', label: 'Swimming Pool', icon: 'Droplets' },
    { id: 'gym', label: 'Gym', icon: 'Dumbbell' }
];

export const DISTRICTS = [
    "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
    "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
    "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
    "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
    "Monaragala", "Ratnapura", "Kegalle"
];

// Inline SVG so listings without photos never depend on an external image service
export const NO_IMAGE_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
    '<rect width="400" height="300" fill="#e2e8f0"/>' +
    '<path d="M150 170l50-50 50 50v40h-100z" fill="#94a3b8"/>' +
    '<text x="200" y="245" font-family="Arial,sans-serif" font-size="18" fill="#64748b" text-anchor="middle">No photo</text>' +
    '</svg>'
)}`;
