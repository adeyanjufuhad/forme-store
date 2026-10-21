FROM golang:1.27-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -o /forme-api ./cmd/server

FROM alpine:3.23
RUN apk add --no-cache ca-certificates && adduser -D -u 10001 app
WORKDIR /app
COPY --from=build /forme-api /app/forme-api
USER app
ENV PORT=8080 API_HOST=0.0.0.0
EXPOSE 8080
ENTRYPOINT ["/app/forme-api"]
