import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ProfileDropdown.css';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link, useLocation } from 'react-router-dom';
import { ReactComponent as LanguageIcon } from '../../assets/language-icon.svg';
import { ReactComponent as DisplayIcon } from '../../assets/display-icon.svg';
import { ReactComponent as SettingsIcon } from '../../assets/settings-icon.svg';
import { ReactComponent as HelpIcon } from '../../assets/help-icon.svg';
import { ReactComponent as LogoutIcon } from '../../assets/logout-icon.svg';
import { ReactComponent as RightArrow } from '../../assets/right-arrow.svg';
import { ReactComponent as SwapIcon } from '../../assets/swap-icon.svg';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../../firebaseConfig'; // Adjust the import based on your project structure
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../../firebaseConfig';

const ProfileDropdown: React.FC = () => {
    const { currentUser } = useAuth();
    const [profileData, setProfileData] = useState<{ firstName: string; lastName: string; bio: string; gender: string; avatarUrl?: string } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (currentUser?.uid) {
                try {
                    const docRef = doc(firestore, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setProfileData(docSnap.data() as { firstName: string; lastName: string; bio: string; gender: string; avatarUrl?: string });
                    } else {

                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
        };

        fetchUserProfile();
    }, [currentUser]);

    const handleLogout = async () => {
        if (currentUser) {
            try {
                await signOut(auth);
                window.location.href = '/login';
            } catch (error) {
                console.error("Error during logout: ", error);
            }
        }
    };

    const goToSettings = (section: string) => {
        navigate(`/account-settings?section=${section}`);
    };

    const goToSwap = () => {
        navigate(`/swap`);
    };

    return (
        <div className="profile-dropdown">
            <Link to={`/profile/${currentUser?.uid}`} className="profile-info">
                <div className="profile-avatar-placeholder">
                    <img
                        src={profileData?.avatarUrl && profileData.avatarUrl !== "" ? profileData.avatarUrl : "https://placehold.co/40"}
                        alt="Avatar Placeholder"
                        className="avatar-image-dropdown"
                    />
                </div>
                <span className="profile-name">{profileData?.firstName && profileData?.lastName ? `${profileData.firstName} ${profileData.lastName}` : 'Example Name'}</span>
            </Link>

            <span className='dropdown-button' onClick={() => goToSettings('Language')}>
                <span>
                    <LanguageIcon />
                    Language
                </span>
                <RightArrow />
            </span>
            <span className='dropdown-button' onClick={() => goToSettings('Display & Accessibility')}>
                <span>
                    <DisplayIcon />
                    Display & Accessibility
                </span>
                <RightArrow />
            </span>
            <span className='dropdown-button' onClick={() => goToSettings('Privacy')}>
                <span>
                    <SettingsIcon />
                    Settings & Privacy
                </span>
                <RightArrow />
            </span>
            <span className='dropdown-button'>
                <span>
                    <HelpIcon />
                    Help
                </span>
                <RightArrow />
            </span>
            <span className='dropdown-button' onClick={() => goToSwap()}>
                <span>
                    <SwapIcon className="swap-icon" />
                    Swap
                </span>
                <RightArrow />
            </span>
            <span className='dropdown-button' onClick={handleLogout}>
                <span>
                    <LogoutIcon />
                    Log Out
                </span>
            </span>

        </div>
    );
};

export default ProfileDropdown;