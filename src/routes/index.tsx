import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  pendingComponent: () => <div className="loading">Loading at index...</div>,
  notFoundComponent: () => (
    <div className="not-found">Not found in index...</div>
  ),
});

function RouteComponent() {
  const { t } = useTranslation();
  const { t: tUser } = useTranslation("user");
  const { t: tDashboard } = useTranslation("dashboard");
  return (
    <div className="content">
      {/* common namespace */}
      <div className="common">{t("welcome")}</div>
      <div className="common">{t("loading")}</div>
      <br />
      {/* user namespace */}
      <div className="user">{tUser("profile")}</div>
      {/* dashboard namespace */}
      <div className="dashboard">{tDashboard("overview")}</div>
    </div>
  );
}
