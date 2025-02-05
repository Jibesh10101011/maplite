# Contribution Guidelines 
  1. Create a Fork first
     
![WhatsApp Image 2025-02-04 at 11 48 45_525e1371](https://github.com/user-attachments/assets/f216e854-db60-4e13-ac9c-efdda0549e6f)

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

### Step-3 : Set up frontend `.env`
1. Run the command 
    ```bash
    ipconfig
    ```
2. Copy IpV4 Addesss from this
   
![WhatsApp Image 2025-02-04 at 11 49 56_8b1cbf5f](https://github.com/user-attachments/assets/755bfac4-c457-40b6-a070-4ae4dc4026d2)


4. Move to `frontend/.env` and here `BROKERS_CONNECTING_IP="<Ipv4Address>:9092"` replace
this `<Ipv4 Address>` to the `Copied Ipv4 Address`


### Step-4 : Install requirements
Run the command
```bash
npm install
```



### Step-5 : Run the application
```bash
npx expo start
```

### Step-6 : Open the App on your phone and Scan the QR

![image](https://github.com/user-attachments/assets/98fd243c-4bcb-4027-bb42-b69b98971236)


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
## Step-2 : Install requirements
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

![image](https://github.com/user-attachments/assets/241febc5-572b-488c-9a38-77e3bd0cb8d8)


## Step-8 : Start confluentinc/cp-kafka
1. Run the command
    ```bash
    docker run -p 9092:9092 -e KAFKA_ZOOKEEPER_CONNECT=<IpV4 Address>:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<IpV4 Address>:9092 -e KAFKA_LISTENER_SECURITY_PROTOCOL=PLAINTEXT -e KAFKA_LISTENER_PORT=9092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 confluentinc/cp-kafka
    ```

2. And also update `backend/.env` here `BROKERS_CONNECTING_IP="192.168.0.101:9092` simply update `192.168.0.101` to the same `<IpV4 Address>`

## Step-9 : Start Redis Server
1. Run the command 
    ```bash
    docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
    ```

    

## Step-10 : Start the backend Server
Run the command
```bash
npm start
```

# API SERVER SETUP

```bash
cd apiServer
```
Download Neccessary modules
```bash
npm install
```
Start Server
```bash
npm start
```


# Docker Frontend Setup

```bash
docker run --rm -it --network="bridge" -p 8081:8081 -p 19000:19000 -p 19001:19001 -p 19002:19002 -e REACT_NATIVE_PACKAGER_HOSTNAME=<Ipv4 Address> -v "D:\Data\mapelite-test\maplite\frontend:/app" <your-image> npx expo start --host lan
```