
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../../firebaseConfig';
import { ReactComponent as ProfileIcon } from '../../assets/profile.svg';
import { ReactComponent as RightIcon } from '../../assets/right-arrow.svg';
import { ReactComponent as NotificationIcon } from '../../assets/notifications.svg';
import { ReactComponent as PrivacyIcon } from '../../assets/privacy.svg';
import { ReactComponent as BlockedIcon } from '../../assets/blocked.svg';
import { ReactComponent as CommentsIcon } from '../../assets/commentary.svg';
import { ReactComponent as LanguageIcon } from '../../assets/language-icon.svg';
import { ReactComponent as ReelsIcon } from '../../assets/reels.svg';
import { ReactComponent as VisibilityIcon } from '../../assets/visibility.svg';
import { ReactComponent as HelpIcon } from '../../assets/help-icon.svg';
import { ReactComponent as BackIcon } from '../../assets/back-icon.svg';
import { useAuth } from '../../contexts/AuthContext';
import './AccountSettings.css';
import './AccountSettingsMobile.css';

interface ProfileData {
    firstName: string;
    lastName: string;
    bio: string;
    gender: string;
    avatarUrl?: string;
}

const AccountSettings: React.FC = () => {
    const location = useLocation();
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [editedData, setEditedData] = useState<Partial<ProfileData>>({});
    const [avatar, setAvatar] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { currentUser } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const section = params.get('section');
        if (section && sections.some(s => s.name === section)) {
            setSelectedSection(section);
        }
    }, [location.search]);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!currentUser) return;
            try {
                const docRef = doc(firestore, 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProfileData(docSnap.data() as ProfileData);
                } else {

                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        fetchProfileData();
    }, [currentUser]);

    const handleInputChange = (field: keyof ProfileData, value: string) => {
        setEditedData(prevData => ({
            ...prevData,
            [field]: value,
        }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            setAvatar(file);
        }
    };

    const handleChoosePhotoClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const saveProfileData = async () => {
        if (!currentUser) return;
        try {
            const updates: Partial<ProfileData> = { ...editedData };

            if (avatar) {
                const storageRef = ref(storage, `avatars/${currentUser.uid}`);
                await uploadBytes(storageRef, avatar);
                const downloadURL = await getDownloadURL(storageRef);
                updates.avatarUrl = downloadURL;
            }

            const docRef = doc(firestore, 'users', currentUser.uid);
            await updateDoc(docRef, updates);

            setProfileData(prevData => ({
                ...prevData!,
                ...updates,
            }));
            setEditedData({});
            setAvatar(null);
        } catch (error) {
            console.error('Error updating profile data:', error);
        }
    };

    const sections = [
        { name: 'Edit Profile', icon: <ProfileIcon className='settings-icon' /> },
        { name: 'Notification', icon: <NotificationIcon className='settings-icon' /> },
        { name: 'Account privacy', icon: <PrivacyIcon className='settings-icon' /> },
        { name: 'Blocked', icon: <BlockedIcon className='settings-icon' /> },
        { name: 'Comments', icon: <CommentsIcon className='settings-icon' /> },
        { name: 'Language', icon: <LanguageIcon className='settings-icon' /> },
        { name: 'Reels', icon: <ReelsIcon className='settings-icon' /> },
        { name: 'Visibility', icon: <VisibilityIcon className='settings-icon' /> },
        { name: 'Help', icon: <HelpIcon className='settings-icon' /> },
    ];

    const renderSectionContent = () => {
        switch (selectedSection) {
            case 'Edit Profile':
                return (
                    <div className="section-content">
                        <h3 className='setting-title'>Edit Profile</h3>
                        {profileData ? (
                            <div className="profile-settings">
                                <div className="avatar-section">
                                    <span className='image-name-section-settings'>
                                        <img
                                            src={profileData.avatarUrl && profileData.avatarUrl !== "" ? profileData.avatarUrl : "https://placehold.co/40"}
                                            alt="Avatar"
                                            className="profile-settings-avatar"
                                        />
                                        <p>{profileData.firstName} {profileData.lastName}</p>
                                    </span>
                                    <span className='button-section-settings'>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarChange}
                                            className='avatar-upload-input'
                                            style={{ display: 'none' }}
                                        />
                                        <button onClick={handleChoosePhotoClick}>
                                            {avatar ? 'Photo Selected' : 'Choose Photo'}
                                        </button>
                                    </span>
                                </div>
                                <div className="profile-details">
                                    <label>Bio:</label>
                                    <input
                                        value={editedData.bio || profileData.bio}
                                        onChange={(e) => handleInputChange('bio', e.target.value)}
                                        className='bio-settings-profile'
                                    />
                                    <label>Gender:</label>
                                    <select
                                        value={editedData.gender || profileData.gender}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                        className='gender-settings-profile'
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <span className='gender-description-settings'>This won't be part of your public profile.</span>
                                    <span className='button-container'>
                                        <button className="save-button-account-settings" onClick={saveProfileData}>
                                            Save
                                        </button>
                                    </span>
                                </div>
                            </div>
                        ) : null}
                    </div>
                );
            case 'Notification':
                return (
                    <div className="section-content">
                        <h3>Notification Settings</h3>
                        <p>Here you can manage your notification preferences.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderMobileView = () => (
        <div className="mobile-settings-layout">
            {selectedSection ? (
                <>
                    <div className="mobile-section-header">
                        <BackIcon className='back-icon' onClick={() => setSelectedSection(null)} />
                        <h2>{selectedSection}</h2>
                    </div>
                    <div className="mobile-section-content">
                        {renderSectionContent()}
                    </div>
                </>
            ) : (
                <>
                    <h2>Settings</h2>
                    <div className='mobile-settings-container'>
                        {sections.map((section) => (
                            <div
                                key={section.name}
                                className='mobile-settings-list'
                                onClick={() => setSelectedSection(section.name)}
                            >
                                <span className='section-with-icon'>
                                    {section.icon}
                                    {section.name}
                                </span>
                                <RightIcon className='settings-right-icon' />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    const renderDesktopView = () => (
        <div className="settings-layout">
            <span className="settings-menu">
                <h2>Settings</h2>
                <div className='settings-container'>
                    {sections.map((section) => (
                        <a
                            key={section.name}
                            className={section.name === selectedSection ? 'settings-button settings-buttons-active' : 'settings-button'}
                            onClick={() => setSelectedSection(section.name)}
                        >
                            <span className='section-with-icon'>
                                {section.icon}
                                {section.name}
                            </span>
                            <RightIcon className='settings-right-icon' />
                        </a>
                    ))}
                </div>
            </span>
            <div className="settings-content">
                {renderSectionContent()}
            </div>
        </div>
    );

    return (
        <div className="account-settings">
            {window.innerWidth <= 768 ? renderMobileView() : renderDesktopView()}
        </div>
    );
};

export default AccountSettings;
