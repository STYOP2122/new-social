
import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as ReelsComments } from '../../assets/reels-comments.svg';
import { ReactComponent as ReelsLikeInActive } from '../../assets/reels-like.svg';
import { ReactComponent as ReelsLikeActive } from '../../assets/thunder.svg';
import { ReactComponent as ReelsSave } from '../../assets/reels-save.svg';
import { ReactComponent as ReelsSend } from '../../assets/reels-send.svg';
import { ReactComponent as PlayIcon } from '../../assets/reels-play-button.svg';
import { ReactComponent as PauseIcon } from '../../assets/reels-pause-button.svg';
import './Reels.css';

interface ReelsProps {
    videos: { src: string; likes: number; comments: number; sendcount: number }[];
}

const Reels: React.FC<ReelsProps> = ({ videos }) => {
    const [currentVideoIndex, setCurrentVideoIndex] = useState<number | null>(null);
    const [showControl, setShowControl] = useState<boolean>(false);
    const [controlType, setControlType] = useState<'play' | 'pause'>('play');
    const [likedVideos, setLikedVideos] = useState<Record<number, boolean>>({});
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [containerHeight, setContainerHeight] = useState('100vh');

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const index = videoRefs.current.indexOf(entry.target as HTMLVideoElement);

                if (entry.isIntersecting) {
                    if (index !== -1 && index !== currentVideoIndex) {
                        if (currentVideoIndex !== null) {
                            const prevVideo = videoRefs.current[currentVideoIndex];
                            if (prevVideo) {
                                prevVideo.pause();
                                prevVideo.muted = true;
                            }
                        }

                        const currentVideo = videoRefs.current[index];
                        if (currentVideo) {
                            currentVideo.play().catch((error) => {

                            });
                            currentVideo.muted = false;
                            setCurrentVideoIndex(index);
                        }
                    }
                } else {
                    if (index !== -1) {
                        const currentVideo = videoRefs.current[index];
                        if (currentVideo) {
                            currentVideo.pause();
                            currentVideo.muted = true;
                        }
                    }
                }
            });
        }, {
            threshold: 0.5,
        });

        videoRefs.current.forEach((video) => {
            if (video) observer.observe(video);
        });

        return () => {
            videoRefs.current.forEach((video) => {
                if (video) observer.unobserve(video);
            });
        };
    }, [currentVideoIndex]);

    const handleVideoControl = (index: number) => {
        const video = videoRefs.current[index];
        if (video) {
            if (video.paused) {
                video.play().catch((error) => {

                });
                setControlType('pause');
            } else {
                video.pause();
                setControlType('play');
            }
            setShowControl(true);
            setTimeout(() => setShowControl(false), 1000);
        }
    };

    const handleLikeClick = (index: number) => {
        setLikedVideos(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleOtherActionClick = () => {
        alert("In developing");
    };

    useEffect(() => {
        const updateHeight = () => {
            const headerHeight = document.querySelector('header')?.offsetHeight || 0;
            const footerHeight = document.querySelector('footer')?.offsetHeight || 0;
            const totalHeight = window.innerHeight - headerHeight - footerHeight;
            setContainerHeight(`${totalHeight}px`);
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);

        return () => {
            window.removeEventListener('resize', updateHeight);
        };
    }, []);

    return (
        <div className="reels-container" style={{ height: containerHeight }}>
            {videos.map((video, index) => (
                <div className={`reel ${index === currentVideoIndex ? 'active' : ''}`} key={index}>
                    <div className="video-wrapper">
                        <video
                            className="reel-video"
                            src={video.src}
                            autoPlay={index === currentVideoIndex}
                            loop
                            playsInline
                            muted={index !== currentVideoIndex}
                            ref={(ref) => { videoRefs.current[index] = ref; }}
                        ></video>
                        <div className="reel-actions" onClick={() => handleVideoControl(index)}>
                            {showControl && (
                                <div className="play-pause-icon">
                                    {controlType === 'play' ? <PlayIcon /> : <PauseIcon />}
                                </div>
                            )}
                            <div className='actions-container'>
                                <span 
                                    className='reels-actions-container' 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLikeClick(index);
                                    }}
                                >
                                    {likedVideos[index] ? (
                                        <ReelsLikeActive className="reels-like-icon liked" />
                                    ) : (
                                        <ReelsLikeInActive className="reels-like-icon" />
                                    )}
                                    {likedVideos[index] ? video.likes + 1 : video.likes}
                                </span>
                                <span 
                                    className='reels-actions-container'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOtherActionClick();
                                    }}
                                >
                                    <ReelsComments />
                                    {video.comments}
                                </span>
                                <span 
                                    className='reels-actions-container'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOtherActionClick();
                                    }}
                                >
                                    <ReelsSend />
                                    {video.sendcount}
                                </span>
                                <span 
                                    className='reels-actions-container'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOtherActionClick();
                                    }}
                                >
                                    <ReelsSave className='reels-save-icon' />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Reels;
