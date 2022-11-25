package main

import (
	"changeme/shutdown"
	"context"
)

type Response struct {
	Success bool   `json:"success"`
	Msg     string `json:"msg"`
}

func success(msg string) *Response {
	return &Response{
		Success: true,
		Msg:     msg,
	}
}

func failed(msg string) *Response {
	return &Response{
		Success: false,
		Msg:     msg,
	}
}

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// TimedShutdown for the given time or date
func (a *App) TimedShutdown() *Response {
	err := shutdown.Shutdown()
	if err != nil {
		return failed(err.Error())
	}
	return success("")
}
