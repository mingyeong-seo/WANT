import { statusText, formatMinutesToHourMinute } from '../../../utils/formatters'
import { useEffect, useState, useMemo } from 'react'

export default function UserBookmarksTab({ controller }) {
  const { bookmarks, setSelectedId, setDashboardTab } = controller

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const pageSize = 5

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(item => {
      if (statusFilter === 'ALL') return true
      return item.status === statusFilter
    })
  }, [bookmarks, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredBookmarks.length / pageSize))
  const pagedBookmarks = filteredBookmarks.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const renderStatusFilter = (className = '') => (
    <div className={`board-filter driver bookmark-status-filter ${className}`.trim()}>
      <button
        className={statusFilter === 'ALL' ? 'active' : ''}
        onClick={() => setStatusFilter('ALL')}
      >
        전체
      </button>

      <button
        className={statusFilter === 'BIDDING' ? 'active' : ''}
        onClick={() => setStatusFilter('BIDDING')}
      >
        입찰중
      </button>

      <button
        className={statusFilter === 'IN_TRANSIT' ? 'active' : ''}
        onClick={() => setStatusFilter('IN_TRANSIT')}
      >
        운송중
      </button>

      <button
        className={statusFilter === 'CONFIRMED' ? 'active' : ''}
        onClick={() => setStatusFilter('CONFIRMED')}
      >
        확정
      </button>

      <button
        className={statusFilter === 'COMPLETED' ? 'active' : ''}
        onClick={() => setStatusFilter('COMPLETED')}
      >
        완료
      </button>
    </div>
  )

  return (
    <div className="bookmark-tab">
      {renderStatusFilter('bookmark-status-filter--external')}

      <div className="surface table-surface bookmark-table-surface">
        <div className="bookmark-table-wrap">
          <table className="board-table">
            <thead>
              <tr>
                <th>상태</th>
                <th>배차명</th>
                <th>구간</th>
                <th>차주</th>
                <th>예상</th>
              </tr>
            </thead>
            <tbody>
              {pagedBookmarks.map(item =>
                <tr key={item.id} onClick={() => { setSelectedId(item.id); setDashboardTab('board') }}>
                  <td>
                    <span className={`badge badge-${item.status.toLowerCase()}`}>
                      {statusText(item.status)}
                    </span>
                  </td>
                  <td>{item.title}</td>
                  <td>{item.originAddress} → {item.destinationAddress}</td>
                  <td>{item.assignedDriverName || '-'}</td>
                  {/* <td>{item.tracking?.remainingMinutes ?? item.estimatedMinutes}분</td> */}
                  <td>
                    {formatMinutesToHourMinute(
                      item.tracking?.remainingMinutes ?? item.estimatedMinutes
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bookmark-pagination" aria-label="즐겨찾기 페이지 이동">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(current => Math.max(1, current - 1))}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
              <button
                type="button"
                key={pageNumber}
                className={page === pageNumber ? 'active' : ''}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage(current => Math.min(totalPages, current + 1))}
            >
              ›
            </button>
          </div>
        )}

        <div className="bookmark-scroll-hint" aria-hidden="true">
          ↔ 좌우로 스크롤
        </div>
      </div>
    </div>
  )
}
