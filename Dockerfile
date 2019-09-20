FROM golang:1.13-alpine as builder

WORKDIR /workdir
COPY . .

ARG GOPROXY
RUN CGO_ENABLED=0 go vet ./...
RUN CGO_ENABLED=0 go get golang.org/x/tools/go/analysis/passes/shadow/cmd/shadow \
    && CGO_ENABLED=0 shadow ./...
# FIXME: fix all unit tests
RUN CGO_ENABLED=0 go test ./... || true
RUN CGO_ENABLED=0 GOOS=linux go build .

FROM alpine

COPY --from=builder /workdir/dccn-gateway /dccn-gateway
RUN ln -s /dccn-gateway /usr/local/bin
CMD ["dccn-gateway"]