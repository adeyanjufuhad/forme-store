package store

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func validRequest() OrderRequest {
	return OrderRequest{Currency: "NGN", Items: []Line{{ProductID: "daily-hoodie", Size: "M", Quantity: 2}}, Customer: Customer{Name: "Test Shopper", Email: "shopper@example.com", Address: "12 Sample Street", City: "Lagos", Country: "Nigeria"}}
}
func testApp() *app {
	return &app{products: seedCatalog(), orders: map[string]savedOrder{}, origin: "http://127.0.0.1:3000"}
}

func TestNeonOrderPersistence(t *testing.T) {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		t.Skip("Set DATABASE_URL to run the Neon integration check")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatal("Could not initialize the integration database")
	}
	defer pool.Close()
	a := testApp()
	a.pool = pool
	products, err := a.catalog(ctx)
	if err != nil || len(products) == 0 {
		t.Fatal("Neon catalog read failed")
	}
	key := "forme-integration-" + newID()
	req := validRequest()
	req.Customer.Name = "FORME Integration Test"
	first, err := a.createOrder(ctx, req, key)
	if err != nil {
		t.Fatal("Neon order write failed")
	}
	second, err := a.createOrder(ctx, req, key)
	if err != nil || first.ID != second.ID || !second.Demo {
		t.Fatal("Persisted order was not returned on retry")
	}
	var count int
	if err = pool.QueryRow(ctx, "SELECT count(*) FROM orders WHERE idempotency_key=$1", key).Scan(&count); err != nil || count != 1 {
		t.Fatal("Expected exactly one saved order in Neon")
	}
	req.Items[0].Quantity = 1
	if _, err = a.createOrder(ctx, req, key); !errors.Is(err, errConflict) {
		t.Fatal("Persisted checkout key accepted a different order")
	}
}
func TestCurrencyTotalsFromCatalog(t *testing.T) {
	for currency, want := range map[string]int64{"NGN": 15600000, "USD": 13600} {
		t.Run(currency, func(t *testing.T) {
			req := validRequest()
			req.Currency = currency
			order, err := priceOrder(req, seedCatalog())
			if err != nil {
				t.Fatal(err)
			}
			if order.Total != want || order.Items[0].UnitPrice*2 != want {
				t.Fatalf("got %d, want %d", order.Total, want)
			}
		})
	}
}
func TestInvalidSizeAndAggregatedStock(t *testing.T) {
	req := validRequest()
	req.Items[0].Size = "EU 99"
	if _, err := priceOrder(req, seedCatalog()); !errors.Is(err, errUnavailable) {
		t.Fatalf("invalid size accepted: %v", err)
	}
	req = validRequest()
	req.Items = []Line{{ProductID: "orange-hoodie", Size: "M", Quantity: 10}, {ProductID: "orange-hoodie", Size: "L", Quantity: 10}}
	if _, err := priceOrder(req, seedCatalog()); !errors.Is(err, errUnavailable) {
		t.Fatalf("aggregate stock bypass: %v", err)
	}
}
func TestOrderValidation(t *testing.T) {
	cases := []struct {
		name   string
		change func(*OrderRequest)
	}{{"currency", func(r *OrderRequest) { r.Currency = "EUR" }}, {"negative quantity", func(r *OrderRequest) { r.Items[0].Quantity = -1 }}, {"large quantity", func(r *OrderRequest) { r.Items[0].Quantity = 11 }}, {"email", func(r *OrderRequest) { r.Customer.Email = "not-an-email" }}, {"address", func(r *OrderRequest) { r.Customer.Address = " " }}, {"empty bag", func(r *OrderRequest) { r.Items = nil }}}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := validRequest()
			tc.change(&req)
			if _, err := priceOrder(req, seedCatalog()); !errors.Is(err, errInvalid) {
				t.Fatalf("invalid input accepted: %v", err)
			}
		})
	}
}
func TestConcurrentCheckoutIsIdempotent(t *testing.T) {
	a := testApp()
	req := validRequest()
	var group sync.WaitGroup
	ids := make(chan string, 20)
	for range 20 {
		group.Add(1)
		go func() {
			defer group.Done()
			order, err := a.createOrder(context.Background(), req, "checkout-unique-key-123")
			if err != nil {
				t.Error(err)
				return
			}
			ids <- order.ID
		}()
	}
	group.Wait()
	close(ids)
	id := ""
	for current := range ids {
		if id != "" && id != current {
			t.Fatal("duplicate order created")
		}
		id = current
	}
	if len(a.orders) != 1 {
		t.Fatalf("got %d orders", len(a.orders))
	}
	req.Items[0].Quantity = 1
	if _, err := a.createOrder(context.Background(), req, "checkout-unique-key-123"); !errors.Is(err, errConflict) {
		t.Fatalf("key reuse accepted: %v", err)
	}
}
func TestHTTPCheckoutValidationAndReceipt(t *testing.T) {
	a := testApp()
	handler := a.handler()
	body, _ := json.Marshal(validRequest())
	request := httptest.NewRequest("POST", "/api/orders", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Idempotency-Key", "checkout-valid-key-123")
	request.Header.Set("Origin", a.origin)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != 201 {
		t.Fatal(response.Code, response.Body.String())
	}
	if strings.Contains(response.Body.String(), "shopper@example.com") {
		t.Fatal("receipt exposes customer details")
	}
	var order Order
	if err := json.Unmarshal(response.Body.Bytes(), &order); err != nil {
		t.Fatal(err)
	}
	if !order.Demo || order.Total != 15600000 || order.Status != "demo" {
		t.Fatalf("unexpected receipt: %+v", order)
	}
	t.Run("client price rejected", func(t *testing.T) {
		request := httptest.NewRequest("POST", "/api/orders", strings.NewReader(strings.TrimSuffix(string(body), "}")+`,"total":1}`))
		request.Header.Set("Content-Type", "application/json")
		request.Header.Set("Idempotency-Key", "checkout-tamper-key-123")
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, request)
		if response.Code != 400 {
			t.Fatal("client supplied total accepted", response.Code)
		}
	})
	t.Run("foreign origin rejected", func(t *testing.T) {
		request := httptest.NewRequest("POST", "/api/orders", bytes.NewReader(body))
		request.Header.Set("Origin", "https://other.example")
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, request)
		if response.Code != 403 {
			t.Fatal(response.Code)
		}
	})
}
