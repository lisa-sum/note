### 将zap作为http中间件日志, 即可得到http的详细信息

internal/pkg/zap
```Go
package zap

import (
	"fmt"
	"os"

	"go.uber.org/zap/zapcore"

	"github.com/go-kratos/kratos/v2/log"
	"github.com/natefinch/lumberjack"
	"go.uber.org/zap"
)

var _ log.Logger = (*ZapLogger)(nil)

type ZapLogger struct {
	log  *zap.Logger
	Sync func() error
}

// Log 日志记录器接口实现
func (z *ZapLogger) Log(level log.Level, keyvals ...interface{}) error {
	if len(keyvals) == 0 || len(keyvals)%2 != 0 {
		z.log.Warn(fmt.Sprint("Key Values must appear in pairs: ", keyvals))
		return nil
	}

	var data []zap.Field
	for i := 0; i < len(keyvals); i += 2 {
		data = append(data, zap.Any(fmt.Sprint(keyvals[i]), keyvals[i+1]))
	}
	switch level {
	case log.LevelDebug:
		z.log.Debug("", data...)
	case log.LevelInfo:
		z.log.Info("", data...)
	case log.LevelWarn:
		z.log.Warn("", data...)
	case log.LevelError:
		z.log.Error("", data...)
	case log.LevelFatal:
		z.log.Fatal("", data...)
	}
	return nil
}

// Logger 配置zap日志,将zap日志库引入
func Logger() log.Logger {
	encoder := zapcore.EncoderConfig{
		TimeKey:        "time",
		LevelKey:       "level",
		NameKey:        "zap",
		CallerKey:      "caller",
		MessageKey:     "msg",
		StacktraceKey:  "stack",
		EncodeTime:     zapcore.ISO8601TimeEncoder,
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.CapitalLevelEncoder,
		EncodeDuration: zapcore.SecondsDurationEncoder,
		EncodeCaller:   zapcore.FullCallerEncoder,
	}
	return NewZapLogger(
		encoder,
		zap.NewAtomicLevelAt(zapcore.DebugLevel),
		zap.AddStacktrace(
			zap.NewAtomicLevelAt(zapcore.ErrorLevel)),
		zap.AddCaller(),
		zap.AddCallerSkip(2),
		zap.Development(),
	)
}

// NewZapLogger return a zap zap.
func NewZapLogger(encoder zapcore.EncoderConfig, level zap.AtomicLevel, opts ...zap.Option) *ZapLogger {
	//设置日志级别
	level.SetLevel(zap.InfoLevel)

	var core zapcore.Core

	core = zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoder),                      // 编码器配置
		zapcore.NewMultiWriteSyncer(zapcore.AddSync(os.Stdout)), // 打印到控制台
		level, // 日志级别
	)
		//可选打印到控制台并输出到文件
	/*	core = zapcore.NewCore(
		zapcore.NewJSONEncoder(encoder), // 编码器配置
		zapcore.NewMultiWriteSyncer(zapcore.AddSync(os.Stdout), zapcore.AddSync(getLogWriter())), // 打印到控制台和文件
		level, // 日志级别
	)*/

	zapLogger := zap.New(core, opts...)
	return &ZapLogger{log: zapLogger, Sync: zapLogger.Sync}
}

// 日志自动切割，采用 lumberjack 实现的
func getLogWriter() zapcore.WriteSyncer {
	lumberJackLogger := &lumberjack.Logger{
		Filename:   "tmp/test.log",
		MaxSize:    10,
		MaxBackups: 5,
		MaxAge:     30,
		Compress:   false,
	}
	return zapcore.AddSync(lumberJackLogger)
}


```

cmd/xx/main.go
```go
	//日志初始化
	loggers := log.With(zap.Logger(),
		"caller", log.DefaultCaller,
		"service.id", id,
		"service.name", Name,
		"service.version", Version,
		"trace_id", tracing.TraceID(),
		"span_id", tracing.SpanID(),
	)
```

## 在HTTP/GRPC使用:
资料: 
1. 定义zap日志 https://www.cnblogs.com/zly-go/p/16300240.html#%E6%97%A5%E5%BF%97zap
2. 使用logging中间件: https://go-kratos.dev/docs/component/middleware/logging

internal/server/grpc.go&http.go
```Go
//在internal/server/grpc.go&http.go中引入日志中间件

import "github.com/go-kratos/kratos/v2/middleware/logging"

logger := log.DefaultLogger

var opts = []http.ServerOption{
		http.Middleware(
			recovery.Recovery(),
			logging.Server(logger), //日志中间件
		),
	}
```
