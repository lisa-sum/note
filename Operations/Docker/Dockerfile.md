ARG APP_RELATIVE_PATH 定义构建参数, 动态传递值, 而无需频繁修改Dockerfile文件, 用于Tag, Version等
语法:
`ARG <参数名>[=<默认值>]

示例:
```Dockerfile
FROM golang:1.16 AS builder

ARG APP_RELATIVE_PATH

COPY . /src
WORKDIR /src/app/${APP_RELATIVE_PATH}

RUN GOPROXY=https://goproxy.cn make build

FROM debian:stable-slim

ARG APP_RELATIVE_PATH

RUN apt-get update && apt-get install -y --no-install-recommends \
		ca-certificates  \
        netbase \
        && rm -rf /var/lib/apt/lists/ \
        && apt-get autoremove -y && apt-get autoclean -y

COPY --from=builder /src/app/${APP_RELATIVE_PATH}/bin /app

WORKDIR /app

EXPOSE 8000
EXPOSE 9000
VOLUME /data/conf

CMD ["./server", "-conf", "/data/conf"]
```

语法:
```shell
docker build --build-arg <参数名>=<值> -t <镜像名称>:<标签> <Dockerfile路径>
```

示例:
```shell
docker build --build-arg APP_VERSION=2.0 -t myapp:2.0 .
```