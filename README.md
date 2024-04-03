# Recommend-Recipe-Microservice
This Microservice get the stock of the user from Microservice 1 and send it to LLM llama 2 with a prompt, getting a recipe recommend back which only uses stuff in the stock. 

## Prerequisites
1. Docker Desktop
2. helm

## Getting stared with Ollama 
1. Open docker desktop and start k8s.
2. Install helm chart:
```
helm install ollama /"Path to your CPSC 415-01 Project folder"/CPSC-415-01-Project/Recommend-Recipe-Microservice/ollama-0.21.1.tgz  
```  
Replace the quotation marks with actual ones!!!
3. Connecting your local port 11434 with Ollama:
```
kubectl port-forward service/ollama 11434:11434  
```  

## Getting stared with MS 3

2. Run app.js locally.
```
node app
```

3. Visting the Swagger UI at http://localhost:2001/swagger 
  

### Getting stared with MS 3 in container(Can't connect to Ollama yet)
1. Get an image for app.js
```
docker pull jeffyf/app.js:latest
```
or 
```
docker build -t app.js:latest .
```
2. Get a container for app.js
```
docker run -d --name app.js -p 2001:2001 jeffyf/app.js:latest
```  
  
    
      

# TrinicollBot
This application is designed to create a TrincollBot to answer question regarding Trinity College, including courses, professors, canteens, accommodation, etc.


## Notes
1. method "ask" works now but "generate" is still not working




## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

1. 
```
node app.js  
```
2. http://localhost:2001/swagger

### Docker
1. 
```
docker build -t trincollbot:0.0.3 . 
```
2.
```
docker run -d -p [any port you want]:2001 --name trincollbot trincollbot:0.0.3
```


### Prerequisites

1. Ollama

 - [Download](https://ollama.com/download/Ollama-darwin.zip)

2. Ollama-js
```
npm i ollama
```

3. llama 2
```
ollama run llama2
```

