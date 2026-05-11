import { useMemo, useState } from 'react'
import Pagination from '../../../components/common/Pagination'
import SectionTitle from '../../../components/common/SectionTitle'
import useClientPagination from '../../../hooks/useClientPagination'
import { formatDate, memberStatusText, roleText } from '../../../utils/formatters'

function isFutureDateTime(value) {
  if (!value) return false
  const time = new Date(value).getTime()
  return !Number.isNaN(time) && time > Date.now()
}

function toDateTimeLocalValue(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 16)
}

function normalizeDateTimeLocal(value) {
  if (!value) return null
  return value.length === 16 ? `${value}:00` : value
}

function getPenaltyStatus(member) {
  if (isFutureDateTime(member.tradingBlockedUntil)) return '거래 금지 적용 중'
  if (isFutureDateTime(member.matchingBlockedUntil)) return '매칭 제한 적용 중'
  return '정상'
}

function createInitialForm(member) {
  return {
    penaltyScore30d: String(member.penaltyScore30d ?? 0),
    matchingBlockedUntil: toDateTimeLocalValue(member.matchingBlockedUntil),
    tradingBlockedUntil: toDateTimeLocalValue(member.tradingBlockedUntil),
    note: '',
  }
}

export default function AdminPenaltyTab({ controller }) {
  const { adminMembers, handleUpdateMemberPenalty } = controller
  const [keyword, setKeyword] = useState('')
  const [drafts, setDrafts] = useState({})

  const filteredMembers = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    if (!normalized) return adminMembers

    return adminMembers.filter((member) => {
      const source = [
        member.name,
        member.email,
        member.phone,
        roleText(member.role),
        member.companyName,
        member.vehicleType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return source.includes(normalized)
    })
  }, [adminMembers, keyword])

  const { pagedItems, page, setPage, totalPages } = useClientPagination(filteredMembers, 8)

  const getDraft = (member) => drafts[member.id] || createInitialForm(member)

  const updateDraft = (member, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [member.id]: {
        ...getDraft(member),
        [field]: value,
      },
    }))
  }

  const resetDraft = (member) => {
    setDrafts((prev) => ({
      ...prev,
      [member.id]: {
        penaltyScore30d: '0',
        matchingBlockedUntil: '',
        tradingBlockedUntil: '',
        note: '관리자 패널티 해제',
      },
    }))
  }

  const submitPenalty = async (member) => {
    const draft = getDraft(member)
    const score = Number.parseInt(draft.penaltyScore30d, 10)

    await handleUpdateMemberPenalty(member.id, {
      penaltyScore30d: Number.isNaN(score) ? 0 : Math.max(0, score),
      matchingBlockedUntil: normalizeDateTimeLocal(draft.matchingBlockedUntil),
      tradingBlockedUntil: normalizeDateTimeLocal(draft.tradingBlockedUntil),
      note: draft.note,
    })
  }

  return (
    <div className="page-stack">
      <div className="surface">
        <SectionTitle
          title="패널티 관리"
          desc="관리자가 회원별 패널티 점수와 매칭 제한/거래 금지 해제 시각을 직접 지정합니다. 종료 시각이 지난 값은 거래 차단 조건으로 보지 않습니다."
        />

        <div className="toolbar-row">
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value)
              setPage(1)
            }}
            placeholder="이름, 이메일, 연락처, 역할로 검색"
          />
          <span className="muted">총 {filteredMembers.length}명</span>
        </div>

        <table className="board-table compact">
          <thead>
            <tr>
              <th>회원</th>
              <th>현재 상태</th>
              <th>패널티 점수</th>
              <th>매칭 제한 해제 시각</th>
              <th>거래 금지 해제 시각</th>
              <th>관리</th>
            </tr>
          </thead>

          <tbody>
            {pagedItems.map((member) => {
              const draft = getDraft(member)
              const status = getPenaltyStatus(member)

              return (
                <tr key={member.id}>
                  <td>
                    <strong>{member.name}</strong>
                    <small>{member.email}</small>
                    <small>{roleText(member.role)} · {memberStatusText(member.status)}</small>
                  </td>
                  <td>
                    <strong>{status}</strong>
                    <small>현재 점수 {member.penaltyScore30d ?? 0}점</small>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={draft.penaltyScore30d}
                      onChange={(event) => updateDraft(member, 'penaltyScore30d', event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="datetime-local"
                      value={draft.matchingBlockedUntil}
                      onChange={(event) => updateDraft(member, 'matchingBlockedUntil', event.target.value)}
                    />
                    <small>{member.matchingBlockedUntil ? formatDate(member.matchingBlockedUntil) : '-'}</small>
                  </td>
                  <td>
                    <input
                      type="datetime-local"
                      value={draft.tradingBlockedUntil}
                      onChange={(event) => updateDraft(member, 'tradingBlockedUntil', event.target.value)}
                    />
                    <small>{member.tradingBlockedUntil ? formatDate(member.tradingBlockedUntil) : '-'}</small>
                  </td>
                  <td>
                    <div className="table-actions vertical">
                      <input
                        value={draft.note}
                        onChange={(event) => updateDraft(member, 'note', event.target.value)}
                        placeholder="관리 메모"
                      />
                      <button className="btn btn-primary" onClick={() => submitPenalty(member)}>
                        적용
                      </button>
                      <button className="btn btn-ghost" onClick={() => resetDraft(member)}>
                        해제값 입력
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
