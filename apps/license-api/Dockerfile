FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o license-api .

FROM alpine:latest AS runner
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/license-api .
EXPOSE 8080
CMD ["./license-api"]