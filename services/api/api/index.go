package handler

import (
	"context"
	"log"
	"net/http"
	"sync"
	"time"

	store "github.com/adeyanjufuhad/forme-store/services/api/internal/store"
)

var instance struct {
	sync.Mutex
	handler http.Handler
}

// Handler reuses a bounded Postgres pool within a warm Vercel function.
// Failed initialization can retry on the next request after a transient outage.
func Handler(w http.ResponseWriter, r *http.Request) {
	instance.Lock()
	if instance.handler == nil {
		ctx, cancel := context.WithTimeout(context.Background(), 12*time.Second)
		handler, _, err := store.NewHandler(ctx)
		cancel()
		if err != nil {
			instance.Unlock()
			log.Print("API initialization failed")
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Cache-Control", "no-store")
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte(`{"error":"The store is temporarily unavailable. Please try again."}`))
			return
		}
		instance.handler = handler
	}
	handler := instance.handler
	instance.Unlock()
	handler.ServeHTTP(w, r)
}
