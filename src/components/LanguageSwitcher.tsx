import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { useEffect } from 'react';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ar' ? 'en' : 'ar';
        i18n.changeLanguage(newLang);
    };

    useEffect(() => {
        document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    return (
        <Button
            variant="ghost"
            onClick={toggleLanguage}
            className="font-bold text-lg"
        >
            {i18n.language === 'ar' ? 'English' : 'العربية'}
        </Button>
    );
};

export default LanguageSwitcher;
