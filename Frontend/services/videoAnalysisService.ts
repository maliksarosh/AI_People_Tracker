import type { AnalysisResult } from '../types';

/**
 * Makes a real API call to a video analysis backend.
 * This function sends the video file to your Django backend for processing.
 *
 * @param file The video file to be analyzed.
 * @returns A promise that resolves with the analysis result.
 */
export const analyzeVideo = async (file: File): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('video', file);

  // IMPORTANT: For development, we use the full URL to the backend server.
  // In production, this might be a relative path like '/api/analyze-video'
  // if you're using a proxy to route requests.
  const API_ENDPOINT = 'http://127.0.0.1:5000/api/analyze-video';

  console.log(`Sending video "${file.name}" to ${API_ENDPOINT}`);

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    body: formData,
    // Note: Don't set the 'Content-Type' header manually when using FormData.
    // The browser will automatically set it to 'multipart/form-data' with the correct boundary.
  });

  if (!response.ok) {
    // Try to parse a JSON error message from the backend, otherwise use the status text.
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      // Use the backend's error message if available
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // The response body wasn't JSON or there was another parsing error.
      // The default errorMessage is fine.
      console.error("Could not parse error JSON.", e);
    }
    throw new Error(errorMessage);
  }

  const result: AnalysisResult = await response.json();

  // We should validate the response from the server to ensure it's what we expect.
  if (typeof result.personCount !== 'number') {
    throw new Error('Invalid response format from the server. Expected "personCount" to be a number.');
  }

  return result;
};