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
-  [Download](https://ollama.com/download/Ollama-darwin.zip)
2. Ollama-js
- 
```
npm i ollama
```
3. llama 2
```
ollama run llama2
```