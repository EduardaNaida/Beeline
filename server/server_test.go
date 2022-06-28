package server

import (
	"testing"
)

func TestFoo(t *testing.T) {
	const result string = "This is a string"
	if result != "This is a string" {
		t.Errorf("Result was incorrect, got: %s, want: %s.", result, "This is a string")
	}
}
