
import React, { useState, useCallback, DragEvent } from 'react';
import { UploadIcon } from './Icon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isOcrReady: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isOcrReady }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isOcrReady && e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };
  
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isOcrReady && e.dataTransfer.files && e.dataTransfer.files[0]) {
      if(e.dataTransfer.files[0].type.startsWith("image/")){
        onImageUpload(e.dataTransfer.files[0]);
      }
    }
  }, [onImageUpload, isOcrReady]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOcrReady) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const uploaderClasses = isOcrReady
    ? `border-gray-600 bg-gray-800/50 hover:border-gray-500 ${isDragging ? 'border-emerald-400 bg-gray-700/50 scale-105' : ''}`
    : 'border-gray-700 bg-gray-800/20 cursor-not-allowed';

  return (
    <div 
        className={`w-full max-w-lg border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${uploaderClasses}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
    >
        <div className="flex flex-col items-center justify-center">
            <UploadIcon className={`w-16 h-16 mb-4 ${isOcrReady ? 'text-gray-500' : 'text-gray-600'}`}/>
            <p className={`text-xl font-semibold ${isOcrReady ? 'text-gray-300' : 'text-gray-600'}`}>
              {isOcrReady ? 'Drag & drop a nutrition label image here' : 'Loading OCR Engine...'}
            </p>
            <p className="text-gray-500 my-2">or</p>
            <label htmlFor="file-upload" 
              className={`font-bold py-2 px-6 rounded-lg transition-colors ${isOcrReady ? 'cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
            >
                Browse File
            </label>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept="image/png, image/jpeg, image/webp" 
              onChange={handleFileChange} 
              disabled={!isOcrReady} 
            />
             <p className={`text-xs mt-4 ${isOcrReady ? 'text-gray-500' : 'text-gray-600'}`}>
              {isOcrReady ? 'Supports: PNG, JPG, WEBP' : 'Please wait a moment.'}
            </p>
        </div>
    </div>
  );
};
