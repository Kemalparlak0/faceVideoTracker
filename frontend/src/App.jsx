import { useState } from "react";

function App() {
  const [photo1, setPhoto1] = useState(null);
  const [photo2, setPhoto2] = useState(null);
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  // 1️⃣ Kişileri backend'e ekleme
  const handleAddPeople = async () => {
    if (!photo1 || !photo2 || !name1 || !name2) {
      alert("2 fotoğraf ve isim girmeniz gerekiyor!");
      return;
    }

    const formData = new FormData();
    formData.append("photo1", photo1);
    formData.append("photo2", photo2);
    formData.append("name1", name1);
    formData.append("name2", name2);

    try {
      const res = await fetch("http://127.0.0.1:5000/add_people", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Kişiler eklenirken bir hata oluştu!");
    }
  };

  // 2️⃣ Canlı webcam başlatma
  const handleStart = () => {
    setStreaming(true);
    setVideoUrl("http://127.0.0.1:5000/video_feed");
  };

  const handleStop = () => {
    setStreaming(false);
    setVideoUrl("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "#fff",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          marginBottom: "40px",
          textAlign: "center",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        Face Live Tracker
      </h1>

      {/* Fotoğraf Yükleme + İsim Alanları */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <UploadCard
          label="Kişi 1 Fotoğraf"
          onChange={(e) => setPhoto1(e.target.files[0])}
        />
        <input
          type="text"
          placeholder="Kişi 1 İsmi"
          value={name1}
          onChange={(e) => setName1(e.target.value)}
          style={{ padding: "10px", borderRadius: "6px", border: "none" }}
        />

        <UploadCard
          label="Kişi 2 Fotoğraf"
          onChange={(e) => setPhoto2(e.target.files[0])}
        />
        <input
          type="text"
          placeholder="Kişi 2 İsmi"
          value={name2}
          onChange={(e) => setName2(e.target.value)}
          style={{ padding: "10px", borderRadius: "6px", border: "none" }}
        />
      </div>

      {/* Kişileri ekleme butonu */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleAddPeople}
          style={{
            padding: "10px 40px",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#4caf50",
            color: "#fff",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          Kişileri Ekle
        </button>
      </div>

      {/* Başlat / Durdur Butonları */}
      <div style={{ marginBottom: "20px" }}>
        {!streaming ? (
          <button
            onClick={handleStart}
            style={{
              padding: "15px 60px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              backgroundColor: "#f6d365",
              color: "#333",
              boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
            }}
          >
            Başlat
          </button>
        ) : (
          <button
            onClick={handleStop}
            style={{
              padding: "15px 60px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              backgroundColor: "#ff6b6b",
              color: "#fff",
              boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
            }}
          >
            Durdur
          </button>
        )}
      </div>

      {/* Canlı video */}
      {streaming && (
        <img
          src={videoUrl}
          alt="Canlı Video"
          style={{ width: "640px", height: "480px", borderRadius: "12px" }}
        />
      )}
    </div>
  );
}

function UploadCard({ label, onChange, type = "image/*" }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        color: "#333",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        minWidth: "200px",
        maxWidth: "250px",
      }}
    >
      <label style={{ marginBottom: "10px", fontWeight: "bold" }}>{label}</label>
      <input type="file" accept={type} onChange={onChange} />
    </div>
  );
}

export default App;
