# Contribution Guidelines 
  1. Create a Fork first
     
     ![WhatsApp Image 2025-01-23 at 00 05 24_7b02ce10](https://github.com/user-attachments/assets/b94560b6-0436-48e9-a493-64a77281e172)

  2. Create a Issue and then do a PR


# FRONTEND SETUP

## Prequisites 
Install [Expo Go](https://expo.dev/go) App


## Steps for starting the Application

### Step-1 : Clone the Repo 
```bash
git clone REPO_URL
```

### Step-2 : Navigate to root directory

```bash
cd frontend
```
### Step-3 : Run the application
Run the command
```bash
npm install
```

### Step-4 : Run the application
```bash
npx expo start --tunnel
```

### Step-5 : Open the App on your phone and Scan the QR
![image](https://github.com/user-attachments/assets/da640a5d-6815-40a0-a917-052687bfed87)

### Neccessary Interrupts For realoading the Application and closing

`
cick : 'r' (for reloading)
click : ctrl+c (for closing)
`


# BACKEND SETUP

## Prequisites 
  1. Install Docker

## Step-1 : Navigate to Root Directory 
  ```bash
  cd backend
  ```
## Step-2 : Install modules
  ```bash
  npm install
  ```


## Step-4 : Open Docker
`Click windows+s , type docker and open it`

## Step-5 : Start Zookeeper server
Run the command on your shell
  ```bash
  docker run -p 2181:2181 zookeeper
  ```

## Step-6 : Run command on Powershell
Run the command on your shell
  ```bash
    ipconfig
  ```

## Step-7 : Copy the circled IpV4 Address and replace with `<IpV4 Address>`
  ![WhatsApp Image 2025-01-23 at 16 35 49_96ce5453](https://github.com/user-attachments/assets/17fcd743-1699-4ea8-8786-3b9db6506c82)


## Step-8 : Start confluentinc/cp-kafka
Run the command
  ```bash
docker run -p 9092:9092 -e KAFKA_ZOOKEEPER_CONNECT=<IpV4 Address>:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<IpV4 Address>:9092 -e KAFKA_LISTENER_SECURITY_PROTOCOL=PLAINTEXT -e KAFKA_LISTENER_PORT=9092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 confluentinc/cp-kafka
  ```

## Step-9 : Start the backend Server
Run the command
```bash
  npm start
```