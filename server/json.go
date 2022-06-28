package server

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/golang/gddo/httputil/header"
)

func DecodeJSONBody(w http.ResponseWriter, r *http.Request, dst interface{}) error {
	app, _ := header.ParseValueAndParams(r.Header, "Content-Type")

	if app != "application/json" {
		msg := "Content-Type header is not application/json"
		return NewAPIError(nil, http.StatusUnsupportedMediaType, msg)
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	err := dec.Decode(&dst)

	var syntaxError *json.SyntaxError
	var unmarshalTypeError *json.UnmarshalTypeError
	requestToLarge := errors.New("http: request body to large")

	if err == nil {
		return nil
	}

	switch {
	case errors.As(err, &syntaxError):
		msg := "Request body contains badly-formed JSON"
		return NewAPIError(syntaxError, http.StatusBadRequest, msg)

	case errors.Is(err, io.ErrUnexpectedEOF):
		msg := "Unexpected end of file"
		return NewAPIError(err, http.StatusBadRequest, msg)

	case errors.As(err, &unmarshalTypeError):
		msg := "Request body contains an invalid value for field"
		return NewAPIError(unmarshalTypeError, http.StatusBadRequest, msg)

	case errors.Is(err, io.EOF):
		msg := "Request body must not be empty"
		return NewAPIError(err, http.StatusBadRequest, msg)

	case errors.Is(err, requestToLarge):
		msg := "Request body must not be larger than 1MB"
		return NewAPIError(err, http.StatusRequestEntityTooLarge, msg)

	case strings.HasPrefix(err.Error(), "json:"):
		msg := "Request body contains unknown field"
		return NewAPIError(err, http.StatusBadRequest, msg)
	default:
		return err
	}
}
