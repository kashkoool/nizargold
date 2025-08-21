import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Edit, 
  Save, 
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Crown
} from 'lucide-react';
import { apiCall, apiCallWithRefresh } from '../../utils/api';
import { logout } from '../../utils/auth';
import './styles/ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile data
  const [profileData, setProfileData] = useState({
    username: user.username || 'مستخدم',
    nickname: user.nickname || 'كنية المستخدم',
    email: user.email || 'user@example.com',
    phone: user.phone || '+963 933 336 562',
    address: user.address || 'دمشق، سوريا',
    birthDate: user.birthDate || '1990-01-01',
    preferences: user.preferences || {
      notifications: true,
      newsletter: true,
      darkMode: true
    }
  });

  // Edit data
  const [editData, setEditData] = useState({ ...profileData });

  useEffect(() => {
    // Load data
    setLoading(false);
  }, []);

  const handleEdit = () => {
    setEditData({ ...profileData });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Update data on server
      const res = await apiCallWithRefresh('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(editData)
      });

      if (res.ok) {
        setProfileData(editData);
        setIsEditing(false);
        
        // Update data in localStorage
        const updatedUser = { ...user, ...editData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...profileData });
  };

  const handleLogout = () => {
    logout(navigate);
  };

  const getInitials = (name, nickname) => {
    const nameInitials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const nicknameInitials = nickname ? nickname.split(' ').map(n => n[0]).join('').toUpperCase() : '';
    return nicknameInitials ? `${nameInitials} ${nicknameInitials}` : nameInitials;
  };

  const getMembershipLevel = () => {
    // يمكن تغيير هذه القيمة حسب احتياجاتك
    const userLevel = 'Gold';
    if (userLevel === 'VIP') return { level: 'VIP', icon: <Crown className="membership-icon vip" />, color: '#FFD700' };
    if (userLevel === 'Gold') return { level: 'Gold', icon: <Star className="membership-icon gold" />, color: '#FFA500' };
    if (userLevel === 'Silver') return { level: 'Silver', icon: <Star className="membership-icon silver" />, color: '#C0C0C0' };
    return { level: 'Bronze', icon: <Star className="membership-icon bronze" />, color: '#CD7F32' };
  };

  const membership = getMembershipLevel();

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/customer/dashboard')}>
          <X className="back-icon" />
          رجوع
        </button>
        <h1 className="profile-title">الملف الشخصي</h1>
      </div>

      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                <span className="avatar-initials">{getInitials(profileData.username, profileData.nickname)}</span>
              </div>
            </div>
            <div className="profile-info">
              <h2 className="profile-name">
                {profileData.username}
                {profileData.nickname && profileData.nickname !== 'كنية المستخدم' && (
                  <span className="profile-nickname"> {profileData.nickname}</span>
                )}
              </h2>
              <div className="membership-badge">
                {membership.icon}
                <span className="membership-level">{membership.level}</span>
              </div>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut className="logout-icon" />
            تسجيل الخروج
          </button>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          <div className="profile-section">
            <div className="section-header">
              <h3>المعلومات الشخصية</h3>
              {!isEditing && (
                <button className="edit-btn" onClick={handleEdit}>
                  <Edit className="edit-icon" />
                  تعديل
                </button>
              )}
            </div>

            <div className="profile-fields">
              <div className="profile-field">
                <div className="field-label">
                  <User className="field-icon" />
                  <span>اسم المستخدم</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    className="field-input"
                  />
                ) : (
                  <span className="field-value">{profileData.username}</span>
                )}
              </div>

              <div className="profile-field">
                <div className="field-label">
                  <User className="field-icon" />
                  <span>الكنية</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.nickname}
                    onChange={(e) => setEditData({ ...editData, nickname: e.target.value })}
                    className="field-input"
                  />
                ) : (
                  <span className="field-value">{profileData.nickname}</span>
                )}
              </div>

              <div className="profile-field">
                <div className="field-label">
                  <Mail className="field-icon" />
                  <span>البريد الإلكتروني</span>
                </div>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="field-input"
                  />
                ) : (
                  <span className="field-value">{profileData.email}</span>
                )}
              </div>

              <div className="profile-field">
                <div className="field-label">
                  <Phone className="field-icon" />
                  <span>رقم الهاتف</span>
                </div>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="field-input"
                  />
                ) : (
                  <span className="field-value">{profileData.phone}</span>
                )}
              </div>

              <div className="profile-field">
                <div className="field-label">
                  <MapPin className="field-icon" />
                  <span>العنوان</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    className="field-input"
                  />
                ) : (
                  <span className="field-value">{profileData.address}</span>
                )}
              </div>

              <div className="profile-field">
                <div className="field-label">
                  <Calendar className="field-icon" />
                  <span>تاريخ الميلاد</span>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.birthDate}
                    onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })}
                    className="field-input"
                  />
                ) : (
                  <span className="field-value">{profileData.birthDate}</span>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave}>
                  <Save className="save-icon" />
                  حفظ
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  <X className="cancel-icon" />
                  إلغاء
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
