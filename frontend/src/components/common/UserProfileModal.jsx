import { formatRatingSummary, resolveMediaUrl, roleText } from '../../utils/formatters'

export default function UserProfileModal({ profile, isLoggedIn, onClose, onOpenChat }) {
  if (!profile) return null

  const normalizedRole = String(profile.role || '').toUpperCase()
  const isDriver = normalizedRole === 'DRIVER'
  const isShipper = normalizedRole === 'SHIPPER'

  const getProfileImage = () => {
    return resolveMediaUrl(profile.profileImageUrl) || '/images/default-profile.png'
  }

  const detailItems = [
    isDriver
      ? { label: '차종', value: profile.vehicleType || '-' }
      : { label: '회사명', value: profile.companyName || '-' },
    { label: '연락 이메일', value: profile.contactEmail || '-' },
    { label: '연락처', value: profile.contactPhone || '-' },
    { label: '완료 건수', value: `${profile.completedCount || 0}건` },
  ]

  const fallbackBio = isDriver
    ? '등록된 차주 소개가 없습니다.'
    : isShipper
      ? '등록된 화주 소개가 없습니다.'
      : '등록된 소개가 없습니다.'

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="profile-modal profile-modal--user" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="profile-modal__head">
          <img
            src={getProfileImage()}
            alt={profile.name}
            className="profile-modal__avatar"
            onError={(e) => {
              e.currentTarget.src = '/images/default-profile.png'
            }}
          />
          <div className="profile-modal__summary">
            <div className="profile-modal__role">{roleText(profile.role)}</div>
            <h3>{profile.name}</h3>
            <p>{formatRatingSummary(profile.averageRating, profile.ratingCount)}</p>
          </div>
        </div>

        <div className="profile-modal__grid">
          {detailItems.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        <div className="profile-modal__bio">
          <span>소개</span>
          <p>{profile.bio || fallbackBio}</p>
        </div>

        <div className="profile-modal__actions">
          {isLoggedIn ? (
            <button className="btn btn-primary" onClick={() => onOpenChat(profile)}>
              1대1 채팅
            </button>
          ) : (
            <small>1대1 채팅은 로그인 후 사용할 수 있습니다.</small>
          )}
        </div>
      </div>
    </div>
  )
}
