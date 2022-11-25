//go:build darwin

package shutdown

import (
	"fmt"
	"os/exec"
)

const (
	shutdownEvent = "aevtrsdn"
	restartEvent  = "aevtrrst"
)

func run(event string) error {
	osascript := fmt.Sprintf(
		"tell app \"loginwindow\" to «event %s»",
		event,
	)

	err := exec.Command("osascript", "-e", osascript).Run()
	if err != nil {
		return err
	}
	return runTap()
}

func Shutdown() error {
	return run(shutdownEvent)
}
