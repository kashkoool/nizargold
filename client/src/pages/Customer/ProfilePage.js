import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { apiCall } from '../../utils/api';
import './styles/ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await apiCall('/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setError('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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
                 <span style={{ color: membership.color }}>{membership.level}</span>
               </div>
               <p className="profile-email">{profileData.email}</p>
             </div>
          </div>

          <nav className="profile-nav">
            <button className="nav-item active">
              <User className="nav-icon" />
              <span>الملف الشخصي</span>
            </button>
          </nav>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut className="logout-icon" />
            <span>تسجيل الخروج</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          <div className="profile-section">
            <div className="section-header">
              <h3>معلومات الحساب</h3>
              {!isEditing && (
                <button className="edit-btn" onClick={handleEdit}>
                  <Edit className="edit-icon" />
                  تعديل
                </button>
              )}
            </div>

                         <div className="profile-form">
               <div className="name-nickname-container">
                 <div className="form-group">
                   <label>اسم المستخدم</label>
                   {isEditing ? (
                     <input
                       type="text"
                       value={editData.username}
                       onChange={(e) => setEditData({...editData, username: e.target.value})}
                       className="form-input"
                       placeholder="اسم المستخدم"
                     />
                   ) : (
                     <div className="info-display">
                       <User className="info-icon" />
                       <span>{profileData.username}</span>
                     </div>
                   )}
                 </div>

                 <div className="form-group">
                   <label>الكنية</label>
                   {isEditing ? (
                     <input
                       type="text"
                       value={editData.nickname}
                       onChange={(e) => setEditData({...editData, nickname: e.target.value})}
                       className="form-input"
                       placeholder="الكنية"
                     />
                   ) : (
                     <div className="info-display">
                       <User className="info-icon" />
                       <span>{profileData.nickname}</span>
                     </div>
                   )}
                 </div>
               </div>

              <div className="form-group">
                <label>البريد الإلكتروني</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="form-input"
                  />
                ) : (
                  <div className="info-display">
                    <Mail className="info-icon" />
                    <span>{profileData.email}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>رقم الهاتف</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="form-input"
                  />
                ) : (
                  <div className="info-display">
                    <Phone className="info-icon" />
                    <span>{profileData.phone}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>العنوان</label>
                {isEditing ? (
                  <textarea
                    value={editData.address}
                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                    className="form-textarea"
                    rows="3"
                  />
                ) : (
                  <div className="info-display">
                    <MapPin className="info-icon" />
                    <span>{profileData.address}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>تاريخ الميلاد</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.birthDate}
                    onChange={(e) => setEditData({...editData, birthDate: e.target.value})}
                    className="form-input"
                  />
                ) : (
                  <div className="info-display">
                    <Calendar className="info-icon" />
                    <span>{new Date(profileData.birthDate).toLocaleDateString('en-US')}</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button className="save-btn" onClick={handleSave}>
                    <Save className="save-icon" />
                    حفظ التغييرات
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
    </div>
  );
};

export default ProfilePage;
