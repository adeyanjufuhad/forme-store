package store

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/mail"
	"os"
	"os/signal"
	"sort"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed catalog.json schema.sql
var assets embed.FS

type Product struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	Category    string           `json:"category"`
	Description string           `json:"description"`
	Detail      string           `json:"detail"`
	Color       string           `json:"color"`
	Image       string           `json:"image"`
	Prices      map[string]int64 `json:"prices"`
	Sizes       []string         `json:"sizes"`
	Stock       int              `json:"stock"`
	Tag         string           `json:"tag,omitempty"`
	Position    int              `json:"position"`
}
type Line struct {
	ProductID string `json:"productId"`
	Size      string `json:"size"`
	Quantity  int    `json:"quantity"`
}
type Customer struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Address    string `json:"address"`
	City       string `json:"city"`
	Country    string `json:"country"`
	PostalCode string `json:"postalCode"`
}
type OrderRequest struct {
	Currency string   `json:"currency"`
	Items    []Line   `json:"items"`
	Customer Customer `json:"customer"`
}
type OrderLine struct {
	Line
	Name      string `json:"name"`
	UnitPrice int64  `json:"unitPrice"`
}
type Order struct {
	ID       string      `json:"id"`
	Currency string      `json:"currency"`
	Total    int64       `json:"total"`
	Items    []OrderLine `json:"items"`
	Status   string      `json:"status"`
	Demo     bool        `json:"demo"`
}
type savedOrder struct {
	Hash  string
	Order Order
}
type app struct {
	pool     *pgxpool.Pool
	products []Product
	mu       sync.Mutex
	orders   map[string]savedOrder
	origin   string
}

var errInvalid = errors.New("invalid order")
var errUnavailable = errors.New("an item is unavailable in the requested size or quantity")
var errConflict = errors.New("this checkout key was already used for a different order")

