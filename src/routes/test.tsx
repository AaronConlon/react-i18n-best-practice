import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/test")({
  component: RouteComponent,
  notFoundComponent: () => <div>Not found</div>,
  errorComponent: () => <div>Error</div>,
  pendingComponent: () => <div>Loading at test route...</div>,
});

// ✅ 注意：普通函数组件（非 async）
function RouteComponent() {
  // use() 在这里同步调用，React 会 Suspense 挂起，直到 Promise resolve
  const { t } = useTranslation();
  const { t: tUser } = useTranslation("user");

  return (
    <div>
      <div>Hello "/test"! </div>
      <div>welcome:{t("welcome")}</div>
      <div>profile:{tUser("profile")}</div>
    </div>
  );
}
