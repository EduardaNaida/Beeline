package database

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
)

type RedisDB redis.Client

type Store struct {
	ID      string
	Name    string
	Address string
	Max     int64
	IconURL string
}

type Database interface {
	AddStore(string, Store) error
	GetStore(string) (Store, error)
	GetAllStores(int64, int64) []Store

	GetSensorReading(string) (uint64, error)
	UpdateSensorReading(string, uint64) (uint64, error)

	AddToQueue(string, string) (int64, error)
	RemoveFromQueue(string, string) error
	QueuePop(string) (string, error)

	GetPlaceInQueue(string, string) (int64, error)
	LengthOfQueue(string) (int64, error)

	GetAverageWaitTime(string) (int64, error)

	AddToCheckout(string, string) (int64, error)
	RemoveFromCheckout(string, string) error
	CheckoutPop(string) (string, error)

	GetPlaceInCheckout(string, string) (int64, error)
	LengthOfCheckout(string) (int64, error)

	GetAverageWaitTimeCheckout(string) (int64, error)

	GenerateAPIKey(string) error
	ValidateAPIKey(string, string) (bool, error)
}

const (
	storePrefix    = "STORE:"
	sensorPrefix   = "SENSOR:"
	queuePrefix    = "QUEUE:"
	checkoutPrefix = "CHECKOUT:"

	storeSet = "STORES"

	arrivalTimePrefixCheckout = "ARRIVALSCHECKOUT:"
	arrivalTimePrefix         = "ARRIVALS:"

	checkoutMeans = "CHECKOUTMEANS:"
	queueMeans    = "QUEUEMEANS:"

	storeKeys = "STOREKEYS"
)

var ctx = context.TODO()

// NewRedisDB creates a new redis client
func NewRedisDB() *RedisDB {
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
	return (*RedisDB)(rdb)
}

// Ping communicates with the redis server to check if the server is responding.
// The redis server responds with Pong <nil> if there are no errors.
func Ping(rdb *RedisDB) error {
	pong, err := rdb.Ping(ctx).Result()
	if err != nil {
		return err
	}
	fmt.Println(pong, err)

	return nil
}

// GenerateAPIKey generates a new API key for a store with storeID
func (rdb *RedisDB) GenerateAPIKey(storeID string) error {
	APIKey, err := uuid.NewRandom()
	if err != nil {
		return err
	}
	_, err = rdb.HSet(ctx, storeKeys, storeID, APIKey.String()).Result()
	return err
}

// ValidateAPIKey checks if given API key is correctly corresponding with it's storeID
func (rdb *RedisDB) ValidateAPIKey(storeID, apiKey string) (bool, error) {
	token, err := rdb.HGet(ctx, storeKeys, storeID).Result()
	if err == redis.Nil {
		return false, nil
	} else if err != nil {
		return false, err
	}
	if token == apiKey {
		return true, nil
	}
	return false, nil
}

// AddStore admin function to add stores to the database
func (rdb *RedisDB) AddStore(storeID string, store Store) error {
	storeJSON, err := json.Marshal(store)
	if err != nil {
		return err
	}
	rdb.Set(ctx, storePrefix+storeID, string(storeJSON), 0)

	z := redis.Z{Member: storePrefix + storeID}
	_, err = rdb.ZAdd(ctx, storeSet, &z).Result()
	return err
}

// GetStore gets a string containing the information (ID, name, address) about a store from the redis database.
func (rdb *RedisDB) GetStore(storeID string) (Store, error) {
	var s Store
	store, err := rdb.Get(ctx, storePrefix+storeID).Result()
	if err != nil {
		return s, err
	}

	// This is stupid and should be done better.
	str := fmt.Sprintf("%v", store)
	err = json.Unmarshal([]byte(str), &s)
	if err != nil {
		return s, err
	}

	return s, nil
}

// GetAllStores gets an array containing all information about all stores
func (rdb *RedisDB) GetAllStores(start, stop int64) []Store {
	keys := rdb.ZRange(ctx, storeSet, start, stop).Val()
	var stores []Store

	for _, store := range rdb.MGet(ctx, keys...).Val() {
		var s Store

		// This is stupid and should be done better.
		str := fmt.Sprintf("%v", store)
		err := json.Unmarshal([]byte(str), &s)

		if err != nil {
			return nil
		}
		if store == nil {
			continue
		}

		stores = append(stores, s)
	}
	return stores
}

// GetSensorReading gets a measured value from a sensor.
func (rdb *RedisDB) GetSensorReading(storeID string) (uint64, error) {
	return rdb.Get(ctx, sensorPrefix+storeID).Uint64()
}

// UpdateSensorReading updates a measured value from a sensor and also returns the old value.
func (rdb *RedisDB) UpdateSensorReading(storeID string, newValue uint64) (uint64, error) {
	return rdb.GetSet(ctx, sensorPrefix+storeID, newValue).Uint64()
}