func seedCatalog() []Product {
	data, err := assets.ReadFile("catalog.json")
	if err != nil {
		panic(err)
	}
	var products []Product
	if err := json.Unmarshal(data, &products); err != nil {
		panic(err)
	}
	return products
}
func newID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[:4], b[4:6], b[6:8], b[8:10], b[10:])
}
func validate(req OrderRequest) error {
	if req.Currency != "NGN" && req.Currency != "USD" {
		return fmt.Errorf("%w: choose NGN or USD", errInvalid)
	}
	if len(req.Items) == 0 || len(req.Items) > 30 {
		return fmt.Errorf("%w: your bag must contain 1–30 items", errInvalid)
	}
	for _, line := range req.Items {
		if line.Quantity < 1 || line.Quantity > 10 || len(line.ProductID) > 80 || len(line.Size) > 30 {
			return fmt.Errorf("%w: quantity must be between 1 and 10", errInvalid)
		}
	}
	c := req.Customer
	parsed, err := mail.ParseAddress(c.Email)
	if err != nil || parsed.Address != c.Email || len(c.Email) > 254 {
		return fmt.Errorf("%w: enter a valid email address", errInvalid)
	}
	for _, value := range []string{c.Name, c.Address, c.City, c.Country} {
		if len(strings.TrimSpace(value)) < 2 || len(value) > 300 {
			return fmt.Errorf("%w: complete your name and delivery address", errInvalid)
		}
	}
	if len(c.PostalCode) > 30 {
		return fmt.Errorf("%w: postal code is too long", errInvalid)
	}
	return nil
}
func priceOrder(req OrderRequest, products []Product) (Order, error) {
	if err := validate(req); err != nil {
		return Order{}, err
	}
	index := make(map[string]Product)
	for _, p := range products {
		index[p.ID] = p
	}
	order := Order{ID: newID(), Currency: req.Currency, Status: "demo", Demo: true, Items: []OrderLine{}}
	quantities := make(map[string]int)
	for _, line := range req.Items {
		p, ok := index[line.ProductID]
		if !ok {
			return Order{}, errUnavailable
		}
		sizeOK := false
		for _, size := range p.Sizes {
			if size == line.Size {
				sizeOK = true
				break
			}
		}
		quantities[p.ID] += line.Quantity
		if !sizeOK || quantities[p.ID] > p.Stock || p.Prices[req.Currency] <= 0 {
			return Order{}, errUnavailable
		}
		order.Total += p.Prices[req.Currency] * int64(line.Quantity)
		order.Items = append(order.Items, OrderLine{Line: line, Name: p.Name, UnitPrice: p.Prices[req.Currency]})
	}
	return order, nil
}
func (a *app) catalog(ctx context.Context) ([]Product, error) {
	if a.pool == nil {
		return a.products, nil
	}
	rows, err := a.pool.Query(ctx, "SELECT data, stock FROM products ORDER BY COALESCE((data->>'position')::int, 1000), id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	products := []Product{}
	for rows.Next() {
		var data []byte
		var stock int
		if err := rows.Scan(&data, &stock); err != nil {
			return nil, err
		}
		var p Product
		if err := json.Unmarshal(data, &p); err != nil {
			return nil, err
		}
		p.Stock = stock
		products = append(products, p)
	}
	return products, rows.Err()
}
func (a *app) createOrder(ctx context.Context, req OrderRequest, key string) (Order, error) {
	if err := validate(req); err != nil {
		return Order{}, err
	}
	// This portfolio accepts only simulated orders. Never persist a visitor's contact details.
	req.Customer = Customer{Name: "Portfolio Visitor", Email: "visitor@example.com", Address: "12 Concept Street", City: "Lagos", Country: "Nigeria"}
	data, _ := json.Marshal(req)
	hash := sha256.Sum256(data)
	requestHash := hex.EncodeToString(hash[:])
	if a.pool == nil {
		a.mu.Lock()
		defer a.mu.Unlock()
		if existing, ok := a.orders[key]; ok {
			if existing.Hash != requestHash {
				return Order{}, errConflict
			}
			return existing.Order, nil
		}
		order, err := priceOrder(req, a.products)
		if err != nil {
			return Order{}, err
		}
		// Unpaid orders do not reserve inventory. Payment integration must reserve atomically.
		a.orders[key] = savedOrder{Hash: requestHash, Order: order}
		return order, nil
	}
	tx, err := a.pool.Begin(ctx)
	if err != nil {
		return Order{}, err
	}
	defer tx.Rollback(ctx)
	// Serialize duplicate requests across all API instances without storing PII in a lock key.
	if _, err = tx.Exec(ctx, "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", key); err != nil {
		return Order{}, err
	}
	var oldHash string
	var old Order
	var oldItems []byte
	err = tx.QueryRow(ctx, "SELECT id::text, request_hash, currency, total, items, status FROM orders WHERE idempotency_key=$1", key).Scan(&old.ID, &oldHash, &old.Currency, &old.Total, &oldItems, &old.Status)
	if err == nil {
		if oldHash != requestHash {
			return Order{}, errConflict
		}
		if err = json.Unmarshal(oldItems, &old.Items); err != nil {
			return Order{}, err
		}
		old.Demo = true
		return old, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return Order{}, err
	}
	ids := []string{}
	seen := map[string]bool{}
	for _, line := range req.Items {
		if !seen[line.ProductID] {
			ids = append(ids, line.ProductID)
			seen[line.ProductID] = true
		}
	}
	sort.Strings(ids)
	products := []Product{}
	for _, id := range ids {
		var raw []byte
		var stock int
		err = tx.QueryRow(ctx, "SELECT data, stock FROM products WHERE id=$1 FOR SHARE", id).Scan(&raw, &stock)
		if errors.Is(err, pgx.ErrNoRows) {
			return Order{}, errUnavailable
		}
		if err != nil {
			return Order{}, err
		}
		var p Product
		if err = json.Unmarshal(raw, &p); err != nil {
			return Order{}, err
		}
		p.Stock = stock
		products = append(products, p)
	}
	order, err := priceOrder(req, products)
	if err != nil {
		return Order{}, err
	}
	items, _ := json.Marshal(order.Items)
	customer, _ := json.Marshal(req.Customer)
	_, err = tx.Exec(ctx, "INSERT INTO orders(id,idempotency_key,request_hash,currency,total,items,customer,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", order.ID, key, requestHash, order.Currency, order.Total, items, customer, order.Status)
	if err != nil {
		return Order{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return Order{}, err
	}
	return order, nil
}
func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(value)
}
func (a *app) handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		if a.pool != nil {
			ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
			defer cancel()
			if err := a.pool.Ping(ctx); err != nil {
				writeJSON(w, 503, map[string]string{"status": "unavailable"})
				return
			}
		}
		mode := "database"
		if a.pool == nil {
			mode = "demo"
		}
		writeJSON(w, 200, map[string]string{"status": "ok", "mode": mode})
	})
	mux.HandleFunc("GET /api/products", func(w http.ResponseWriter, r *http.Request) {
		products, err := a.catalog(r.Context())
		if err != nil {
			log.Print("catalog query failed")
			writeJSON(w, 503, map[string]string{"error": "The collection is unavailable. Please try again shortly."})
			return
		}
		mode := "database"
		if a.pool == nil {
			mode = "demo"
		}
		writeJSON(w, 200, map[string]any{"products": products, "mode": mode})
	})
	mux.HandleFunc("POST /api/orders", func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin != "" && origin != a.origin {
			writeJSON(w, 403, map[string]string{"error": "This checkout origin is not allowed."})
			return
		}
		if !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
			writeJSON(w, 415, map[string]string{"error": "Use application/json."})
			return
		}
		key := r.Header.Get("Idempotency-Key")
		if len(key) < 16 || len(key) > 100 {
			writeJSON(w, 400, map[string]string{"error": "A valid checkout key is required."})
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, 32*1024)
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		var req OrderRequest
		if err := decoder.Decode(&req); err != nil {
			writeJSON(w, 400, map[string]string{"error": "Check the checkout details and try again."})
			return
		}
		if err := decoder.Decode(&struct{}{}); err != io.EOF {
			writeJSON(w, 400, map[string]string{"error": "Invalid checkout body."})
			return
		}
		order, err := a.createOrder(r.Context(), req, key)
		if err != nil {
			status := 500
			message := "Your order could not be saved. Please try again."
			if errors.Is(err, errInvalid) {
				status = 400
				message = err.Error()
			}
			if errors.Is(err, errUnavailable) || errors.Is(err, errConflict) {
				status = 409
				message = err.Error()
			}
			if status == 500 {
				log.Print("order write failed")
			}
			writeJSON(w, status, map[string]string{"error": message})
			return
		}
		writeJSON(w, 201, order)
	})
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
		defer cancel()
		mux.ServeHTTP(w, r.WithContext(ctx))
	})
}

