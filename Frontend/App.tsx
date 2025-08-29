import React, { useState, useCallback, useEffect } from 'react';
import { VideoUpload } from './components/VideoUpload';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ResultDisplay } from './components/ResultDisplay';
import { analyzeVideo } from './services/videoAnalysisService';
import type { AnalysisResult } from './types';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup the object URL when the component unmounts or the file changes
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const handleFileChange = useCallback((file: File | null) => {
    if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
    }
    
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100 MB limit
        setError('File size exceeds 100MB. Please choose a smaller video.');
        setVideoFile(null);
        setVideoPreviewUrl(null);
        return;
      }
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    } else {
      setVideoFile(null);
      setVideoPreviewUrl(null);
    }
  }, [videoPreviewUrl]);

  const handleAnalyze = useCallback(async () => {
    if (!videoFile) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeVideo(videoFile);
      setResult(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
    } finally {
      setIsProcessing(false);
    }
  }, [videoFile]);

  const handleReset = useCallback(() => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setResult(null);
    setError(null);
    setIsProcessing(false);
  }, [videoPreviewUrl]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-fuchsia-500 text-glow">
            VPC: Visionary People Counter
          </h1>
          <p className="text-slate-400 mt-3 text-lg tracking-wider">
            Upload a video to quantify human presence with AI precision.
          </p>
        </header>

        <main className="bg-black/30 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 sm:p-8 transition-all duration-300 box-glow">
          {!videoFile && (
            <VideoUpload onFileChange={handleFileChange} disabled={isProcessing} />
          )}

          {videoPreviewUrl && (
            <div className="mb-6">
              <video src={videoPreviewUrl} controls className="w-full rounded-lg border border-cyan-500/20"></video>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-center flex items-center justify-center gap-2" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <strong className="font-bold">Analysis Failed:</strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="mt-6">
            {result && !isProcessing && (
              <ResultDisplay result={result} onReset={handleReset} />
            )}

            {videoFile && !result && (
              <div className="text-center">
                <button
                  onClick={handleAnalyze}
                  disabled={isProcessing}
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-12 rounded-md text-xl transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:ring-opacity-50 flex items-center justify-center gap-3 button-glow"
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner />
                      Processing...
                    </>
                  ) : (
                    'Initiate Analysis'
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
         <footer className="text-center mt-8 text-slate-500 text-sm opacity-70">
            <p>Frontend Interface v2.1 </p>
        </footer>
      </div>
    </div>
  );
};

export default App;