# MapLite – Real‑time Group Location Sharing + Chat

**MapLite** is the ultimate solution for secure, real‑time group location sharing, chat, and AI-powered feedback. Built with privacy at its core, MapLite enables many-to-many location sharing and messaging in dynamic rooms—without persisting sensitive data on the cloud. All operations are handled in-memory, leveraging stateless JWT authentication for lightning-fast, secure microservice communication.

<p align="center">
  <img width="900" alt="MapLite Architecture" src="https://github.com/user-attachments/assets/9d6f647c-e500-412a-85e1-abeca7d72778" />
</p>

---

## ✨ Features

- **Realtime Group Location Sharing:** Instantly share and visualize locations with multiple users in a room.
- **In-room Chat:** Communicate seamlessly while tracking live movements.
- **AI-Powered Contextual Feedback:** Get smart, location-based insights powered by Gemini.
- **Kafka Event Streaming:** High-throughput, scalable messaging backbone.
- **Node.js WebSocket Gateway:** Ultra-fast bidirectional room communication.
- **FastAPI Gemini Integration:** Real-time AI responses for location metadata.
- **Privacy-first:** No location data stored on the cloud—ever.
- **JWT-based Stateless Authentication:** Fast, secure, and scalable.

---

## 🎬 Demo

[![Watch the Demo](https://img.shields.io/badge/Video-Demo-blue?logo=youtube)](https://github.com/user-attachments/assets/a9903995-f377-44a8-a882-c4ba8ad4e02d)

---

## 🛠️ Backend Setup

### 1️⃣ Start Docker Engine

```shell
cd backend
docker compose up -d        # Start engine

# Stop and remove containers
docker compose down

# Stop containers (but keep them)
docker compose stop

# Restart containers
docker compose restart
```

### 2️⃣ Configure `.env`

1. Run `ipconfig` and copy your **IPv4 Address**.
2. Edit `backend/.env`:

    ```env
    BROKERS_CONNECTING_IP="<IPv4 Address>:9092"
    ```

    <img width="696" height="90" alt="Edit .env" src="https://github.com/user-attachments/assets/0ea3df1e-420b-4bad-a987-db574da8cfaa" />

### 3️⃣ Start Producer & Consumer Engine

```shell
cd stream-worker
npm install         # If not installed
npm run build
npm run start:producer
npm run start:consumer
```

### 4️⃣ Start AI Engine

```shell
cd genai-engine
python -m venv venv
source venv/scripts/activate
pip install -r requirements.txt   # If not installed
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## 🎨 Frontend Setup

### Prerequisites

- Install [Expo Go](https://expo.dev/go) on your mobile device.

### Steps

1. **Start Frontend**

    ```shell
    cd frontend
    npm install        # If not installed
    npx expo start
    ```

2. **Scan QR Code**

    Use Expo Go to scan the QR code and launch the app on your phone.

3. **Shortcuts**

    ```
    r       – Reload App
    Ctrl+C  – Stop server
    ```

---

## 🧑‍💻 Contributing

We welcome contributions! Feel free to [open an issue](https://github.com/Jibesh10101011/maplite/issues) for bug reports, feature requests, or feedback.

---

## 📄 License

MIT License. See [LICENSE](LICENSE).

---

> Built with ❤️ for privacy, speed, and real-time collaboration.
