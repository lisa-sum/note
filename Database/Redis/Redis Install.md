## Install
### Docker
https://blog.csdn.net/weixin_45821811/article/details/116211724

`docker-compose.yml`
```yml
version: '3'

services:
  redis-stand-alone:
    image: redis:latest
    restart: always
    volumes:
      - /data/redis/data:/data
      - /data/redis/redis.conf:/etc/redis/redis.conf
    container_name: redis
    ports:
      - "6379:6379"
    logging:
      options:
        max-size: "100m"
        max-file: "2"
    
```
## 测试
```shell
docker exec -it redis redis-cli
auth password 
set s1 123
```