FROM golang:1.19
WORKDIR /go/src/webserver
COPY . . 
RUN go mod init example.com/webserver && go mod tidy 
RUN go build -o bin/server cmd/webserver.go
