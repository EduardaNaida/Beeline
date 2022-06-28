package database

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/go-redis/redis/v8"
	"github.com/go-redis/redismock/v8"
	"github.com/stretchr/testify/suite"
)

const (
	APIKey = "APIKey"
)

type TestSuite struct {
	suite.Suite
	db   *RedisDB
	mock redismock.ClientMock
}

type QueueSuite TestSuite
type SensorSuite TestSuite
type StoreSuite TestSuite

// Queue Tests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var numOfItems = 10

const storeID string = "Store0"

func (s *QueueSuite) SetupSuite() {
	db, mock := redismock.NewClientMock()
	s.db = (*RedisDB)(db)
	s.mock = mock
}

func (s *QueueSuite) TestAddToQueue() {
	for i := 0; i < numOfItems; i++ {
		userID := fmt.Sprintf("User%d", i)

		s.mock.ExpectRPush(queuePrefix+storeID, userID)

		s.db.AddToQueue(storeID, userID)
	}
	err := s.mock.ExpectationsWereMet()
	s.Nil(err)
}

func (s *TestSuite) TestGetPlaceInQueue() {
	for i := 0; i < numOfItems; i++ {
		userID := fmt.Sprintf("User%d", i)

		s.mock.ExpectLPos(queuePrefix+storeID, userID, redis.LPosArgs{})
		s.db.GetPlaceInQueue(storeID, userID)
	}
	err := s.mock.ExpectationsWereMet()
	s.Nil(err)
}

func (s *TestSuite) TestRemoveFromQueue() {
	for i := 0; i < numOfItems; i++ {
		userID := fmt.Sprintf("User %d", i)

		s.mock.ExpectLRem(queuePrefix+storeID, 1, userID)
		s.db.RemoveFromQueue(storeID, userID)
	}
	err := s.mock.ExpectationsWereMet()
	s.Nil(err)
}

func TestQueueSuite(t *testing.T) {
	suite.Run(t, new(QueueSuite))
}

// Sensor Tests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

func (s *SensorSuite) SetupSuite() {
	db, mock := redismock.NewClientMock()
	s.db = (*RedisDB)(db)
	s.mock = mock
}

func (s *SensorSuite) TestUpdateSensorReading() {
	s.mock.ExpectGetSet(sensorPrefix+APIKey, uint64(1))
	s.db.UpdateSensorReading(APIKey, 1)

	err := s.mock.ExpectationsWereMet()
	s.Nil(err)
}

func (s *SensorSuite) TestGetSensorReading() {
	s.mock.ExpectGet(sensorPrefix + APIKey)
	s.db.GetSensorReading(APIKey)

	err := s.mock.ExpectationsWereMet()
	s.Nil(err)
}

func TestSensorSuite(t *testing.T) {
	suite.Run(t, new(SensorSuite))
}

// Store Tests ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

func (s *StoreSuite) SetupTest() {
	db, mock := redismock.NewClientMock()
	s.db = (*RedisDB)(db)
	s.mock = mock
}

func (s *StoreSuite) TestAddStore() {
	storeStruct := Store{"bonk123", "Ica", "Skumgatan 5", 12, "URL"}
	storeJSON, err := json.Marshal(storeStruct)
	s.Nil(err)

	s.mock.ExpectSet(storePrefix+storeID, string(storeJSON), 0)

	z := redis.Z{Member: storePrefix + storeID}
	s.mock.ExpectZAdd(storeSet, &z)

	s.db.AddStore(storeID, storeStruct)

	err = s.mock.ExpectationsWereMet()
	s.Nil(err)
}

func (s *StoreSuite) TestGetStore() {
	s.mock.ExpectGet(storePrefix + storeID)
	s.db.GetStore(storeID)

	err := s.mock.ExpectationsWereMet()
	s.Nil(err)
}

func (s *StoreSuite) TestGetAllStores() {
	var start int64 = 0
	var stop int64 = 5
	var keys []string
	for i := 0; i < 10; i++ {
		id := fmt.Sprintf("Store%d", i)
		storeStruct := Store{id, "Ica", "Skumgatan 5", 12, "URL"}
		keys = append(keys, id)
		s.db.AddStore(id, storeStruct)
	}

	s.mock.ExpectZRange(storeSet, start, stop).SetVal(keys)
	s.mock.ExpectMGet(keys...)

	s.db.GetAllStores(start, stop)

	err := s.mock.ExpectationsWereMet()
	s.Nil(err)
}

func TestStoreSuite(t *testing.T) {
	suite.Run(t, new(StoreSuite))
}
