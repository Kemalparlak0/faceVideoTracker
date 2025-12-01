from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import face_recognition
import os
import pickle
import cv2
import tempfile

app = Flask(__name__)
CORS(app)

# 1️⃣ Yüz verileri saklanacak klasör ve dosya
KNOWN_FACES_DIR = "known_faces"
if not os.path.exists(KNOWN_FACES_DIR):
    os.makedirs(KNOWN_FACES_DIR)

ENCODINGS_FILE = "encodings.pkl"

# 2️⃣ Sisteme kişi ekleme fonksiyonu
def add_person(name, image_path):
    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)
    if len(encodings) == 0:
        return False, f"{name} için yüz bulunamadı!"

    # Mevcut encodingler varsa yükle
    known_encodings = {}
    if os.path.exists(ENCODINGS_FILE):
        with open(ENCODINGS_FILE, "rb") as f:
            known_encodings = pickle.load(f)

    # Yeni kişiyi ekle
    known_encodings[name] = encodings[0]
    with open(ENCODINGS_FILE, "wb") as f:
        pickle.dump(known_encodings, f)

    return True, f"{name} başarıyla eklendi!"

# 3️⃣ Webcam üzerinden frame üreten generator (yüz tanıma + isim yazma)
def gen_frames():
    if not os.path.exists(ENCODINGS_FILE):
        print("⚠️ Önce kişi eklemeniz gerekiyor!")
        return

    with open(ENCODINGS_FILE, "rb") as f:
        known_encodings = pickle.load(f)

    known_names = list(known_encodings.keys())
    known_face_encodings = list(known_encodings.values())

    cap = cv2.VideoCapture(0)  # 0 = default webcam
    if not cap.isOpened():
        print("⚠️ Webcam açılamadı!")
        return

    while True:
        success, frame = cap.read()
        if not success:
            break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
            name = "Bilinmiyor"
            if True in matches:
                match_index = matches.index(True)
                name = known_names[match_index]

            # Dikdörtgen çiz ve isim yaz
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, name, (left, bottom + 25),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

# 4️⃣ Fotoğraf yükleyip kişi ekleme endpoint’i
@app.route("/add_people", methods=["POST"])
def add_people():
    data = request.form
    if "photo1" not in request.files or "photo2" not in request.files:
        return jsonify({"error": "2 fotoğraf yüklemeniz gerekiyor"}), 400

    photo1 = request.files["photo1"]
    photo2 = request.files["photo2"]

    name1 = data.get("name1", "Person1")
    name2 = data.get("name2", "Person2")

    temp_photo1 = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    temp_photo1.write(photo1.read())
    temp_photo1.close()

    temp_photo2 = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    temp_photo2.write(photo2.read())
    temp_photo2.close()

    success1, msg1 = add_person(name1, temp_photo1.name)
    success2, msg2 = add_person(name2, temp_photo2.name)

    if not success1 or not success2:
        return jsonify({"error": f"{msg1}, {msg2}"}), 400

    return jsonify({"message": f"{msg1}, {msg2}"})

# 5️⃣ Canlı video yayını endpoint’i
@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(debug=True)
    
