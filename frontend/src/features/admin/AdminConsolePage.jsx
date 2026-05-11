import ConsoleLayout from '../../components/layout/ConsoleLayout'
import AdminSidebar from './components/AdminSidebar'
import AdminTopbar from './components/AdminTopbar'
import { ADMIN_TITLES } from './components/adminConfig'
import AdminFaqsTab from './tabs/AdminFaqsTab'
import AdminFinanceTab from './tabs/AdminFinanceTab'
import AdminInquiriesTab from './tabs/AdminInquiriesTab'
import AdminIssuesTab from './tabs/AdminIssuesTab'
import AdminMembersTab from './tabs/AdminMembersTab'
import AdminPenaltyTab from './tabs/AdminPenaltyTab'
import AdminNoticesTab from './tabs/AdminNoticesTab'
import AdminOverviewTab from './tabs/AdminOverviewTab'
import AdminAssistantTab from './tabs/AdminAssistantTab'
import AdminRatingsTab from './tabs/AdminRatingsTab'
import AdminShipmentsTab from './tabs/AdminShipmentsTab'

const TAB_COMPONENTS = {
  overview: AdminOverviewTab,
  members: AdminMembersTab,
  penalties: AdminPenaltyTab,
  shipments: AdminShipmentsTab,
  finance: AdminFinanceTab,
  ratings: AdminRatingsTab,
  notices: AdminNoticesTab,
  faqs: AdminFaqsTab,
  inquiries: AdminInquiriesTab,
  issues: AdminIssuesTab,
  assistant: AdminAssistantTab,
}

export default function AdminConsolePage({ controller }) {
  const ActiveTab = TAB_COMPONENTS[controller.dashboardTab] || AdminOverviewTab
  const title = ADMIN_TITLES[controller.dashboardTab] || '관리자 콘솔'

  return (
    <ConsoleLayout
      sidebar={<AdminSidebar auth={controller.auth} dashboardTab={controller.dashboardTab} setDashboardTab={controller.setDashboardTab} logout={controller.logout} goToMain={() => controller.goToMainSection()} />}
      topbar={<AdminTopbar title={title} />}
      message={controller.message}
    >
      <ActiveTab controller={controller} />
    </ConsoleLayout>
  )
}
