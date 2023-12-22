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
proto定义:
```protobuf
service Steam {
	rpc Video(VideoRequest) returns(steam VideoSteam)
}
```
服务端实现:
1. 创建gRPC服务端
2. 定义服务
3. 注册服务
4. 启动HTTP
5. 实现服务端流式方法, 使用生成的pb文件的`<ServiceName>_<RPCName>Server`格式的方法来表示`stream`流
6. 启动RPC服务
```go
// 2. 定义服务
type UserService {
	pb.UnimplementedUserServer
}

func main() {
	// 1. 创建gRPC服务端
	server := grpc.NewServer()
	// 3. 注册服务
	pb.RegisterUserServer(server, &UserService{})
	// 4. 启动HTTP
	lis, err := net.Listen("tcp",":4000")
	if err != nil {
			panic(err)
	}
	// 6. 启动RPC服务
	if err := s.Serve(lis); err != nil {
			panic(err)
	}
}

// 5. 定义服务端流式方法
func (*UserService) Search(query *wrapperspb.StringValue, stream pb.User_SearchServer) error {
	for _, order := range orders {
		for _, item := range order.Items {
			if strings.Contains(item, query.Value) {
				err := stream.Send(&order)
				if err != nil {
					return fmt.Errorf("error send: %v", err)
				}
			}
		}
	}

	return nil
}
```
客户端实现:
1. 建立HTTP客户端连接监听服务端
2. 创建gRPC客户端
3. 请求服务端代码
4. 处理服务端流式响应, `io.EOF`表示服务端流式传输完成, 否则抛出`error`
```go
func main(){
	// 1. 创建gRPC客户端, 使用grpc.WithTransportCredentials(insecure.NewCredentials())明确表示使用明文传输
	conn, err := grpc.Dial("127.0.0.1:4000", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		panic(err)
	}

	defer conn.Close()

	// 2. 创建gRPC客户端
	client := pb.NewUserClient(conn)

	// 超时时间
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	// 3. 请求服务端RPC代码
	orders, err := client.Search(ctx, &wrapperspb.StringValue{Value: "2"})
	if err != nil {
		panic(err)
	}
	
	// 4. 处理服务端流式响应, io.EOF表示服务端流式传输完成, 否则抛出err
	for {
		order, err := orders.Recv()
		if err == io.EOF {
			break
		}
		fmt.Printf("order:%v", order)
	}
}
```
3. 客户端发送流
定义proto语法
```protobuf
service Steam {
	rpc Video(steam VideoSteam) returns(VideoResponse)
}
```
服务端实现:
1. 定义服务
2. 创建HTTP
3. 创建gRPC
4. 实现接收客户端发送的流的方法
5. 启动gRPC服务
```go
func main() {
	// 创建gGRPC服务端
	s := grpc.NewServer()

	// 注册服务
	pb.RegisterUserServer(s, &UserService{})

	// 启动HTTP
	lis, err := net.Listen("tcp", ":4000")
	if err != nil {
		panic(err)
	}

	// 启动RPC
	if err := s.Serve(lis); err != nil {
		panic(err)
	}
}
```
客户端实现:
1. 创建HTTP服务, 监听服务端连接
2. 创建gRPC客户端
3. 向服务端发送流, 通过调用远程代码的`Send()`发送流对象, `ClonseAndRecv()`接受服务端响应和关闭流
4. 启动gPRC
```go
func main() {
	// 创建gRPC客户端
	conn, err := grpc.Dial("127.0.0.1:4000", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		panic(err)
	}

	defer conn.Close()

	// 创建客户端
	client := pb.NewUserClient(conn)

	// 超时时间
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	// 调用gRPC服务端代码, 非流式传输示例
	user, err := client.Login(ctx, &pb.UserReq{
		Id:       0,
		Username: "12",
		Password: "23",
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("user%v", user)

	// 服务端steam流式
	orders, err := client.Search(ctx, &wrapperspb.StringValue{Value: "2"})
	if err != nil {
		panic(err)
	}

	stream, err := client.Meta(ctx)
	if err := stream.Send(&pb.UserReq{
		Id:       0,
		Username: "0",
		Password: "0",
	}); err != nil {
		panic(err)
	}
	if err := stream.Send(&pb.UserReq{
		Id:       1,
		Username: "1",
		Password: "1",
	}); err != nil {
		panic(err)
	}

	res, err := stream.CloseAndRecv()
	if err != nil {
		panic(err)
	}

	fmt.Println("res:", res)
}
```

