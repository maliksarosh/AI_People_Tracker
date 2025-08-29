import React from 'react';
import type { AnalysisResult } from '../types';

interface ResultDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  return (
    <div className="text-center bg-black/20 p-6 rounded-lg animate-fade-in">
      <h2 className="text-2xl font-semibold text-slate-300 mb-2 tracking-widest uppercase">Analysis Complete</h2>
      <p className="text-lg text-cyan-400/80 mb-4">Target entity count:</p>
      <div className="my-6">
        <span className="text-8xl lg:text-9xl font-bold text-cyan-300 text-glow">
          {result.personCount}
        </span>
        <span className="text-4xl font-semibold text-slate-300 ml-4">
          {result.personCount === 1 ? 'Person' : 'People'}
        </span>
      </div>
      <button
        onClick={onReset}
        className="mt-4 bg-gradient-to-r from-fuchsia-600 to-red-600 text-white font-bold py-3 px-8 rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-50 button-glow-danger"
      >
        Run New Analysis
      </button>
    </div>
  );
};