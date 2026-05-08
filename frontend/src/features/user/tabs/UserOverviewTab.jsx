import ProfilePreviewCard from '../../../components/common/ProfilePreviewCard'
import SectionTitle from '../../../components/common/SectionTitle'
import VehicleTypeSelector from '../../../components/common/VehicleTypeSelector'
// import { formatCurrency, resolveMediaUrl, statusText } from '../../../utils/formatters'
import { useRef, useState } from 'react'
import { parseVehicleTypeString, stringifyVehicleTypes } from '../../../constants/vehicleCatalog'
import { formatCurrency, resolveMediaUrl, statusText, formatRatingSummary, roleText } from '../../../utils/formatters'

function renderPenaltyStatus(profile) {
  if (!profile) return '정보 불러오는 중'
  if (profile.tradingBlockedUntil) return '거래 금지 적용 중'
  if (profile.matchingBlockedUntil) return '매칭 제한 적용 중'
  if (profile.highCancelBadge) return '취소율 높음 주의 상태'
  return '정상'
}

export default function UserOverviewTab({ controller }) {
  const {
    auth,
    profile,
    profileForm,
    setProfileForm,
    signupForm,
    handleSaveProfile,
    handleProfileImageFileChange,
    clearProfileImage,
    profileSaving,
    profileImageUploading,
    profileImageUploadError,
    selectedProfileImageName,
    profileSaveSuccessOpen,
    setProfileSaveSuccessOpen,
    roleTheme,
    summary,
    userAlerts,
    roleQuickActions,
    filteredShipments,
    bookmarks,
    setSelectedId,
    setDashboardTab,
  } = controller

  const profileImageInputRef = useRef(null)

  const penaltyScore = Number(profile?.penaltyScore30d || 0)
  const cancelRate = Number(profile?.cancelRate || 0)
  const penaltyStatus = renderPenaltyStatus(profile)
  const selectedVehicles = parseVehicleTypeString(profileForm.vehicleType)

  const [vehicleOpen, setVehicleOpen] = useState(false)

  // 추가
  const [inquiryOpen, setInquiryOpen] = useState(false)

  return (
    <div className="page-stack">
      {!auth.profileCompleted && (
        <div className="alert-info">
          첫 로그인입니다. 아래 선택 입력 정보를 저장하면 다음 로그인부터는 바로 메인으로 돌아가기합니다.
        </div>
      )}

      <div className="admin-grid-2">
        <div className="surface profile-edit-surface">
          {profileSaving && (
            <div className="profile-save-panelOverlay" role="status" aria-live="polite">
              <div className="transport-loadingCard profile-save-panelOverlay__card">
                <div className="transport-loadingBadge">PROFILE SAVE</div>
                <div className="transport-loadingVisual" aria-hidden="true">
                  <span className="transport-loadingDot transport-loadingDot--left" />
                  <span className="transport-loadingTrack">
                    <span className="transport-loadingTruck">🚚</span>
                  </span>
                  <span className="transport-loadingDot transport-loadingDot--right" />
                </div>
                <strong>회원정보를 저장하고 있어요</strong>
                <p>입력한 프로필 정보와 보유 차량 정보를 반영하는 중입니다.</p>
              </div>
            </div>
          )}

          {profileSaveSuccessOpen && (
            <div className="profile-save-panelOverlay profile-save-panelOverlay--success">
              <div className="transport-loadingCard profile-save-panelOverlay__card profile-save-panelOverlay__card--success">
                <div className="transport-loadingBadge">PROFILE SAVE</div>
                <strong>저장되었습니다.</strong>
                <p>회원정보가 정상적으로 저장되었습니다.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setProfileSaveSuccessOpen(false)}
                >
                  확인
                </button>
              </div>
            </div>
          )}

          <SectionTitle
            title="회원정보 수정"
            desc="기본 정보는 그대로 유지되며, 추가 정보는 자유롭게 입력할 수 있습니다."
          />

          <div className="form-stack">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
                <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
                  {profileForm.profileImageUrl ? (
                    <img
                      src={resolveMediaUrl(profileForm.profileImageUrl)}
                      alt="프로필 사진"
                      style={{
                        width: 96,
                        height: 96,
                        minWidth: 96,
                        minHeight: 96,
                        maxWidth: 96,
                        maxHeight: 96,
                        borderRadius: 14,
                        objectFit: 'cover',
                        display: 'block',
                        border: '1px solid var(--line)',
                        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
                        background: '#fff',
                      }}
                    />
                  ) : (
                    <div
                      className="identity-mark"
                      style={{
                        width: 96,
                        height: 96,
                        minWidth: 96,
                        minHeight: 96,
                        maxWidth: 96,
                        maxHeight: 96,
                        borderRadius: 14,
                        border: '1px solid var(--line)',
                        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
                        fontSize: 34,
                      }}
                    >
                      {(auth.name || '?').slice(0, 1)}
                    </div>
                  )}

                  <button
                    type="button"
                    aria-label="프로필 사진 선택"
                    onClick={() => profileImageInputRef.current?.click()}
                    style={{
                      position: 'absolute',
                      right: -8,
                      bottom: -8,
                      width: 32,
                      height: 32,
                      border: 0,
                      background: 'transparent',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.96)',
                        boxShadow: '0 6px 14px rgba(15, 23, 42, 0.20)',
                        fontSize: 14,
                        lineHeight: 1,
                      }}
                    >
                      📷
                    </span>
                  </button>

                  <input
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleProfileImageFileChange(file)
                      }
                      e.target.value = ''
                    }}
                  />
                </div>

                {profileImageUploading && (
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>이미지 업로드 중...</div>
                )}
                {!profileImageUploading && profileImageUploadError && (
                  <div style={{ fontSize: 14, color: 'var(--red)', fontWeight: 700, textAlign: 'center' }}>{profileImageUploadError}</div>
                )}

                {!!profileForm.profileImageUrl && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ minWidth: 190, alignSelf: 'center' }}
                    onClick={clearProfileImage}
                  >
                    기본 프로필로 돌아가기
                  </button>
                )}
              </div>
            </div>
            <textarea
              rows="3"
              placeholder="자기소개"
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            />
            <input
              placeholder="결제 수단 메모"
              value={profileForm.paymentMethod}
              onChange={(e) => setProfileForm({ ...profileForm, paymentMethod: e.target.value })}
            />
            <div className="split-2">
              <input
                placeholder="추가 이메일"
                value={profileForm.contactEmail}
                onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
              />
              <input
                placeholder="추가 연락처"
                value={profileForm.contactPhone}
                onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value })}
              />
            </div>

            {auth.role === 'DRIVER' && (
              <div className="form-stack">
                <strong style={{ display: 'block' }}>보유 차량 선택</strong>

                <input
                  className="login-input vehicle-input-large"
                  value={selectedVehicles.join(', ')}
                  readOnly
                  onClick={() => setVehicleOpen((prev) => !prev)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />

                {vehicleOpen && (
                  <div className="vehicle-selector-wrap">
                    <VehicleTypeSelector
                      values={selectedVehicles}
                      onChange={(values) =>
                        setProfileForm({
                          ...profileForm,
                          vehicleType: stringifyVehicleTypes(values),
                        })
                      }
                    />
                  </div>
                )}

                <button className="btn btn-primary" onClick={handleSaveProfile}>
                  회원정보 저장
                </button>

                {vehicleOpen && (
                  <div style={{ marginTop: 12 }}>
                    <small style={{ color: '#6f7b91' }}>
                      여러 차량을 동시에 선택할 수 있습니다.
                    </small>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="surface profile-edit-surface profile-preview-box">
          <SectionTitle title="공개 프로필 미리보기" desc="거래 상대가 확인할 수 있는 공개 정보입니다." />
          {/* <ProfilePreviewCard
            title="내 프로필"
            profile={
              profile
                ? { ...profile, role: auth.role }
                : {
                  ...profileForm,
                  name: auth.name,
                  role: auth.role,
                  companyName: signupForm.companyName,
                  vehicleType: profileForm.vehicleType || signupForm.vehicleType,
                  averageRating: profile?.averageRating,
                  ratingCount: profile?.ratingCount,
                  completedCount: profile?.completedCount,
                }
            }
          /> */}


          <article className="public-directory-card surface">
            <div className="public-directory-card__head">
              <div className="public-directory-card__profileTrigger">
                <img
                  src={
                    resolveMediaUrl(profileForm.profileImageUrl) ||
                    "/images/default-profile.png"
                  }
                  alt={auth.name}
                  className="public-directory-card__avatar"
                />
                <div className="public-directory-card__profileText">
                  <span>{roleText(auth.role)}</span>
                  <h3>{auth.name}</h3>
                </div>
              </div>

              <strong>
                {formatRatingSummary(
                  profile?.averageRating,
                  profile?.ratingCount
                )}
              </strong>
            </div>

            <div className="public-directory-card__stats">
              <div>
                <span>{auth.role === "DRIVER" ? "차량 정보" : "회사명"}</span>
                <strong>
                  {auth.role === "DRIVER"
                    ? profileForm.vehicleType || "-"
                    : profileForm.companyName || signupForm.companyName || "-"}
                </strong>
              </div>
              <div>
                <span>{auth.role === "DRIVER" ? "완료 건수" : "이용 횟수"}</span>
                <strong>{profile?.completedCount || 0}건</strong>
              </div>
            </div>

            <dl className="public-directory-card__info">
              <div>
                <dt>연락 이메일</dt>
                <dd>{profileForm.contactEmail || "-"}</dd>
              </div>
              <div>
                <dt>연락처</dt>
                <dd>{profileForm.contactPhone || "-"}</dd>
              </div>
            </dl>

            <p>
              {profileForm.bio ||
                (auth.role === "DRIVER"
                  ? "등록된 차주 소개가 없습니다."
                  : "등록된 화주 소개가 없습니다.")}
            </p>
          </article>


        </div>
      </div>

      <div className="kpi-grid mypage-kpi">
        <div className="kpi-card"><span>전체 배차</span><strong>{summary.total}</strong></div>
        <div className="kpi-card"><span>입찰중</span><strong>{summary.bidding}</strong></div>
        <div className="kpi-card"><span>운행중</span><strong>{summary.live}</strong></div>
        <div className="kpi-card"><span>완료</span><strong>{summary.completed}</strong></div>
      </div>

      <div className="surface">
        <SectionTitle
          title="패널티 현황"
          desc="현재 패널티 상태를 간단히 확인할 수 있습니다."
        />

        <div className="penalty-kpi-wrap">
          <div className="kpi-grid">
            <div className="kpi-card">
              <span>현재 상태</span>
              <strong>{penaltyStatus}</strong>
            </div>
            <div className="kpi-card">
              <span>최근 30일 패널티 점수</span>
              <strong>{penaltyScore}점</strong>
            </div>
            <div className="kpi-card">
              <span>최근 취소율</span>
              <strong>{cancelRate.toFixed(1)}%</strong>
            </div>
            <div className="kpi-card">
              <span>취소율 높음 뱃지</span>
              <strong>{profile?.highCancelBadge ? '표시 중' : '없음'}</strong>
            </div>
          </div>
        </div>

        {/* <div className="admin-grid-2" style={{ marginTop: 16 }}>
          <div className="surface-sub">
            <span>상세 확인</span>
            <button className="btn btn-secondary" onClick={() => setDashboardTab('penalty')}>
              패널티 탭 보기
            </button>
          </div>
        </div> */}
      </div>

      {/* <section className={`role-banner role-banner-${roleTheme?.accent || 'shipper'}`}>
        <div>
          <div className="eyebrow">ROLE FOCUSED THEME</div>
          <h2>{roleTheme?.label}</h2>
          <p>{roleTheme?.summary}</p>
        </div>
        <div className="role-banner-notes">
          {(roleTheme?.bullets || []).map((item) => <span key={item}>{item}</span>)}
        </div>
      </section> */}

      {/* <div className="kpi-grid">
        <div className="kpi-card"><span>전체 배차</span><strong>{summary.total}</strong></div>
        <div className="kpi-card"><span>입찰중</span><strong>{summary.bidding}</strong></div>
        <div className="kpi-card"><span>운행중</span><strong>{summary.live}</strong></div>
        <div className="kpi-card"><span>완료</span><strong>{summary.completed}</strong></div>
      </div> */}

      {/* <div className="admin-grid-2">
        <div className="surface profile-edit-surface">
          <SectionTitle title="운영 알림" desc="역할에 따라 먼저 봐야 할 항목을 자동으로 묶었습니다." />
          <div className="signal-grid">
            {userAlerts.map((item) => (
              <div key={item.title} className="signal-card">
                <span>{item.title}</span>
                <strong>{item.value}</strong>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface profile-edit-surface">
          <SectionTitle title="빠른 액션" desc="자주 쓰는 흐름으로 바로 이동합니다." />
          <div className="shortcut-grid">
            {roleQuickActions.map((item) => (
              <button key={item.title} className="shortcut-card" onClick={item.action}>
                <strong>{item.title}</strong>
                <small>{item.desc}</small>
                <span>{item.cta}</span>
              </button>
            ))}
          </div>
        </div>
      </div> */}

      <div className="admin-grid-2">
        {/* <div className="surface profile-edit-surface">
          <SectionTitle title="공지 사항" />
          <table className="board-table compact">
            <thead>
              <tr>
                <th>상태</th>
                <th>제목</th>
                <th>구간</th>
                <th>입찰</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.slice(0, 8).map((item) => (
                <tr
                  key={item.id}
                  onClick={() => {
                    if (item.canAccessDetail !== false) {
                      setSelectedId(item.id)
                      setDashboardTab('board')
                    }
                  }}
                >
                  <td><span className={`badge badge-${item.status.toLowerCase()}`}>{statusText(item.status)}</span></td>
                  <td>
                    {item.title}
                    {auth.role === 'DRIVER' && (
                      <small>{item.assignedToMe ? '내 배차' : item.hasMyOffer ? '내 입찰' : '공개 배차'}</small>
                    )}
                  </td>
                  <td>{item.originAddress} → {item.destinationAddress}</td>
                  <td>{item.offerCount}건 / {formatCurrency(item.bestOfferPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}
        <div className="surface profile-edit-surface">
          <SectionTitle title="공지사항" />

          <article className="landing-infoPanel">
            {/* <div className="landing-infoPanel__top">
              <span>공지사항</span>
              <strong>운영 안내</strong>
            </div> */}

            <div className="landing-noticeList">
              {(controller.publicData?.notices || []).map((notice) => (
                <div key={notice.id} className="landing-noticeItem">
                  <div className="landing-noticeItem__meta">
                    <em>{notice.category}</em>
                    {notice.pinned && <b>중요</b>}
                  </div>
                  <strong>{notice.title}</strong>
                  <p>{notice.summary}</p>
                  <small>{notice.publishedAt}</small>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="surface profile-edit-surface">
          <SectionTitle
            title="관심 견적"
            desc="최신순"
          />
          <div className="list-stack">
            {bookmarks.length ? (
              // bookmarks.slice(0, 5).map((item) => (
              bookmarks
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((item) => (
                  <button
                    key={item.id}
                    className="bookmark-item"
                    onClick={() => {
                      setSelectedId(item.id)
                      setDashboardTab('board')
                    }}
                  >
                    {/* <strong>{item.title}</strong>
                  <small>{item.originAddress} → {item.destinationAddress}</small>
                  <span>{statusText(item.status)}</span> */}
                    <div className="bookmark-top">
                      <strong>{item.title}</strong>
                      <span className="bookmark-status">{statusText(item.status)}</span>
                    </div>

                    <div className="bookmark-address">
                      {item.originAddress} → {item.destinationAddress}
                    </div>
                  </button>
                ))
            ) : (
              <div className="empty-box small">즐겨찾기한 배차가 없습니다.</div>
            )}
          </div>
        </div>
      </div>


      <div className="admin-grid-2">

        <div className="surface profile-edit-surface">
          <SectionTitle title="자주 묻는 질문" desc="서비스 이용 중 자주 묻는 질문을 확인할 수 있습니다." />
          <div className="faq-section">
            <div className="landing-faqList">
              {(controller.publicData?.faqs || []).map((faq) => (
                <details key={faq.id} className="landing-faqItem">
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <div className="surface profile-edit-surface">
          <SectionTitle title="문의하기" desc="이용 중 궁금한 점이나 도움이 필요하면 문의해 주세요." />

          <div className="landing-formStack">
            <input
              placeholder="회사명"
              value={controller.inquiryForm.companyName}
              onChange={(e) =>
                controller.setInquiryForm({
                  ...controller.inquiryForm,
                  companyName: e.target.value,
                })
              }
            />

            <div className="landing-split2">
              <input
                placeholder="담당자명"
                value={controller.inquiryForm.contactName}
                onChange={(e) =>
                  controller.setInquiryForm({
                    ...controller.inquiryForm,
                    contactName: e.target.value,
                  })
                }
              />
              <input
                placeholder="연락처"
                value={controller.inquiryForm.phone}
                onChange={(e) =>
                  controller.setInquiryForm({
                    ...controller.inquiryForm,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            <input
              placeholder="이메일"
              value={controller.inquiryForm.email}
              onChange={(e) =>
                controller.setInquiryForm({
                  ...controller.inquiryForm,
                  email: e.target.value,
                })
              }
            />

            {/* <select
              value={controller.inquiryForm.inquiryType}
              onChange={(e) =>
                controller.setInquiryForm({
                  ...controller.inquiryForm,
                  inquiryType: e.target.value,
                })
              }
            >
              <option>도입 문의</option>
              <option>데모 요청</option>
              <option>요금 상담</option>
              <option>기술 협의</option>
            </select> */}

            <div className={`custom-select ${auth.role === 'DRIVER' ? 'driver' : 'shipper'}`}>
              <div
                className="selected"
                onClick={() => setInquiryOpen(!inquiryOpen)}
              >
                {controller.inquiryForm.inquiryType || '문의 유형 선택'}
              </div>

              {inquiryOpen && (
                <div className="options">
                  {['도입 문의', '데모 요청', '요금 상담', '기술 협의'].map(option => (
                    <div
                      key={option}
                      className={`option ${controller.inquiryForm.inquiryType === option ? 'selected-option' : ''}`}
                      onClick={() => {
                        controller.setInquiryForm({
                          ...controller.inquiryForm,
                          inquiryType: option,
                        })
                        setInquiryOpen(false)
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea
              rows="6"
              placeholder="문의 내용을 입력해주세요"
              value={controller.inquiryForm.message}
              onChange={(e) =>
                controller.setInquiryForm({
                  ...controller.inquiryForm,
                  message: e.target.value,
                })
              }
            />

            <button
              className="btn btn-primary"
              onClick={controller.handleInquiry}
            >
              문의 접수
            </button>
          </div>
        </div>

      </div>
    </div >
  )
}
