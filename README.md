# MapLite – Real‑time Group Location Sharing + Chat

*A realtime, room‑based location sharing app with chat and AI‑powered location feedback.*

![Architecture](https://github.com/user-attachments/assets/6d81e12a-14e3-4c23-a76f-62d216a37553)

## Features

* Realtime group location sharing
* Realtime in-room chat
* AI-powered contextual feedback about user location
* Kafka-backed event streaming
* Node.js WebSocket gateway
* FastAPI OpenAI integration for location metadata

## Video Demo

https://github.com/user-attachments/assets/a9903995-f377-44a8-a882-c4ba8ad4e02d

---

## FRONTEND SETUP

### Prerequisites

* Install [Expo Go](https://expo.dev/go) App

### Steps

#### Step 1 : Clone the Repo

```bash
git clone REPO_URL
```

#### Step 2 : Navigate to frontend directory

```bash
cd frontend
```

#### Step 3 : Set up `.env`

1. Run the command: `ipconfig`
2. Copy your **IPv4 Address**
3. In `frontend/.env`, set:
<img width="696" height="90" alt="need_to_edit" src="https://github.com/user-attachments/assets/0ea3df1e-420b-4bad-a987-db574da8cfaa" />

```env
BROKERS_CONNECTING_IP="<IPv4 Address>:9092"
```

#### Step 4 : Install dependencies

```bash
npm install
```

#### Step 5 : Run the application

```bash
npx expo start
```

#### Step 6 : Scan QR on your phone

Use the Expo Go App to scan the QR and launch the app.

#### Hot Reload / Exit Shortcuts

```
'r'  – Reload App
Ctrl+C – Stop server
```

---

## BACKEND SETUP

### Prerequisites

* Docker installed and running

### Steps

#### Step 1 : Navigate to backend directory

```bash
cd backend
```

#### Step 2 : Install dependencies

```bash
npm install
```

#### Step 3 : Start Docker

Search for Docker in Windows (`Win + S`) and open it.

#### Step 4 : Start Zookeeper server

```bash
docker run -p 2181:2181 zookeeper
```

#### Step 5 : Get IPv4 Address

Run:

```bash
ipconfig
```
<img width="696" height="90" alt="need_to_edit" src="https://github.com/user-attachments/assets/0ea3df1e-420b-4bad-a987-db574da8cfaa" />


Use the IPv4 address in the next step.

#### Step 6 : Start Kafka

```bash
docker run -p 9092:9092 \
  -e KAFKA_ZOOKEEPER_CONNECT=<IPv4 Address>:2181 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<IPv4 Address>:9092 \
  -e KAFKA_LISTENER_SECURITY_PROTOCOL=PLAINTEXT \
  -e KAFKA_LISTENER_PORT=9092 \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  confluentinc/cp-kafka
```

Update your `backend/.env`:

```env
BROKERS_CONNECTING_IP="<IPv4 Address>:9092"
```

#### Step 7 : Start Redis server

```bash
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

#### Step 8 : Start backend server

```bash
npm start
```

---

## API SERVER SETUP

```bash
cd apiServer
npm install
npm start
```

---

## Docker Frontend Setup (Optional)

```bash
docker run --rm -it --network="bridge" \
  -p 8081:8081 -p 19000:19000 -p 19001:19001 -p 19002:19002 \
  -e REACT_NATIVE_PACKAGER_HOSTNAME=<IPv4 Address> \
  -v "D:\Data\mapelite-test\maplite\frontend:/app" \
  <your-image> npx expo start --host lan
```

---

## CONTRIBUTION GUIDELINES

1. Create a Fork

![Fork Screenshot](https://github.com/user-attachments/assets/f216e854-db60-4e13-ac9c-efdda0549e6f)

2. Create an Issue and submit a Pull Request (PR)

---

## Architecture Flow Summary

1. **Users** share messages and coordinates → **Node.js** (via WebSocket)
2. **Node.js** produces messages to Kafka topics
3. **Kafka** acts as the messaging backbone
4. **FastAPI** consumes coordinates and fetches enriched feedback via **OpenAI**
5. **FastAPI** produces AI feedback → **Kafka** → **Node.js** → **Clients**

---

*For any queries or suggestions, feel free to open an issue.*

