FROM golang:1.23 AS builder

RUN go install go.k6.io/xk6/cmd/xk6@latest

RUN xk6 build --with github.com/grafana/xk6-output-datadog

FROM alpine:latest

RUN apk add --no-cache ca-certificates

COPY --from=builder /go/k6 /usr/bin/k6

ENTRYPOINT ["k6"]

