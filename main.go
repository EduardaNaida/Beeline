package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/00oskpet/beeline/database"
	"github.com/00oskpet/beeline/server"
	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()

	rdb := database.NewRedisDB()
	log.Print(database.Ping(rdb))

	env := server.Environment{Database: rdb, QTokenLength: 20, PageSize: 50}

	apiRouter := router.PathPrefix("/API/v1").Subrouter()

	sensorRouter := router.PathPrefix("/sensor").Subrouter()

	sensorRouter.Handle("/{id}", server.NewRESTHandler(server.UpdateVisitorCount, env)).Methods(http.MethodPut)
	sensorRouter.Use(server.AuthenticateStore(env))

	apiRouter.Handle("/sensor/{id}", server.NewRESTHandler(server.GetVisitorCount, env)).Methods(http.MethodGet)

	apiRouter.Handle("/checkout/queue/{id}", server.NewRESTHandler(server.IndexInQueueCheckout, env)).Methods(http.MethodGet)
	apiRouter.Handle("/checkout/queue/{id}", server.NewRESTHandler(server.EnqueueCheckout, env)).Methods(http.MethodPost)
	apiRouter.Handle("/checkout/queue/{id}", server.NewRESTHandler(server.DequeueCheckout, env)).Methods(http.MethodDelete)

	apiRouter.Handle("/checkout/queue/waittime/{id}", server.NewRESTHandler(server.GetAvgWaitTimeCheckout, env)).Methods(http.MethodGet)
	apiRouter.Handle("/checkout/queue/length/{id}", server.NewRESTHandler(server.LengthOfQueueCheckout, env)).Methods(http.MethodGet)
	apiRouter.Handle("/checkout/queue/serve/{id}", server.NewRESTHandler(server.ServeCustomer, env)).Methods(http.MethodDelete)

	apiRouter.Handle("/queue/{id}", server.NewRESTHandler(server.IndexInQueue, env)).Methods(http.MethodGet)
	apiRouter.Handle("/queue/{id}", server.NewRESTHandler(server.Enqueue, env)).Methods(http.MethodPost)
	apiRouter.Handle("/queue/{id}", server.NewRESTHandler(server.Dequeue, env)).Methods(http.MethodDelete)

	apiRouter.Handle("/queue/isinqueue/{id}", server.NewRESTHandler(server.IsInQueue, env)).Methods(http.MethodGet)
	apiRouter.Handle("/queue/waittime/{id}", server.NewRESTHandler(server.GetAvgWaitTime, env)).Methods(http.MethodGet)
	apiRouter.Handle("/queue/length/{id}", server.NewRESTHandler(server.LengthOfQueue, env)).Methods(http.MethodGet)

	apiRouter.Handle("/store/id/{id}", server.NewRESTHandler(server.GetStore, env)).Methods(http.MethodGet)
	apiRouter.Handle("/stores/{index}", server.NewRESTHandler(server.GetAllStores, env)).Methods(http.MethodGet)

	buildHandler := http.FileServer(http.Dir("frontend/build"))
	router.PathPrefix("/").Handler(buildHandler)

	fmt.Printf("Starting server at port 8080\n")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal(err)
	}
}