// AddToQueue adds one user at the back of the queue in a store.
func (rdb *RedisDB) AddToQueue(storeID, userID string) (int64, error) {
	arrivalTime := time.Now().Unix()
	rdb.HSet(ctx, arrivalTimePrefix+storeID, userID, arrivalTime)

	return rdb.RPush(ctx, queuePrefix+storeID, userID).Result()
}

// RemoveFromQueue removes one user from a queue.
func (rdb *RedisDB) RemoveFromQueue(storeID, userID string) error {
	_, err := rdb.LRem(ctx, queuePrefix+storeID, 1, userID).Result()
	return err
}

// QueuePop removes and returns the first user in the given queue
func (rdb *RedisDB) QueuePop(storeID string) (string, error) {
	userID, err := rdb.LPop(ctx, queuePrefix+storeID).Result()
	if err != nil {
		return userID, err
	}
	err = addMovingAverage(rdb, queueMeans, arrivalTimePrefix, storeID, userID)
	if err != nil {
		return userID, err
	}
	return userID, err
}

// GetPlaceInQueue gets information about one user's queue position.
func (rdb *RedisDB) GetPlaceInQueue(storeID, userID string) (int64, error) {
	return rdb.LPos(ctx, queuePrefix+storeID, userID, redis.LPosArgs{}).Result()
}

// LengthOfQueue checks the length of a given queue.
func (rdb *RedisDB) LengthOfQueue(storeID string) (int64, error) {
	return rdb.LLen(ctx, queuePrefix+storeID).Result()
}

func movingAverage(arrivalTime int64, means []string) (int64, error) {
	waitTime := time.Now().Unix() - arrivalTime

	if len(means) == 0 {
		return waitTime, nil
	}

	var sum int64
	for _, mean := range means {
		num, err := strconv.ParseInt(mean, 10, 64)
		if err != nil {
			return num, err
		}
		sum += num
	}

	avg := (sum + waitTime) / int64(len(means)+1)

	return avg, nil
}

func addMovingAverage(rdb *RedisDB, meanPrefix, arrPrefix, storeID, userID string) error {
	queueWaitTimes := meanPrefix + storeID

	meanList := rdb.LRange(ctx, queueWaitTimes, 0, -1).Val()
	arrTime, err := rdb.HGet(ctx, arrPrefix+storeID, userID).Int64()

	if err != nil {
		return err
	}

	avg, err := movingAverage(arrTime, meanList)

	if err != nil {
		return err
	}

	rdb.LPush(ctx, queueWaitTimes, avg)
	rdb.LTrim(ctx, queueWaitTimes, 0, 9)

	rdb.HDel(ctx, arrPrefix+storeID, userID)
	return nil
}

// GetAverageWaitTime gets the latest average wait time for a certain queue
func (rdb *RedisDB) GetAverageWaitTime(storeID string) (int64, error) {
	avg, err := rdb.LIndex(ctx, queueMeans+storeID, 0).Int64()
	if err == redis.Nil {
		return 0, nil
	} else if err != nil {
		return avg, err
	}
	return avg, nil
}

// Queuing to cash register ~~~~~~~~~~~~~~~~~~~~~

// AddToCheckout adds one user at the back of the queue in a store.
func (rdb *RedisDB) AddToCheckout(storeID, userID string) (int64, error) {
	arrivalTime := time.Now().Unix()
	rdb.HSet(ctx, arrivalTimePrefixCheckout+storeID, userID, arrivalTime)

	return rdb.RPush(ctx, checkoutPrefix+storeID, userID).Result()
}

// RemoveFromCheckout removes one user from a queue in a store.
func (rdb *RedisDB) RemoveFromCheckout(storeID, userID string) error {
	_, err := rdb.LRem(ctx, checkoutPrefix+storeID, 1, userID).Result()
	return err
}

// CheckoutPop removes and returns the first user in the given queue
func (rdb *RedisDB) CheckoutPop(storeID string) (string, error) {
	userID, err := rdb.LPop(ctx, checkoutPrefix+storeID).Result()
	if err != nil {
		return userID, err
	}
	err = addMovingAverage(rdb, checkoutMeans, arrivalTimePrefixCheckout, storeID, userID)
	return userID, err
}

// GetPlaceInCheckout gets information about one user's queue position in a store.
func (rdb *RedisDB) GetPlaceInCheckout(storeID, userID string) (int64, error) {
	return rdb.LPos(ctx, checkoutPrefix+storeID, userID, redis.LPosArgs{}).Result()
}

// LengthOfCheckout checks the length of a given queue.
func (rdb *RedisDB) LengthOfCheckout(storeID string) (int64, error) {
	return rdb.LLen(ctx, checkoutPrefix+storeID).Result()
}

// GetAverageWaitTimeCheckout gets the latest average wait time for a certain queue
func (rdb *RedisDB) GetAverageWaitTimeCheckout(storeID string) (int64, error) {
	avg, err := rdb.LIndex(ctx, checkoutMeans+storeID, 0).Int64()
	if err == redis.Nil {
		return 0, nil
	} else if err != nil {
		return avg, err
	}
	return avg, nil
}
