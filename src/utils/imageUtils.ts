// Helper function to fix image URLs from backend
export const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return "/placeholder-course.png";

    // If the path contains 'undefined', replace it with the API_BASE_URL
    if (imagePath.includes('undefined')) {
        // Remove 'undefined/' from the path
        const cleanPath = imagePath.replace(/undefined\//g, '');
        return `${import.meta.env.VITE_API_BASE_URL}/${cleanPath}`;
    }

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Otherwise, prepend the API_BASE_URL
    return `${import.meta.env.VITE_API_BASE_URL}/${imagePath}`;
};
