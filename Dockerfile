FROM 299306500706.dkr.ecr.us-east-1.amazonaws.com/node:15.8.0

WORKDIR /app
COPY . /app/
RUN npm install


CMD npm start --port 80
