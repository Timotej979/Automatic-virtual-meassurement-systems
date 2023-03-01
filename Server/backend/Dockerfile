FROM golang:1.20.1-bullseye
 
###################### Set workdir and copy to the correct directory ######################
WORKDIR /webserver
COPY go.mod .

###################### Install GO dependencies and copy main script ######################
RUN go mod download
COPY main.go .

###################### Build GO webserver with optional config ######################
RUN go build -o /godocker
 
###################### Expose docker port ######################
EXPOSE 8080
 
###################### Run GO webserver ######################
CMD [ “/godocker” ]