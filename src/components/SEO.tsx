import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
    title: string;
    description?: string;
    name?: string;
    type?: string;
    keywords?: string;
}

const SEO = ({ title, description, name, type = 'website', keywords }: SEOProps) => {
    const { t } = useTranslation();
    const siteTitle = 'Avinar - Learning Platform';

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{`${title} | ${siteTitle}`}</title>
            <meta name='description' content={description || t('seo.defaultDescription', 'Join Avinar to learn from the best instructors.')} />
            <meta name='keywords' content={keywords || 'education, online courses, learning, avinar'} />

            {/* End standard metadata tags */}

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {/* End Facebook tags */}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name || 'Avinar'} />
            <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {/* End Twitter tags */}
        </Helmet>
    );
}

export default SEO;
