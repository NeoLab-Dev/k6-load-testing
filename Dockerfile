# Stage 1: build k6 with xk6-output-statsd
FROM golang:1.24 as builder

# Устанавливаем необходимые зависимости
RUN apt-get update && apt-get install -y wget

# Установка xk6
RUN go install go.k6.io/xk6/cmd/xk6@latest

# Добавляем $GOPATH/bin в PATH
ENV PATH="/go/bin:${PATH}"

# Скачиваем и создаём бинарник с нужным плагином
RUN xk6 build --with github.com/LeonAdato/xk6-output-statsd

# Stage 2: минимальный финальный образ
FROM alpine:3.19

# Устанавливаем сертификаты
RUN apk add --no-cache ca-certificates

# Копируем собранный бинарник из предыдущего этапа
COPY --from=builder /go/k6 /usr/bin/k6

# Убедитесь, что на целевой машине есть архитектура amd64
# Используйте этот образ с нужной платформой для вашего архитектурного контекста
ENTRYPOINT ["k6"]
