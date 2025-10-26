import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(detector)
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath:
        import.meta.env.PUBLIC_I18N_PATH + "locales/{{lng}}/{{ns}}.json",
      crossOrigin: true,
      queryStringParams: {
        v: import.meta.env.PUBLIC_I18N_VERSION,
      },
    },
    ns: ["common", "menu"],
    defaultNS: "common",
    // 备用语言
    fallbackLng: "en",
    // 插值方式
    interpolation: {
      // 不转义 html 标签，避免 XSS 攻击
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
