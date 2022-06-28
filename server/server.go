package server

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/00oskpet/beeline/database"
	"github.com/go-redis/redis/v8"
	"github.com/gorilla/mux"
)

const (
	QueueToken = "Queue-Token"
	APIKey     = "API-Key"
)

// ClientError an interface for error messages that are created during invalid use of the RESTapi.
type ClientError interface {
	Error() string
	ResponseBody() ([]byte, error)
	ResponseHeaders() (int, map[string]string)
}

// Environment a struct containing a database, queue-token length and the page size for the function GetAllStores.
type Environment struct {
	Database     database.Database
	QTokenLength int
	PageSize     int
}

// RESTHandler a struct containing an handler function and an environment.
type RESTHandler struct {
	Fn  func(http.ResponseWriter, *http.Request, Environment) error
	Env Environment
}

// APIError represents a rest API error, contains the error that caused it (if any), status return code and any additional detail.
type APIError struct {
	Cause  error
	Detail string
	Status int
}

// Error returns details and the cause of an API error.
func (e *APIError) Error() string {
	if e.Cause == nil {
		return e.Detail
	}
	return e.Detail + " : " + e.Cause.Error()
}

// ResponseBody returns JSON response body.
func (e *APIError) ResponseBody() ([]byte, error) {
	body, err := json.Marshal(e)
	if err != nil {
		return nil, fmt.Errorf("error while parsing response body: %v", err)
	}
	return body, nil
}

// ResponseHeaders returns http status code and headers.
func (e *APIError) ResponseHeaders() (status int, headers map[string]string) {
	return e.Status, map[string]string{
		"Content-Type": "application/json; charset=utf-8",
	}
}

// NewAPIError returns a new API error.
func NewAPIError(err error, status int, detail string) error {
	return &APIError{
		Cause:  err,
		Detail: detail,
		Status: status,
	}
}