6.  双向流式
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
### 通用
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

### 包含导入HTTP服务proto文件的示例

假设我们有这样的目录: 
`api`目录存放我们编写的proto
`third_party`目录是第三方依赖或外部模块的目录

```
myproject/
|-- api/
|   |-- user.proto
|-- third_party/
|   |-- google/
|       |-- api/
|           |-- other.proto
|-- go.mod
```
编写proto
```proto
syntax = "proto3";
package api;

import "google/api/annotations.proto";

option go_package = "myproject/api/user";

message UserReq {
  string username = 1;
  string password = 2;
}

message UserRes {
  string message = 1;
}

service User {
  rpc Login(UserReq) returns(UserRes) {
    option (google.api.http) = {
      post: "/api/user/login",
      body: "*"
    };
  }
}
```

生成包含http服务的rpc:
```shell
protoc --proto_path=./api \
	   --proto_path=./third_party \
	   --go_out=paths=source_relative:./api \
	   --go-http_out=paths=source_relative:./api \
	   --go-grpc_out=paths=source_relative:./api \
	   api/*.proto
```
参数说明:
- \: linux路径分隔符, 表示折行
- `--proto_path=.<path>`: 搜索`<path>`目录下的`proto`文件
- `--go_out=<path>`: 生成再`<path>`目录下proto文件
- `paths=source_relative:<path>`相对于proto文件的路径, 生成的文件与当前proto文件处在一个目录下
- `--go-http_out=paths=source_relative:<path>` 生成grpc的http目录位置
- `--go-grpc_out=<path>` 生成grpc的proto文件的位置
- `api/*.proto` 生成`api`目录下所有的proto文件
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
gRPC的服务端与客户端示例:
项目结构:
```
.
├── api
│   └── user
│       ├── user.pb.go
│       ├── user.proto
│       ├── user_grpc.pb.go
│       └── user_http.pb.go
├── client.go
├── go.mod
├── go.sum
├── server.go
└── third_party
    └── google
        └── api
            ├── annotations.proto
            └── http.proto
```

api:
```protobuf
syntax = "proto3";
package api;

import "google/api/annotations.proto";

option go_package = "grpc/api/user";

message UserReq {
  uint32 id = 1;
  string username = 2;
  string password = 3;
}

message UserRes {
  string message = 1;
}

service User {
  rpc Login(UserReq) returns(UserRes) {
    option (google.api.http) = {
      post: "/api/user/login",
      body: "*"
    };
  }
}
```
生成:
```shell
protoc --proto_path=./api \
	   --proto_path=./third_party \
	   --go_out=paths=source_relative:./api \
	   --go-http_out=paths=source_relative:./api \
	   --go-grpc_out=paths=source_relative:./api api/user/user.proto
```

服务端:
```go
package main

import (
	"context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	pb "grpc-example/api/user"
	"net"
)

// 0. 继承接口, 让编译器检查是否全部实现了所有方法
var _ pb.UserServer = &pb.UnimplementedUserServer{}

// 1. 实现方法
type users struct {
	pb.UnimplementedUserServer
}

func (users) Login(ctx context.Context, req *pb.UserReq) (*pb.UserRes, error) {
	if !(req.Username == "12") && !(req.Password == "23") {
		return &pb.UserRes{Message: "ERROR"}, status.Errorf(codes.NotFound, "账密错误")
	}

	return &pb.UserRes{Message: "OK"}, status.New(codes.OK, "OK").Err()
}

func main() {
	// 创建gGRPC服务端
	s := grpc.NewServer()

	// 注册服务
	pb.RegisterUserServer(s, &users{})

	// 启动HTTP
	lis, err := net.Listen("tcp", ":4000")
	if err != nil {
		panic(err)
	}

	// 启动RPC
	if err := s.Serve(lis); err != nil {
		panic(err)
	}
}

```
客户端:
```go
package main

import (
	"context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	pb "grpc-example/api/user"
	"log"
	"time"
)

func main() {
	// 创建gRPC客户端
	conn, err := grpc.Dial("127.0.0.1:4000", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		panic(err)
	}

	defer conn.Close()

	// 创建客户端
	client := pb.NewUserClient(conn)

	// 超时时间
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	// 调用gRPC服务端代码
	user, err := client.Login(ctx, &pb.UserReq{
		Id:       0,
		Username: "12",
		Password: "23",
	})
	if err != nil {
		panic(err)
	}

	log.Print("req ->: ", user)
}

```