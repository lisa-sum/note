## 名词解释
1. 裸金属: Kubernetes集群及其容器直接部署在物理服务器上，而不是在由hypervisor层管理的传统虚拟机（VM）内部。裸金属Kubernetes可用于边缘计算部署，以避免在小型硬件上运行VM层所带来的开销，也可用于数据中心，以降低成本、提高应用工作负载性能，并避免VM许可证的成本
2. OpenELB: 一个Kubernetes负载均衡的库
3. eip: openelb ip
4. Eip对象: Kubernetes的自定义Kind对象为Eip

## 说明
Kubernetes裸金属使用OpenELB搭建LoadBalancer负载均衡器, 对本地的机器也拥有公有云般的负载均衡能力, 目前，OpenELB 仅支持 IPv4，并且很快将支持 IPv6.

### 安装
参考[openelb](https://github.com/openelb/openelb/blob/master/README_zh.md)
```Bash
mkdir -p /home/kubernetes/openelb
cd /home/kubernetes/openelb

wget https://raw.githubusercontent.com/openelb/openelb/master/deploy/openelb.yaml

kubectl apply -f openelb.yaml

kubectl get po -n openelb-system
```

## 配置
### eip配置

参数说明:
- **metadata元数据对象**:
    - **name**: <eip-pool> 字符串, EIP这个Kind的对象名
    - **annotations**:
        - eip.openelb.kubesphere.io/is-default-eip: "true": 布尔值,是否使用本文件作为ELB的默认值, 如果为true, 那么后续所有的LoadBalancer类型的Service都使用该文件的配置
- **spec对象**:
    - **address**：一个或多个IP地址. **IP地址不能是集群中任何的机器IP**!,不同Eip对象中的IP段不能重叠.否则，将发生资源创建错误. 必须是未被任何机器使用的IP地址, 而且必须与**集群所在的IP网段相同**, 例如, 192.168.2.xxx, 这单/多个IP将由OpenELB使用, 附着在Kubernetes集群的网卡中.值格式可以是：
        - `IP address` ，例如. `192.168.0.100`
        - `IP address/Subnet mask` ，例如. `192.168.0.0/24`
        - `IP address 1-IP address 2` ，例如. `192.168.0.91-192.168.0.100`
    - **protocol** ：指定 Eip 对象用于哪种 OpenELB 模式.该值可以是 `bgp` 、 `layer2` 或 `vip` .如果未指定此字段， `bgp` 则使用默认值.
    - **interface** ：字符串, 值为Kubernetes master的网卡名称.例如:ens160, OpenELB 侦听 ARP 或 NDP 请求的网卡.仅当设置为 时 `protocol` ， `layer2` 此字段才有效. 如果Kubernetes集群节点的网卡名称不同，可以将该值设置为 `can_reach:IP address` （例如） `can_reach:192.168.0.5` ，以便OpenELB自动获取可以到达该IP地址的网卡名称.在这种情况下，您必须确保 IP 地址不被 Kubernetes 集群节点使用，但集群节点可以访问.另外，请勿在此处使用弹性公网IP中配置的地址.
    - **disable** ：是否禁用 Eip 对象.该值可以是：
        - false ：OpenELB 可以将 Eip 对象中的 IP 地址分配给新的 LoadBalancer 服务.
        - true ：OpenELB 停止将 Eip 对象中的 IP 地址分配给新的 LoadBalancer 服务.现有服务不受影响.

示例配置文件:
```yaml
# Source: eip-loadBalancer.yaml
apiVersion: network.kubesphere.io/v1alpha2
kind: Eip
metadata:
  name: eip-pool
  annotations:
    eip.openelb.kubesphere.io/is-default-eip: "true"
spec:
  address: 192.168.0.180-192.168.2.190
  protocol: layer2
  disable: false
  interface: ens160
```
## 测试

在测试配置文件: openelb-svc-nginx-test.yaml:
在该文件的`metadata`添加`annotations`信息:
```yaml
annotations:
    lb.kubesphere.io/v1alpha1: openelb
    protocol.openelb.kubesphere.io/v1alpha1: layer2
    eip.openelb.kubesphere.io/v1alpha2: eip-pool
```

```yaml
# Source: openelb-svc-nginx-test.yaml
openelb-svc-nginx-test.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx
  annotations:
    lb.kubesphere.io/v1alpha1: openelb
    protocol.openelb.kubesphere.io/v1alpha1: layer2
    eip.openelb.kubesphere.io/v1alpha2: eip-pool
spec:
  type: LoadBalancer
  ports:
  - port: 80
    protocol: TCP
    name: http
  selector:
    app: nginx
```

### 删除
必须停止所有使用LoadBalancer的服务, 才可以删除

```Bash
kubectl delete -f https://raw.githubusercontent.com/openelb/openelb/master/deploy/openelb.yaml
```
## 资料
1. https://openelb.io/docs/getting-started/installation/install-openelb-on-kubernetes/
2. https://github.com/openelb/openelb/blob/master/README_zh.md
3. https://zhuanlan.zhihu.com/p/519440135
4. https://zhuanlan.zhihu.com/p/612079422
5. https://www.qikqiak.com/post/openelb/
````