# MapLite – Real‑time Group Location Sharing + Chat

*A realtime, room-based location sharing app with chat and AI-powered contextual feedback. It supports secure many-to-many location sharing without storing any sensitive data on the cloud all operations are handled via in-memory caching. Authentication is JWT-based and stateless, ensuring fast and secure microservice communication.*

<img width="1558" height="669" alt="Maplite-most-updated-architecture" src="https://github.com/user-attachments/assets/9d6f647c-e500-412a-85e1-abeca7d72778" />

## Features

* Realtime group location sharing
* Realtime in-room chat
* AI-powered contextual feedback about user location
* Kafka-backed event streaming
* Node.js WebSocket gateway
* FastAPI Gemini integration for location metadata

## Video Demo

https://github.com/user-attachments/assets/a9903995-f377-44a8-a882-c4ba8ad4e02d

---

## BACKEND SETUP

##### Step 1: Start Docker Engine:
```shell
$ cd backend
$ docker compose up -d # Start engine

# Stop and remove containers
$ docker compose down

# Stop containers (but keep them)
$ docker compose stop

# Restart containers
$ docker compose restart
```

##### Step 2: Update your `backend/.env`:

1. Run the command: `ipconfig`
2. Copy your **IPv4 Address**

    <img width="696" height="90" alt="need_to_edit" src="https://github.com/user-attachments/assets/0ea3df1e-420b-4bad-a987-db574da8cfaa" />

      ```env
      BROKERS_CONNECTING_IP="<IPv4 Address>:9092"
      ```

##### Step 3 : Start producer & consumer engine

```shell
$ cd stream-worker
$ npm install # If not installed
$ npm run build
$ npm run start:producer
$ npm run start:consumer
```


#### Step 4 : Start genai-engine

Install Libraries(If not installed)

```shell
$ cd genai-engine
$ python -m venv venv
$ source venv/scripts/activate
$ pip install -r requirements.txt # If not installed
$ uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

```

---

## FRONTEND SETUP

### Prerequisites

* Install [Expo Go](https://expo.dev/go) App

### Steps

#### Step 1 : Start Frontend

```shell
$ cd frontend
$ npm install # If not installed
$ npx expo start
```

#### Step 3 : Scan QR on your phone

Use the Expo Go App to scan the QR and launch the app.

#### Hot Reload / Exit Shortcuts

```
'r'  – Reload App
Ctrl+C – Stop server
```

---
*For any queries or suggestions, feel free to open an issue.*

