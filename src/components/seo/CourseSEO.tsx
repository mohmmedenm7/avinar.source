import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOMetaTags {
    title: string;
    description: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
    canonicalUrl?: string;
}

interface CourseSEOProps {
    metaTags: SEOMetaTags;
    structuredData?: object;
}

/**
 * SEO Component for Course Pages
 * Adds meta tags and JSON-LD structured data for Google
 */
export const CourseSEO = ({ metaTags, structuredData }: CourseSEOProps) => {
    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{metaTags.title}</title>
            <meta name="description" content={metaTags.description} />
            {metaTags.keywords && <meta name="keywords" content={metaTags.keywords} />}

            {/* Open Graph (Facebook, LinkedIn) */}
            <meta property="og:title" content={metaTags.ogTitle || metaTags.title} />
            <meta property="og:description" content={metaTags.ogDescription || metaTags.description} />
            {metaTags.ogImage && <meta property="og:image" content={metaTags.ogImage} />}
            <meta property="og:type" content={metaTags.ogType || 'website'} />
            {metaTags.canonicalUrl && <meta property="og:url" content={metaTags.canonicalUrl} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content={metaTags.twitterCard || 'summary_large_image'} />
            <meta name="twitter:title" content={metaTags.ogTitle || metaTags.title} />
            <meta name="twitter:description" content={metaTags.ogDescription || metaTags.description} />
            {metaTags.ogImage && <meta name="twitter:image" content={metaTags.ogImage} />}

            {/* Canonical URL */}
            {metaTags.canonicalUrl && <link rel="canonical" href={metaTags.canonicalUrl} />}

            {/* JSON-LD Structured Data for Google */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

// Simple page SEO for non-course pages
interface PageSEOProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
}

export const PageSEO = ({ title, description, keywords, image }: PageSEOProps) => {
    return (
        <Helmet>
            <title>{title} | AVinar Academy</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta property="og:title" content={`${title} | AVinar Academy`} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
    );
};

export default CourseSEO;
