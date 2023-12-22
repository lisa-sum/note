1. 下载 https://github.com/docker/compose/releases
2. 上传(可选)
`-i`: 秘钥文件, 如果服务器设置了秘钥登录

```shell
scp -i <pem-file> <docker-compose-file> <user>@host/usr/local/bin/docker-compose
```
3. 授权
```shell
sudo chmod +x /usr/local/bin/docker-compose
```