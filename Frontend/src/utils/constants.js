// Inline SVG so listings without photos never depend on an external image service
export const NO_IMAGE_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
    '<rect width="400" height="300" fill="#e2e8f0"/>' +
    '<path d="M150 170l50-50 50 50v40h-100z" fill="#94a3b8"/>' +
    '<text x="200" y="245" font-family="Arial,sans-serif" font-size="18" fill="#64748b" text-anchor="middle">No photo</text>' +
    '</svg>'
)}`;
