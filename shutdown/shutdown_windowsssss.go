//go:build windows

package shutdown

import "os/exec"

func Shutdown() error {
	err := exec.Command("cmd", "/C", "shutdown -s -t 0").Run()
	if err != nil {
		return err
	}
	return nil
}
