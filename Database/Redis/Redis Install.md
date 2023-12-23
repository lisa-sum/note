## Install
### Docker
https://blog.csdn.net/weixin_45821811/article/details/116211724

#### Dockerfile
1. 创建redis.conf与存储rdb的目录
```shell
mkdir -p /home/redis/data/rdb
vi /home/redis/conf/redis.conf
```

2. Dockerfile:
```Dockerfile
FROM redis
COPY /home/redis/conf/redis.conf /usr/local/etc/redis/redis.conf
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf"]
```

#### Docker-compose
1. 创建redis.conf
```shell
vi /home/redis/conf/redis.conf
```
2. `docker-compose.yml`

```yml
version: '3'

services:
  redis-stand-alone:
    image: redis:latest
    restart: unless-stopped
    volumes:
      - /home/redis/data:/data
      - /home/redis/conf/:/usr/local/etc/redis # redis配置文件
    container_name: redis
    ports:
      - "6379:6379"
    logging:
      options:
        max-size: "100m"
        max-file: "2"
    command: redis-server /usr/local/etc/redis/redis.conf

```
## 测试
```shell
docker exec -it redis redis-cli
auth password 
set s1 123
```
## 资料
1. https://hub.docker.com/_/redis