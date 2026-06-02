import { useState } from "react"
import SectionTitle from '../../../components/common/SectionTitle'
import { formatCurrency, formatDate, transactionTypeText } from '../../../utils/formatters'
import ReceiptModal from "../../../components/common/ReceiptModal"
import { fetchReceipt } from "../../../api"

const emptyReceiptModalState = {
  open: false,
  loading: false,
  error: "",
  data: null,
}

export default function UserFinanceTab({ controller }) {
  const { auth, profile, financeSummary, financeTransactions } = controller

  const [receiptModal, setReceiptModal] = useState(emptyReceiptModalState)

  const handleRowClick = async (shipmentId) => {
    if (!shipmentId) return

    setReceiptModal({
      open: true,
      loading: true,
      error: "",
      data: null,
    })

    try {
      const data = await fetchReceipt(shipmentId)
      setReceiptModal({
        open: true,
        loading: false,
        error: "",
        data,
      })
    } catch (e) {
      console.error("영수증 조회 실패", e)
      setReceiptModal({
        open: true,
        loading: false,
        error: e?.response?.data?.message || "영수증을 불러오지 못했습니다.",
        data: null,
      })
    }
  }

  const handleClose = () => {
    setReceiptModal(emptyReceiptModalState)
  }

  if (!financeSummary) return null

  return (
    <div className="page-stack">
      <div className="kpi-grid">
        {auth.role === 'SHIPPER' ? (
          <>
            <div className="kpi-card"><span>총 사용 금액</span><strong>{formatCurrency(financeSummary.totalSpent)}</strong><p>완료 정산 기준 누적</p></div>
            <div className="kpi-card"><span>지불 수수료</span><strong>{formatCurrency(0)}</strong><p>수수료는 차주 정산 금액에서만 차감됩니다.</p></div>
            <div className="kpi-card"><span>완료 배차</span><strong>{financeSummary.completedShipmentCount}건</strong></div>
            <div className="kpi-card"><span>운송비 할인 쿠폰</span><strong>{profile?.discountCouponCount || 0}장</strong><p>미니게임 보상 · 운송비 5% 할인</p></div>
          </>
        ) : (
          <>
            <div className="kpi-card"><span>총 수익 원금</span><strong>{formatCurrency(financeSummary.totalGrossEarned)}</strong><p>수수료 차감 전</p></div>
            <div className="kpi-card"><span>실수익</span><strong>{formatCurrency(financeSummary.totalNetEarned)}</strong><p>{financeSummary.serviceFeeRate}% 수수료 차감 후</p></div>
            <div className="kpi-card"><span>차감 수수료</span><strong>{formatCurrency(financeSummary.totalFeePaid)}</strong></div>
            <div className="kpi-card"><span>수수료 할인 쿠폰</span><strong>{profile?.driverFeeCouponCount || 0}장</strong><p>미니게임 보상 · 정산 수수료 50% 할인</p></div>
          </>
        )}
      </div>

      <div className="surface">
        <SectionTitle
          title={auth.role === 'SHIPPER' ? '결제 내역' : '정산 상세 내역'}
          desc={auth.role === 'SHIPPER'
            ? '확정된 운임 내역과 결제 금액을 확인할 수 있습니다. 항목을 클릭하면 영수증을 확인할 수 있습니다.'
            : '운임, 수수료, 정산 금액을 한눈에 확인할 수 있습니다. 항목을 클릭하면 영수증을 확인할 수 있습니다.'}
        />
        <div className="finance-table-scroll">
          <table className="board-table compact">
            <thead>
              <tr>
                <th>유형</th>
                <th>화물</th>
                <th>거래액</th>
                <th>수수료</th>
                <th>최종 반영액</th>
                <th>일시</th>
              </tr>
            </thead>

            <tbody>
              {financeTransactions.map(item => (
                <tr
                  key={item.id}
                  className={item.shipmentId ? 'receipt-row' : ''}
                  onClick={() => handleRowClick(item.shipmentId)}
                  style={{ cursor: item.shipmentId ? 'pointer' : 'default' }}
                  title={item.shipmentId ? '클릭하여 영수증 보기' : ''}
                >
                  <td>{transactionTypeText(item.type)}</td>
                  <td>
                    {item.shipmentTitle || '-'}
                    <small>
                      #{item.shipmentId || '-'}
                      {item.shipmentId ? ' · 영수증 보기' : ''}
                    </small>
                  </td>
                  <td>{formatCurrency(item.grossAmount)}</td>
                  <td>{formatCurrency(item.feeAmount)}</td>
                  <td>{formatCurrency(item.netAmount)}</td>
                  <td>{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReceiptModal
        open={receiptModal.open}
        data={receiptModal.data}
        isLoading={receiptModal.loading}
        error={receiptModal.error}
        onClose={handleClose}
        role={auth.role}
      />
    </div>
  )
}
