import { useLogisticsController } from "./hooks/useLogisticsController";
// 추가
import React, { Suspense, useEffect } from "react";

const AdminConsolePage = React.lazy(() => import("./features/admin/AdminConsolePage"));
const AssistantWindowModal = React.lazy(() => import("./components/common/AssistantWindowModal"));
const ChatFloatingButton = React.lazy(() => import("./components/common/ChatFloatingButton"));
const ChatInboxPanel = React.lazy(() => import("./components/common/ChatInboxPanel"));
const ChatWindowModal = React.lazy(() => import("./components/common/ChatWindowModal"));
const DriverSignupPage = React.lazy(() => import("./pages/DriverSignupForm"));
const ForgotPasswordPage = React.lazy(() => import("./pages/ForgotPasswordPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const MessagesPage = React.lazy(() => import("./features/chat/MessagesPage"));
const NotificationPanel = React.lazy(() => import("./components/common/NotificationPanel"));
const NotificationsPage = React.lazy(() => import("./features/chat/NotificationsPage"));
const PaymentModal = React.lazy(() => import("./components/common/PaymentModal"));
const PaymentPage = React.lazy(() => import("./pages/PaymentPage"));
const PublicFooter = React.lazy(() => import("./features/public/components/publicFooter/PublicFooter"));
const PublicHomePage = React.lazy(() => import("./features/public/PublicHomePage"));
const PublicUserSearchPage = React.lazy(() => import("./features/public/users/PublicUserSearchPage"));
const QuoteDetailPage = React.lazy(() => import("./features/public/QuoteDetailPage"));
const QuoteListPage = React.lazy(() => import("./features/public/QuoteListPage"));
const QuoteRegisterPage = React.lazy(() => import("./features/public/QuoteRegisterPage"));
const ReceiptPdfBridge = React.lazy(() => import("./components/common/ReceiptPdfBridge"));
const RoundsLiteArena = React.lazy(() => import("./features/game/RoundsLiteArena"));
const ScrollTopFloatingButton = React.lazy(() => import("./components/common/ScrollTopFloatingButton"));
const ShipperSignupPage = React.lazy(() => import("./pages/ShipperSignupForm"));
const SignupPage = React.lazy(() => import("./pages/SignupPage"));
const TransportStatus = React.lazy(() => import("./pages/TransportStatus"));
const UserConsolePage = React.lazy(() => import("./features/user/UserConsolePage"));
const UserProfileModal = React.lazy(() => import("./components/common/UserProfileModal"));

const LANDING_STYLE_ROUTES = new Set([
  "main",
  "quotes",
  "detail",
  "register",
  "quoteRegister",
  "shippers",
  "drivers",
]);

const AUTH_STYLE_ROUTES = new Set([
  "login",
  "signup",
  "signup-shipper",
  "signup-driver",
  "forgot-password",
]);

function useRouteStyles(controller) {
  useEffect(() => {
    if (controller.routePage === "status") {
      import("./styles/transport-status.css");
    }

    if (
      LANDING_STYLE_ROUTES.has(controller.routePage) ||
      AUTH_STYLE_ROUTES.has(controller.routePage) ||
      controller.dashboardTab === "home"
    ) {
      import("./styles/landing.css");
    }

    if (
      controller.routePage === "dashboard" ||
      controller.isAdmin ||
      (!LANDING_STYLE_ROUTES.has(controller.routePage) &&
        !AUTH_STYLE_ROUTES.has(controller.routePage) &&
        controller.routePage !== "status")
    ) {
      import("./styles/console.css");
    }

    if (
      controller.routePage === "messages" ||
      controller.routePage === "notifications" ||
      (controller.isLoggedIn && !controller.isAdmin)
    ) {
      import("./styles/chat.css");
    }
  }, [
    controller.dashboardTab,
    controller.isAdmin,
    controller.isLoggedIn,
    controller.routePage,
  ]);
}

export default function App() {
  const controller = useLogisticsController();
  useRouteStyles(controller);

  const hasReceiptPdfQuery =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("receiptPdf");

  useEffect(() => {
    const kakaoJavascriptKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

    if (!window.Kakao || !kakaoJavascriptKey) return;

    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY);
    }
  }, []);

  if (hasReceiptPdfQuery) {
    return (
      <Suspense fallback={null}>
        <ReceiptPdfBridge />
      </Suspense>
    );
  }

  let page = null;

  if (controller.routePage === "payment") {
    page = <PaymentPage controller={controller} />;
  } else if (controller.routePage === "quotes") {
    page = <QuoteListPage controller={controller} />;
  } else if (controller.routePage === "detail") {
    page = (
      <QuoteDetailPage
        controller={controller}
        routeParams={controller.routeParams}
      />
    );
  } else if (controller.routePage === "register") {
    page = <QuoteRegisterPage controller={controller} />;
  } else if (controller.routePage === "quoteRegister") {
    page = <QuoteRegisterPage controller={controller} />;
  } else if (controller.routePage === "status") {
    page = <TransportStatus controller={controller} />;
  } else if (controller.routePage === "messages") {
    page = <MessagesPage controller={controller} />;
  } else if (controller.routePage === "notifications") {
    page = <NotificationsPage controller={controller} />;
  } else if (controller.routePage === "game") {
    page = <RoundsLiteArena controller={controller} />;
  } else if (controller.routePage === "shippers") {
    page = <PublicUserSearchPage controller={controller} role="SHIPPER" />;
  } else if (controller.routePage === "drivers") {
    page = <PublicUserSearchPage controller={controller} role="DRIVER" />;
  } else if (controller.routePage === "main") {
    page = <PublicHomePage controller={controller} />;
  } else if (controller.routePage === "login") {
    page = <LoginPage controller={controller} />;
  } else if (controller.routePage === "signup") {
    page = <SignupPage controller={controller} />;
  } else if (controller.routePage === "signup-shipper") {
    page = <ShipperSignupPage controller={controller} />;
  } else if (controller.routePage === "signup-driver") {
    page = <DriverSignupPage controller={controller} />;
  } else if (controller.routePage === "forgot-password") {
    page = <ForgotPasswordPage controller={controller} />;
  } else if (controller.routePage === "dashboard") {
    page = controller.isAdmin ? (
      <AdminConsolePage controller={controller} />
    ) : (
      <UserConsolePage controller={controller} />
    );
  } else if (controller.dashboardTab === "home") {
    page = <PublicHomePage controller={controller} />;
  } else if (controller.isAdmin) {
    page = <AdminConsolePage controller={controller} />;
  } else {
    page = <UserConsolePage controller={controller} />;
  }

  return (
    <Suspense fallback={null}>
      {page}

      {controller.profileModalOpen && (
        <UserProfileModal
          profile={controller.activeProfile}
          isLoggedIn={controller.isLoggedIn}
          onClose={controller.closeUserProfile}
          onOpenChat={controller.openChatWithUser}
        />
      )}

      {controller.chatModalOpen && controller.routePage !== "messages" && (
        <ChatWindowModal
          room={controller.chatRoom}
          draft={controller.chatDraft}
          setDraft={controller.setChatDraft}
          onSend={controller.handleSendChatMessage}
          onClose={controller.closeChatRoom}
          isSending={controller.chatSending}
        />
      )}

      {controller.paymentModalOpen && <PaymentModal controller={controller} />}

      {controller.isLoggedIn && !controller.isAdmin ? (
        <>
          <ScrollTopFloatingButton />
          <ChatFloatingButton
            unreadCount={controller.unreadChatCount}
            notificationUnreadCount={controller.notificationUnreadCount}
            onAssistantClick={controller.openAssistant}
            onChatClick={controller.openChatInbox}
            onNotificationClick={controller.openNotificationPanel}
            onGameClick={() => {
              controller.closeChatInbox();
              controller.closeNotificationPanel();
              controller.setChatModalOpen(false);
              controller.setRoutePage("game");
            }}
          />

          <AssistantWindowModal
            open={controller.assistantOpen}
            messages={controller.assistantMessages}
            draft={controller.assistantDraft}
            setDraft={controller.setAssistantDraft}
            onSend={controller.handleAssistantSend}
            onClose={controller.closeAssistant}
            isSending={controller.assistantSending}
            quickActions={controller.assistantQuickActions}
            onQuickAction={controller.handleAssistantQuickAction}
            onNavigate={controller.handleAssistantNavigate}
          />

          <ChatInboxPanel
            open={controller.chatInboxOpen}
            rooms={controller.chatRooms}
            onClose={controller.closeChatInbox}
            onOpenRoom={controller.openChatRoomFromSummary}
            onOpenMessagesPage={() => {
              controller.closeChatInbox();
              controller.setChatModalOpen(false);
              controller.setRoutePage("messages");
            }}
          />

          <NotificationPanel
            open={controller.notificationPanelOpen}
            summary={controller.notificationSummary}
            onClose={controller.closeNotificationPanel}
            onMarkAllRead={controller.handleMarkAllNotificationsRead}
            onOpenLink={controller.handleOpenNotificationLink}
            onOpenNotificationsPage={controller.openNotificationsPage}
          />
        </>
      ) : (
        <ScrollTopFloatingButton compact />
      )}

      {controller.routePage !== "dashboard" && <PublicFooter />}
    </Suspense>
  );
}
