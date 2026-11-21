import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import as from './locales/as.json';
import en from './locales/en.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import ar from './locales/ar.json';
import ur from './locales/ur.json';
i18n.use(initReactI18next).init({
    resources: {
        as: { translation: as },
        en: { translation: en },
        hi: { translation: hi },
        bn: { translation: bn },
        ar: { translation: ar },
        ur: { translation: ur }
    },
    lng: "en",
    fallbacking: "en",
    interpolation: { escapeValue: false }
});
export default i18n;