import enCommon from "../public/locales/en/common.json";
import enDashboard from "../public/locales/en/dashboard.json";
import enMenu from "../public/locales/en/menu.json";
import enUser from "../public/locales/en/user.json";

export const resources = {
  common: enCommon,
  user: enUser,
  dashboard: enDashboard,
  menu: enMenu,
} as const;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: (typeof resources)["common"];
      user: (typeof resources)["user"];
      dashboard: (typeof resources)["dashboard"];
      menu: (typeof resources)["menu"];
    };
  }
}
