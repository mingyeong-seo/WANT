import { useEffect, useMemo, useState } from 'react'
import { formatCurrency, formatDate, statusText } from '../../../utils/formatters'
import { formatMinutesToHourMinute } from '../../../utils/formatters'

const BOARD_PAGE_SIZE = 10

export default function PublicBoardSection({ controller }) {
  const {
    publicStatusFilter,
    setPublicStatusFilter,
    publicBoard,
    publicSelectedId,
    setPublicSelectedId,
    selectedPublic,
  } = controller

  const [boardPage, setBoardPage] = useState(1)

  const boardTotalPages = Math.max(1, Math.ceil(publicBoard.length / BOARD_PAGE_SIZE))

  const pagedPublicBoard = useMemo(() => {
    const startIndex = (boardPage - 1) * BOARD_PAGE_SIZE
    return publicBoard.slice(startIndex, startIndex + BOARD_PAGE_SIZE)
  }, [publicBoard, boardPage])

  useEffect(() => {
    setBoardPage(1)
  }, [publicStatusFilter])

  useEffect(() => {
    if (boardPage > boardTotalPages) {
      setBoardPage(boardTotalPages)
    }
  }, [boardPage, boardTotalPages])

  const handleStatusFilterClick = (status) => {
    setPublicStatusFilter(status)
    setBoardPage(1)
  }

  const handleBoardPageChange = (nextPage) => {
    setBoardPage(Math.min(Math.max(nextPage, 1), boardTotalPages))
  }

  return (
    <section className="landing-board" id="board">
      <div className="landing-board__inner">
        <div className="landing-sectionHead" data-reveal>
          <span>LIVE BOARD</span>
          <h2>실시간 배차 상태와 <br /> 핵심 지표로 확인하는 운송 흐름</h2>
          <p>배차 현황과 주요 지표를 실시간으로 제공해 전체 흐름을 한눈에 확인할 수 있습니다</p>
        </div>

        <div className="landing-filterRow" data-reveal>
          {['ALL', 'BIDDING', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED'].map((status) => (
            <button
              key={status}
              className={publicStatusFilter === status ? 'landing-filterChip active' : 'landing-filterChip'}
              onClick={() => handleStatusFilterClick(status)}
            >
              {status === 'ALL' ? '전체' : statusText(status)}
            </button>
          ))}
        </div>

        <div className="landing-boardGrid">
          <div className="landing-boardTableWrap" data-reveal>
            <table className="board-table landing-boardTable">
              <thead>
                <tr>
                  <th>상태</th>
                  <th>배차명</th>
                  <th>출발지</th>
                  <th>도착지</th>
                  <th>현재 위치</th>
                  <th>입찰 / 최저가</th>
                  <th>예상 시간</th>
                </tr>
              </thead>
              <tbody>
                {pagedPublicBoard.map((item) => (
                  <tr key={item.id} className={publicSelectedId === item.id ? 'is-selected' : ''} onClick={() => setPublicSelectedId(item.id)}>
                    <td><span className={`badge badge-${item.status.toLowerCase()}`}>{statusText(item.status)}</span></td>
                    <td><strong>{item.title}</strong><small>{item.cargoType} · {item.weightKg || 0}kg</small></td>
                    <td>{item.originSummary}</td>
                    <td>{item.destinationSummary}</td>
                    <td>{item.currentLocationSummary}</td>
                    <td>{item.offerCount}건 / {formatCurrency(item.bestOfferPrice)}</td>
                    {/* <td>{item.estimatedMinutes}분</td> */}
                    <td>{formatMinutesToHourMinute(item.estimatedMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="landing-boardPagination" aria-label="실시간 배차 목록 페이지 이동">
              <button
                type="button"
                className="landing-pageButton"
                onClick={() => handleBoardPageChange(boardPage - 1)}
                disabled={boardPage === 1}
              >
                이전
              </button>

              <div className="landing-pageNumbers">
                {Array.from({ length: boardTotalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={boardPage === page ? 'landing-pageNumber active' : 'landing-pageNumber'}
                    onClick={() => handleBoardPageChange(page)}
                    aria-current={boardPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="landing-pageButton"
                onClick={() => handleBoardPageChange(boardPage + 1)}
                disabled={boardPage === boardTotalPages}
              >
                다음
              </button>
            </div>
          </div>

          <aside className="landing-boardAside" data-reveal>
            {selectedPublic ? (
              <>
                <div className="landing-boardAside__head">
                  <span className="landing-miniEyebrow">LIVE SNAPSHOT</span>
                  <h3>{selectedPublic.title}</h3>
                  <span className={`badge badge-${selectedPublic.status.toLowerCase()}`}>{statusText(selectedPublic.status)}</span>
                </div>

                <div className="landing-boardAside__stats">
                  <div><span>출발지</span><strong>{selectedPublic.originSummary}</strong></div>
                  <div><span>도착지</span><strong>{selectedPublic.destinationSummary}</strong></div>
                  <div><span>현재 위치</span><strong>{selectedPublic.currentLocationSummary}</strong></div>
                  <div><span>최저 제안가</span><strong>{formatCurrency(selectedPublic.bestOfferPrice)}</strong></div>
                </div>

                <div className="landing-boardAside__list">
                  <div><span>예상 거리 / 시간</span>
                    {/* <strong>{selectedPublic.estimatedDistanceKm}km · {selectedPublic.estimatedMinutes}분</strong> */}
                    <strong>
                      {selectedPublic.estimatedDistanceKm}km · {formatMinutesToHourMinute(selectedPublic.estimatedMinutes)}
                    </strong>
                  </div>
                  <div><span>배정 차주</span><strong>{selectedPublic.assignedDriverName || '미확정'}</strong></div>
                  <div><span>최근 갱신</span><strong>{formatDate(selectedPublic.updatedAt)}</strong></div>
                </div>
              </>
            ) : (
              <div className="empty-box">표시할 배차가 없습니다.</div>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
