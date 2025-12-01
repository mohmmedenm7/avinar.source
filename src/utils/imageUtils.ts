// Helper function to fix image URLs from backend
export const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return "/placeholder-course.png";

    // Clean duplicate URL prefixes using regex
    // This handles cases like: "http://localhost:8000/products/http://localhost:8000/products/image.jpg"
    let cleanedPath = imagePath;
    const duplicatePattern = /(https?:\/\/[^\/]+\/[^\/]+\/)+/g;
    const matches = cleanedPath.match(duplicatePattern);

    if (matches && matches.length > 0) {
        // Keep only the first occurrence of the URL prefix
        const prefix = matches[0].match(/(https?:\/\/[^\/]+\/[^\/]+\/)/)?.[0] || '';
        cleanedPath = cleanedPath.replace(duplicatePattern, prefix);
    }

    // If the path contains 'undefined', replace it with the API_BASE_URL
    if (cleanedPath.includes('undefined')) {
        const cleanPath = cleanedPath.replace(/undefined\//g, '');
        return `${import.meta.env.VITE_API_BASE_URL}/${cleanPath}`;
    }

    // If it's already a full URL, return as is
    if (cleanedPath.startsWith('http://') || cleanedPath.startsWith('https://')) {
        return cleanedPath;
    }

    // Otherwise, prepend the API_BASE_URL
    return `${import.meta.env.VITE_API_BASE_URL}/${cleanedPath}`;
};

export const getVideoUrl = (videoPath: string | undefined): string => {
    if (!videoPath) return "";

    // Clean duplicate URL prefixes
    let cleanedPath = videoPath;
    const duplicatePattern = /(https?:\/\/[^\/]+\/[^\/]+\/)+/g;
    const matches = cleanedPath.match(duplicatePattern);

    if (matches && matches.length > 0) {
        const prefix = matches[0].match(/(https?:\/\/[^\/]+\/[^\/]+\/)/)?.[0] || '';
        cleanedPath = cleanedPath.replace(duplicatePattern, prefix);
    }

    // If the path contains 'undefined', replace it with the API_BASE_URL
    if (cleanedPath.includes('undefined')) {
        const cleanPath = cleanedPath.replace(/undefined\//g, '');
        return `${import.meta.env.VITE_API_BASE_URL}/${cleanPath}`;
    }

    // If it's already a full URL (including YouTube), return as is
    if (cleanedPath.startsWith('http://') || cleanedPath.startsWith('https://')) {
        return cleanedPath;
    }

    // Otherwise, prepend the API_BASE_URL
    return `${import.meta.env.VITE_API_BASE_URL}/${cleanedPath}`;
};
