FROM golang:1.11.4-alpine as builder

WORKDIR /go/src/github.com/Ankr-network/dccn-gateway
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o cmd/dccn-gateway ./main.go

FROM golang:1.11.4-alpine

COPY --from=builder /go/src/github.com/Ankr-network/dccn-gateway/cmd/dccn-gateway /
CMD ["/dccn-gateway"]