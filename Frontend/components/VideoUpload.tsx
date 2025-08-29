import React, { useCallback, useState } from 'react';

interface VideoUploadProps {
  onFileChange: (file: File | null) => void;
  disabled: boolean;
}

const UploadIcon: React.FC = () => (
    <svg className="w-16 h-16 mb-4 text-slate-600 group-hover:text-cyan-400 transition-colors duration-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18.5A6.5 6.5 0 1 1 12 5.5a6.5 6.5 0 0 1 0 13Zm0 0V22m-4-10a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd"/>
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 5.5V2m-2.5 7.5L7 8m10 1.5L19.5 8M4.5 16l-2-1.5m17 1.5 2-1.5"/>
    </svg>
);


export const VideoUpload: React.FC<VideoUploadProps> = ({ onFileChange, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null); // Clear previous errors on a new drag action
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        setError(null);
        onFileChange(file);
      } else {
        setError('Invalid file type. Please upload a video file (MP4, WEBM, MOV).');
        onFileChange(null);
      }
    }
  }, [disabled, onFileChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Clear previous errors on new selection
    const files = e.target.files;
    if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('video/')) {
            setError(null);
            onFileChange(file);
        } else {
            setError('Invalid file type. Please upload a video file (MP4, WEBM, MOV).');
            onFileChange(null);
            // Reset the input value so the user can select the same invalid file again and still trigger onChange
            e.target.value = '';
        }
    }
  };

  const borderClasses = 'absolute w-8 h-8 border-cyan-400/50 group-hover:border-cyan-400 transition-colors duration-300';
  const draggingBorderClasses = isDragging ? '!border-fuchsia-500' : '';

  return (
    <div className="flex items-center justify-center w-full">
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        htmlFor="video-upload"
        className={`group relative flex flex-col items-center justify-center w-full h-72 rounded-lg cursor-pointer bg-black/20 hover:bg-cyan-900/10 transition-colors duration-300 ${isDragging ? 'bg-fuchsia-900/20' : ''}`}
      >
        <div className={`${borderClasses} ${draggingBorderClasses} top-0 left-0 border-t-2 border-l-2 rounded-tl-lg`}></div>
        <div className={`${borderClasses} ${draggingBorderClasses} top-0 right-0 border-t-2 border-r-2 rounded-tr-lg`}></div>
        <div className={`${borderClasses} ${draggingBorderClasses} bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg`}></div>
        <div className={`${borderClasses} ${draggingBorderClasses} bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg`}></div>
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <UploadIcon />
          <p className="mb-2 text-lg text-slate-300">
            <span className="font-semibold text-cyan-400">Select file</span> or drag and drop video
          </p>
          <p className="text-sm text-slate-500">MP4, WEBM, MOV (Max: 100MB)</p>
          {error && (
            <p className="mt-3 text-sm font-semibold text-red-400 bg-red-900/20 px-3 py-1.5 rounded-md animate-fade-in" role="alert">
              {error}
            </p>
          )}
        </div>
        <input 
            id="video-upload" 
            type="file" 
            className="hidden" 
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileSelect}
            disabled={disabled}
        />
      </label>
    </div>
  );
};