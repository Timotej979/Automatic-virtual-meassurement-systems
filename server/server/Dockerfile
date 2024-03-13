FROM golang:1.19
WORKDIR /go/src/server
COPY . . 
RUN go mod init example.com/server && go mod tidy && go build -o bin/server src/server.go