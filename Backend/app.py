import os
import cv2
import torch
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort
from flask import Flask, request, jsonify 
from flask_cors import CORS
import uuid # To create unique filenames
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create a directory to temporarily store uploaded videos
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# --- Your AI Processing Function ---
# I've wrapped your script logic in a function that takes a video path
# and returns the number of unique people.
def process_video_for_people_count(video_path):
    # --- CONFIG --- (mostly the same as your script)
    TRACKER_EMBEDDER = "mobilenet"
    EMBEDDER_GPU = True
    MIN_SEEN_FOR_UNIQUE = 10
    CONF_THRESH = 0.35

    # --- MODELS ---
    device = "cuda" if torch.cuda.is_available() else "cpu"
    logging.info(f"Using device: {device}")
    model = YOLO("yolov8n.pt")
    tracker = DeepSort(
        max_age=10000, 
        n_init=3,
        nms_max_overlap=1.0,
        max_cosine_distance=0.3,
        nn_budget=None,
        embedder=TRACKER_EMBEDDER,
        half=True,
        bgr=True,
        embedder_gpu=EMBEDDER_GPU
    )

    # --- I/O ---
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logging.error(f"Error: Cannot open video: {video_path}")
        return -1 # Indicate an error

    # --- STATE ---
    track_seen_frames = {}
    unique_ids = set()

    logging.info("Starting video processing...")
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame, verbose=False)
        detections = []
        for r in results:
            for box in r.boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                if cls != 0 or conf < CONF_THRESH: # Class 0 is 'person' in COCO dataset
                    continue
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                w, h = x2 - x1, y2 - y1
                if w > 0 and h > 0:
                    detections.append(([x1, y1, w, h], conf, "person"))

        tracks = tracker.update_tracks(detections, frame=frame)

        for tr in tracks:
            if not tr.is_confirmed():
                continue
            tid = tr.track_id
            track_seen_frames[tid] = track_seen_frames.get(tid, 0) + 1
            if track_seen_frames[tid] >= MIN_SEEN_FOR_UNIQUE:
                unique_ids.add(tid)
    
    cap.release()
    logging.info(f"Processing complete. Found {len(unique_ids)} unique people.")
    return len(unique_ids)


# --- API Endpoint Definition ---
@app.route('/api/analyze-video', methods=['POST'])
def analyze_video_endpoint():
    if 'video' not in request.files:
        return jsonify({"error": "No video file part in the request"}), 400
    
    file = request.files['video']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        # Create a secure, unique filename and save the uploaded video
        filename = str(uuid.uuid4()) + "_" + os.path.basename(file.filename)
        video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        try:
            file.save(video_path)
            logging.info(f"Video saved to {video_path}")
            
            # Run your AI analysis on the saved video file
            count = process_video_for_people_count(video_path)
            
            # Check for processing errors
            if count == -1:
                 return jsonify({"error": "Failed to open or process the video file."}), 500
            
            # Send the successful result back to the frontend
            return jsonify({"personCount": count})
        
        except Exception as e:
            logging.error(f"An error occurred: {e}", exc_info=True)
            return jsonify({"error": "An internal server error occurred during analysis."}), 500
        
        finally:
            # Clean up the uploaded file after processing
            if os.path.exists(video_path):
                os.remove(video_path)
                logging.info(f"Cleaned up {video_path}")

    return jsonify({"error": "An unexpected error occurred."}), 500

# --- To run the server ---
if __name__ == '__main__':
    # Use 0.0.0.0 to make it accessible on your network
    # Note: For production, use a proper WSGI server like Gunicorn or uWSGI
    app.run(host='0.0.0.0', port=5000, debug=False)