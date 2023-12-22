## 使用

本例使用`proto3`来写一个常见的用户登录与注册的`gRPC`的服务端

###  定义proto
```protobuf
syntax = "proto3";

package users;
option go_package = "proto/user";

message LoginRequest {
  string username = 1;
  string password = 2;
}

message LoginResponse {
  int32 state_code =1;
  string state_msg = 2;
}

message RegisterRequest {
  string username = 1;
  string password = 2;
}

message RegisterResponse {
  int32 state_code =1;
  string state_msg = 2;
}

enum Gender {
  SEX = 0;
  MAN =1;
  WOMEN = 2;
}

message User {
  string name = 1;
  int32 age = 2;
  Gender gender = 3;
}

service UserService {
  rpc Login(LoginRequest) returns(LoginResponse);
  rpc Register(RegisterRequest) returns(RegisterResponse);
}

```

### 定义rpc服务
rpc 有四种服务:
1. 普通函数:
```protobuf
service User {
	rpc Login(LoginRequest) returns(LoginResponse)
}
```

2. 服务器返回流
```protobuf
service Steam {
	rpc Video(VideoRequest) returns(steam VideoSteam)
}
```

3. 客户端发送流
```protobuf
service Steam {
	rpc Video(steam VideoSteam) returns(VideoResponse)
}
```

4.  双向流式
```protobuf
service Steam {
	rpc Video(steam VideoSteam) returns(steam VideoSteam)
}
```
选项:
`rpc`与`http`方法的映射, 以达到 `HTTP` 可以访问 `rpc` 服务
```protobuf
service User {
	rpc Login(VideoRequest) returns(steam VideoSteam) {
		option (google.api.http) = {
			post: "/user/login"	
		}
	}
}
```

### 生成pb文件

- 生成在`proto`的目录下
```shell
protoc -I=. --go_out=proto --go-grpc_out=proto */*.proto
```

目录结构:
```
├── proto
│   └── user
│       └── user.pb.go
├── protobuf
│   └── user.proto
```

- 生成在原始(即源文件)的目录下
```shell
protoc -I=. --go_out=. --go_opt=paths=source_relative \
--go-grpc_out=. --go-grpc_opt=paths=source_relative \
*/*.proto
```

目录结构:
```
├── protobuf
│   ├── user.pb.go
│   └── user.proto
```

- `grpc` 的 `service`服务的文件也同 `--go_out` 的所在目录
```shell
protoc -I=. --go_out=. --go-grpc_out=. */*.proto
```

目录结构
```
├── proto
│   └── user
│       ├── user.pb.go
│       └── user_grpc.pb.go
├── protobuf
│   └── user.proto
```

### 创建服务器
1. 从定义生成的 rpc 服务中, 编写对应服务接口

```go
type User {
	Username string
	Password string
}

func (User) Login(ctx context, username password *pb.User) (*pb.Response, error){
	
}
```

### 启动服务器
1. 监听客户端请求
2. 创建`prpc`示例
3. 向`grpc`服务器注册我们的服务实现
4. 启动服务, 调用 `Server() `阻塞等待, 直到进程被终止或`Stop()`调用

```go
// 1. 启动 tcp 服务, 监听客户端请求
lisn, err := net.Listen("tcp", "localhost:8080")
if err != nil{
	log.Fatalf("failed to listen: %v", err)
}

// rpc opts 选项
var opts []grpc.ServerOption
...
// 2. 创建`prpc`示例
grpcServer := gprc.NewServer(opts)

// 3. 向`grpc`服务器注册我们的服务实现
pb.RegisterServer(grpcServer,NewServer())

// 4. 启动grpc服务, 基于 http2.0的I/O多路复用
grpcServer.Server(lis)
```
### 创建客户端

1. 创建 grpc 通道(可以在`grpc.Dial` 时设置身份验证凭据（例如 TLS、GCE或 JWT )
```go
var opts []grpc.DialOption
...
conn, err := grpc.Dial(*serverAddr, opts...)
if err != nil {
  ...
}
defer conn.Close()
```

2. 调用服务端方法, 方法名为`user.pb`文件中定义的`New`+`服务名`+`Client`, 本例定义的服务名为`serService`, 即对应的客户端的方法为:`NewUserServiceClient`
```go
client := user.NewUserServiceClient(conn)
```