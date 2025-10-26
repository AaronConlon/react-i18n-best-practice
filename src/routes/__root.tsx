import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

const RootLayout = () => {
  const { i18n, t } = useTranslation("menu");

  return (
    <>
      <div className="header">
        <Link to="/" className="header-link">
          {t("home")}
        </Link>{" "}
        <Link to="/about" className="header-link">
          {t("about")}
        </Link>
        <Link to="/test" className="header-link">
          {t("test")}
        </Link>
        {/* language selector */}
        <select
          className="language-selector"
          value={i18n.language}
          onChange={async (e) => {
            const newLang = e.target.value;
            // save to cookie
            // document.cookie = `i18nextLng=${newLang}; path=/`;
            await i18n.changeLanguage(newLang);
          }}
        >
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="zh">中文</option>
        </select>
      </div>
      <Outlet />
    </>
  );
};

export const Route = createRootRoute({
  component: RootLayout,
  pendingComponent: () => (
    <div className="loading">Loading at root layout...</div>
  ),
});