// ServeHTTP allows RESTHandlers to return errors, and allows for error details in responses in the case of a client error
func (h RESTHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	err := h.Fn(w, r, h.Env)
	if err == nil {
		return
	}

	log.Printf("An error occurred: %v", err)

	APIError, ok := err.(ClientError)
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	body, err := APIError.ResponseBody() // Try to get response body of ClientError.
	if err != nil {
		log.Printf("An error occurred: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	status, headers := APIError.ResponseHeaders() // Get http status code and headers.
	for k, v := range headers {
		w.Header().Set(k, v)
	}

	w.WriteHeader(status)
	_, err = w.Write(body)
	if err != nil {
		log.Printf("An error occurred: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

// SensorUpdate a struct containing a sensor reading value
type SensorUpdate struct {
	Value uint64
}

// QueueResponse a struct for responses from queue handlers, it contains a queue-token and the index of the user in a specific queue
type QueueResponse struct {
	QueueToken string
	Index      int64
}

// InQueueResponse a struct for responses from IsInQueue, contains a bool
type InQueueResponse struct {
	InQueue bool
}

// QueueLengthResponse a struct for the LengthOfQueueCheckout handler response, it contains the length of a specific queue
type QueueLengthResponse struct {
	QueueLength int64
}

// QPopResponse a struct for ServeCustomer responses, it contains the userID of the user removed from queue
type QPopResponse struct {
	UserID string
}

// WaitTimeResponse a struct for GetAvgWaitTimeCheckout responses, it contains the average waiting time for a queue
type WaitTimeResponse struct {
	WaitTime int64
}

// GenerateQueueToken generates a length long string with random characters.
func GenerateQueueToken(storeID string, fn func(string, string) (int64, error), length, tries int) (string, error) {
	b := make([]byte, length)
	var token string
	var err error
	for i := 0; i < tries; i++ {
		_, err = rand.Read(b)
		if err != nil {
			continue
		}
		token = hex.EncodeToString(b)
		if _, err = fn(storeID, token); err == redis.Nil {
			return token, nil
		}
	}
	return token, err
}

// NonexistentToken returns true if the given token does not exist in the database.
func NonexistentToken(err error) bool {
	return err == redis.Nil
}

// updateOutsideQueue removes the first in the outside queue when the store is not full
func updateOutsideQueue(rdb database.Database, storeID string, reading uint64) error {
	var store database.Store
	var err error
	var max uint64
	store, err = rdb.GetStore(storeID)
	if err != nil {
		return err
	}

	max = uint64(store.Max)

	for i := reading; i < max; i++ {
		_, err = rdb.QueuePop(storeID)
		if err == redis.Nil {
			break
		} else if err != nil {
			return err
		}
	}

	return nil
}

// UpdateVisitorCount http handler for updating the visitor count(sensor reading) of a store
func UpdateVisitorCount(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	var update SensorUpdate
	vars := mux.Vars(r)

	err := DecodeJSONBody(w, r, &update)
	if err != nil {
		return err
	}

	res, err := rdb.UpdateSensorReading(vars["id"], update.Value)
	if err != nil {
		return fmt.Errorf("database error: %v", err)
	}

	err = updateOutsideQueue(rdb, vars["id"], res)
	if err != nil {
		return fmt.Errorf("failed queue update: %v", err)
	}

	if err = json.NewEncoder(w).Encode(SensorUpdate{res}); err != nil {
		return fmt.Errorf("cannot encode response: %v", err)
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	return nil
}

// GetVisitorCount http handler for getting the visitor count(sensor reading) of a store
func GetVisitorCount(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	res, err := rdb.GetSensorReading(vars["id"])
	if err != nil {
		return fmt.Errorf("database error: %v", err)
	}

	if err := json.NewEncoder(w).Encode(SensorUpdate{res}); err != nil {
		return fmt.Errorf("cannot encode response: %v", err)
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	return nil
}

// GetAvgWaitTimeCheckout http handler for getting the average wait time for a queue
func GetAvgWaitTimeCheckout(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	AvgWaitTime, err := rdb.GetAverageWaitTimeCheckout(vars["id"])
	if err != nil {
		return fmt.Errorf("nonexistent queue ID %s, average wait time %d: %v", vars["id"], AvgWaitTime, err)
	}
	err = json.NewEncoder(w).Encode(WaitTimeResponse{WaitTime: AvgWaitTime})
	if err != nil {
		return err
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	return nil
}

// ServeCustomer http handler for removing a customer when they have been served (this removes the first customer in a queue)
func ServeCustomer(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	userID, err := rdb.CheckoutPop(vars["id"])
	if err != nil {
		return fmt.Errorf("nonexistent queue ID %s, served customer with ID %s: %v", vars["id"], userID, err)
	}
	err = json.NewEncoder(w).Encode(QPopResponse{UserID: userID})
	if err != nil {
		return err
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	return nil
}

// LengthOfQueueCheckout http request handler which gets the length of the queue with the given queue ID
func LengthOfQueueCheckout(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	qLength, err := rdb.LengthOfCheckout(vars["id"])
	if err != nil {
		return fmt.Errorf("nonexistent queue ID %s, queue length %d: %v", vars["id"], qLength, err)
	}
	err = json.NewEncoder(w).Encode(QueueLengthResponse{QueueLength: qLength})
	if err != nil {
		return err
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	return nil
}

// queueIndex checks if given token exists and encodes it into a JSON response
func queueIndex(w http.ResponseWriter, r *http.Request, index int64, err error) error {
	token := r.Header.Get(QueueToken)

	if NonexistentToken(err) {
		s := fmt.Sprintf("nonexistent token %s, index %d", token, index)
		return NewAPIError(nil, http.StatusBadRequest, s)
	} else if err != nil {
		return err
	}
	err = json.NewEncoder(w).Encode(QueueResponse{Index: index})
	if err != nil {
		return err
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	return nil
}

// IndexInQueueCheckout http handler for getting the index of an user in a queue
func IndexInQueueCheckout(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	token := r.Header.Get(QueueToken)

	index, err := rdb.GetPlaceInCheckout(vars["id"], token)
	return queueIndex(w, r, index, err)
}

// appendQueue encodes the response to JSON and checks for errors
func appendQueue(w http.ResponseWriter, token string, qLength int64) error {
	err := json.NewEncoder(w).Encode(QueueResponse{token, qLength - 1})
	if err != nil {
		return err
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	return nil
}

// EnqueueCheckout http handler for putting an user in the back of a queue
func EnqueueCheckout(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	token, err := GenerateQueueToken(vars["id"], rdb.GetPlaceInCheckout, env.QTokenLength, 10)
	if err != nil {
		return err
	}
	qLength, err := rdb.AddToCheckout(vars["id"], token)
	if err != nil {
		print("AddToQueue error")
		return err
	}

	return appendQueue(w, token, qLength)
}

// DequeueCheckout http handler for removing an user from a queue
func DequeueCheckout(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	token := r.Header.Get(QueueToken)
	_, err := rdb.GetPlaceInCheckout(vars["id"], token)
	if NonexistentToken(err) {
		return fmt.Errorf("nonexistent token %s: %v", token, err)
	}
	err = rdb.RemoveFromCheckout(vars["id"], token)
	if err != nil {
		return err
	}
	w.WriteHeader(http.StatusOK)
	return nil
}

// GetStore http handler for getting a store
func GetStore(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	store, err := rdb.GetStore(vars["id"])
	if err != nil {
		return err
	}

	err = json.NewEncoder(w).Encode(store)
	if err != nil {
		return err
	}
	return nil
}

// GetAllStores http handler for getting all stores, paginates through Environment.PageSize stores at a time
func GetAllStores(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	index, err := strconv.Atoi(vars["index"])
	if err != nil {
		return NewAPIError(err, http.StatusBadRequest, "could not convert index to integer")
	}

	start := index * env.PageSize
	stop := (index + 1) * env.PageSize
	res := rdb.GetAllStores(int64(start), int64(stop))

	err = json.NewEncoder(w).Encode(res)
	if err != nil {
		return err
	}
	return nil
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// GetAvgWaitTime http handler for getting the average wait time for a queue
func GetAvgWaitTime(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	AvgWaitTime, err := rdb.GetAverageWaitTime(vars["id"])
	if err != nil {
		return fmt.Errorf("nonexistent queue ID %s, average wait time %d: %v", vars["id"], AvgWaitTime, err)
	}
	err = json.NewEncoder(w).Encode(WaitTimeResponse{WaitTime: AvgWaitTime})
	if err != nil {
		return err
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	return nil
}

// LengthOfQueue http request handler which gets the length of the queue with the given queue ID
func LengthOfQueue(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	qLength, err := rdb.LengthOfQueue(vars["id"])
	if err != nil {
		return fmt.Errorf("nonexistent queue ID %s, queue length %d: %v", vars["id"], qLength, err)
	}
	err = json.NewEncoder(w).Encode(QueueLengthResponse{QueueLength: qLength})
	if err != nil {
		return err
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	return nil
}

// IsInQueue http request handler which checks if given user is in a given queue
func IsInQueue(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	token := r.Header.Get(QueueToken)

	_, err := rdb.GetPlaceInQueue(vars["id"], token)
	if !NonexistentToken(err) && err != nil {
		return err
	}
	err = json.NewEncoder(w).Encode(InQueueResponse{InQueue: !NonexistentToken(err)})
	if err != nil {
		return err
	}
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	return nil
}

// IndexInQueue http handler for getting the index of an user in a queue
func IndexInQueue(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	token := r.Header.Get(QueueToken)

	index, err := rdb.GetPlaceInQueue(vars["id"], token)
	return queueIndex(w, r, index, err)
}

// Enqueue http handler for putting an user in the back of a queue
func Enqueue(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	token, err := GenerateQueueToken(vars["id"], rdb.GetPlaceInQueue, env.QTokenLength, 10)
	if err != nil {
		return err
	}

	qLength, err := rdb.AddToQueue(vars["id"], token)
	if err != nil {
		print("AddToQueue error")
		return err
	}

	return appendQueue(w, token, qLength)
}

// Dequeue http handler for removing an user from a queue
func Dequeue(w http.ResponseWriter, r *http.Request, env Environment) error {
	rdb := env.Database
	vars := mux.Vars(r)

	token := r.Header.Get(QueueToken)
	_, err := rdb.GetPlaceInQueue(vars["id"], token)
	if NonexistentToken(err) {
		return fmt.Errorf("nonexistent token %s: %v", token, err)
	}
	err = rdb.RemoveFromQueue(vars["id"], token)
	if err != nil {
		return err
	}
	w.WriteHeader(http.StatusOK)
	return nil
}

// AuthenticateStore authenticates a store's request
func AuthenticateStore(env Environment) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return NewRESTHandler(func(w http.ResponseWriter, r *http.Request, env Environment) error {
			rdb := env.Database
			vars := mux.Vars(r)
			storeID := vars["id"]
			key := r.Header.Get(APIKey)

			isValid, err := rdb.ValidateAPIKey(storeID, key)
			if err != nil {
				return err
			}

			if !isValid {
				return NewAPIError(err, http.StatusUnauthorized, "Invalid API Key")
			}
			// Call the next handler, which can be another middleware in the chain, or the final handler.
			next.ServeHTTP(w, r)
			return nil
		}, env)
	}
}

// NewRESTHandler creates a new RESTHandler with the given RESTHandler function and environment
func NewRESTHandler(fn func(http.ResponseWriter, *http.Request, Environment) error, env Environment) *RESTHandler {
	return &RESTHandler{Fn: fn, Env: env}
}
