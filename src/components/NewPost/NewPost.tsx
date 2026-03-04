
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFeed } from '../../contexts/FeedContext';
import { ReactComponent as NewPostIcon } from '../../assets/new-post-icon.svg';
import { storage, firestore } from '../../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Cropper from 'react-easy-crop';
import './NewPost.css';

interface NewPostProps {
    onCreatePost: (fileURL: string, caption: string) => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });

const getCroppedImg = async (imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas rendering context not found');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg');
    });
};

const generateUniqueFileName = (originalFileName: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = originalFileName.split('.').pop();
    return `${timestamp}-${randomString}.${fileExtension}`;
};

const NewPost: React.FC<NewPostProps> = ({ onCreatePost }) => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const { currentUser } = useAuth();
    const { addPost } = useFeed();

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setIsCropping(true);
        }
    };

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any): void => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropConfirm = async () => {
        try {
            if (croppedAreaPixels && uploadedFile) {
                const croppedImage = await getCroppedImg(previewUrl!, croppedAreaPixels);
                if (croppedImage) {
                    const croppedImageURL = URL.createObjectURL(croppedImage);
                    setPreviewUrl(croppedImageURL);
                    setUploadedFile(new File([croppedImage], 'cropped_image.jpg', { type: 'image/jpeg' }));
                    setIsCropping(false);
                }
            }
        } catch (e) {
            console.error(e);
            setError('Error cropping image');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!uploadedFile) {
            setError('Please upload a file before creating a post.');
            return;
        }
        if (!caption.trim()) {
            setError('Caption cannot be empty.');
            return;
        }

        setIsUploading(true);

        try {
            const uniqueFileName = generateUniqueFileName(uploadedFile.name);
            const fileRef = ref(storage, `posts/${uniqueFileName}`);
            const uploadTask = uploadBytesResumable(fileRef, uploadedFile);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error('Error during upload:', error);
                    setError('Upload failed: ' + error.message);
                    setIsUploading(false);
                },
                async () => {
                    try {
                        if (currentUser) {
                            const fileURL = await getDownloadURL(uploadTask.snapshot.ref);
                            onCreatePost(fileURL, caption);

                            const newPost: any = {
                                userId: currentUser.uid,
                                caption,
                                fileURL,
                                timestamp: serverTimestamp(),
                            };

                            await addPost(newPost);

                            setUploadedFile(null);
                            setCaption('');
                            setError('');
                            setIsUploading(false);
                            setUploadProgress(0);
                        }
                    } catch (error) {
                        console.error('Error getting file URL:', error);
                        setError('An error occurred while retrieving the file URL.');
                        setIsUploading(false);
                    }
                }
            );
        } catch (error) {
            console.error('Error uploading post:', error);
            setError('An error occurred while uploading the file.');
            setIsUploading(false);
        }
    };

    return (
        <div className="new-post-container">
            <h2>Create a new post</h2>
            {!uploadedFile ? (
                <div className="upload-container">
                    <span>
                        <NewPostIcon />
                        <p>Drag and drop a photo or video here</p>
                    </span>
                    <label className="custom-file-label">
                        Choose from computer
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                            aria-label="Upload file"
                        />
                    </label>
                </div>
            ) : isCropping ? (
                <div className="cropper-container">
                    <Cropper
                        image={previewUrl!}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        style={{
                            containerStyle: {
                                position: 'inherit',
                                width: '70%',
                                height: '100%'
                            }
                        }}
                    />
                    <div className="cropper-controls">
                        <button onClick={handleCropConfirm}>Confirm Crop</button>
                    </div>
                </div>
            ) : (
                <div className="post-details-container">
                    <div className="uploaded-file-preview">
                        <img
                            src={previewUrl!}
                            alt="Preview of the uploaded file"
                            className="uploaded-image"
                        />
                    </div>
                    <form onSubmit={handleSubmit} className="new-post-form">
                        {error && <div className="error-message">{error}</div>}
                        <div className="form-group">
                            <label htmlFor="post-caption">Caption</label>
                            <input
                                type="text"
                                id="post-caption"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Enter a caption for the post"
                                aria-label="Post caption"
                            />
                        </div>
                        <button type="submit" className="submit-button" disabled={isUploading}>
                            {isUploading ? 'Uploading...' : 'Create Post'}
                        </button>
                        {isUploading && (
                            <div className="upload-progress">
                                <p>Upload Progress: {Math.round(uploadProgress)}%</p>
                            </div>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};

export default NewPost;
