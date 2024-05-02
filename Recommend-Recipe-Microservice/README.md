# Recommend-Recipe-Microservice
This Microservice gets the stock of the user from Microservice 1 and sends it to LLM llama 2 with a prompt, getting a recipe recommend back which only uses stuff in the stock. 

## Prerequisites
1. Docker Desktop
2. helm

## Getting stared with K8s
1. Open docker desktop and start k8s.
2. Install the helm chart for Ollama:
```
helm install ollama /"Path to your CPSC 415-01 Project folder"/CPSC-415-01-Project/Recommend-Recipe-Microservice/ollama-0.21.1.tgz  
```  
Replace "Path to your CPSC 415-01 Project folder" to the actual path please.

3. Deploy MS3 on k8s:
```
kubectl apply -f deployment.yaml                          
kubectl apply -f service.yaml
```
4. Connect your local port with the inner port of the container.
```
kubectl port-forward service/jeffyf-app-service 2001:2001
``` 
5. Visting the Swagger UI at http://localhost:2001/swagger 
  