// NewHandler shares the same catalog and order implementation between the CLI and Vercel.
func NewHandler(ctx context.Context) (http.Handler, func(), error) {
	a, err := connect(ctx)
	if err != nil {
		return nil, nil, err
	}
	close := func() {
		if a.pool != nil {
			a.pool.Close()
		}
	}
	return a.handler(), close, nil
}

func connect(ctx context.Context) (*app, error) {
	a := &app{products: seedCatalog(), orders: map[string]savedOrder{}, origin: os.Getenv("WEB_ORIGIN")}
	if a.origin == "" {
		a.origin = "http://127.0.0.1:3000"
	}
	if url := os.Getenv("DATABASE_URL"); url != "" {
		config, err := pgxpool.ParseConfig(url)
		if err != nil {
			return nil, errors.New("DATABASE_URL is invalid")
		}
		if config.ConnConfig.TLSConfig == nil {
			return nil, errors.New("database TLS is required")
		}
		for _, fallback := range config.ConnConfig.Fallbacks {
			if fallback.TLSConfig == nil {
				return nil, errors.New("plaintext database fallback is not allowed")
			}
		}
		config.MaxConns = 5
		a.pool, err = pgxpool.NewWithConfig(ctx, config)
		if err != nil {
			return nil, errors.New("could not initialize database connection")
		}
		if err = a.pool.Ping(ctx); err != nil {
			a.pool.Close()
			return nil, errors.New("could not connect to database")
		}
	} else if os.Getenv("DEMO_MODE") != "true" {
		return nil, errors.New("set DATABASE_URL for Neon or DEMO_MODE=true for a local preview")
	}
	return a, nil
}

func Run() {
	migrate := flag.Bool("migrate", false, "Apply schema migrations")
	refresh := flag.Bool("refresh-catalog", false, "Refresh the fictional portfolio catalog")
	seed := flag.Bool("seed", false, "Seed sample products without overwriting existing rows")
	flag.Parse()
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	a, err := connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	if a.pool != nil {
		defer a.pool.Close()
	}
	if *migrate || *seed || *refresh {
		if a.pool == nil {
			log.Fatal("Migrations require DATABASE_URL")
		}
		if *migrate {
			sql, _ := assets.ReadFile("schema.sql")
			if _, err := a.pool.Exec(ctx, string(sql)); err != nil {
				log.Fatal("Migration failed")
			}
		}
		if *seed || *refresh {
			for _, p := range a.products {
				raw, _ := json.Marshal(p)
				query := "INSERT INTO products(id,data,stock) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING"
				if *refresh {
					query = "INSERT INTO products(id,data,stock) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data, stock=EXCLUDED.stock"
				}
				if _, err := a.pool.Exec(ctx, query, p.ID, raw, p.Stock); err != nil {
					log.Fatal("Catalog seed failed")
				}
			}
		}
		log.Print("Database prepared")
		return
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	host := os.Getenv("API_HOST")
	if host == "" {
		host = "127.0.0.1"
	}
	if a.pool == nil {
		host = "127.0.0.1"
		log.Print("DEMO MODE: sample catalog; orders are temporary; no payments")
	}
	server := &http.Server{Addr: net.JoinHostPort(host, port), Handler: a.handler(), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 10 * time.Second, WriteTimeout: 15 * time.Second, IdleTimeout: 60 * time.Second, MaxHeaderBytes: 16 * 1024}
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-signals
		shutdownCtx, done := context.WithTimeout(context.Background(), 5*time.Second)
		defer done()
		server.Shutdown(shutdownCtx)
	}()
	log.Printf("FORME API listening on %s", server.Addr)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}
