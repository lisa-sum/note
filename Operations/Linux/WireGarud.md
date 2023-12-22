```shell
dnf install wireguard-tools
```

Run the below command to start and enable the '**systemd-resolved**' service.  
运行以下命令以启动并启用“systemd 解析”服务。

```shell
sudo systemctl start systemd-resolved  
sudo systemctl enable systemd-resolved
```

安装wireguard工具并运行systemd解析后，设置NetworkManager以使用“systemd-solve”作为DNS后端。

打开 NetworkManager 配置文件 '/etc/NetworkManager/NetworkManager.conf'。

```shell
vi /etc/NetworkManager/NetworkManager.conf
```

将“dns”参数添加到“[main]”部分，如下所示。

```
[main]  
dns=systemd-resolved
```

删除“/etc/resolv.conf”文件，并创建由systemd-solved管理的“resolv.conf”文件的新符号链接文件。

```shell
rm -f /etc/resolv.conf  
sudo ln -s /usr/lib/systemd/resolv.conf /etc/resolv.conf
```

现在重新启动网络管理器服务以应用更改。

```shell
sudo systemctl restart NetworkManager
```

Now that the NetworkManager is configured, you are now ready to set up the wireguard client.  
现在，网络管理器已配置完毕，您现在可以设置线卫客户端了。

创建 wireguard 客户端配置文件后，您可以通过下面的“wg-quick up”命令在客户端计算机上运行 wireguard。

```shell
wg-quick up wg0
```


Now verify the '_**wg-client1**_' interface via the ip command below.  
现在通过下面的 ip 命令验证“wg-client1”接口。

```shell
ip a show wg0
```

You can also verify the DNS resolver on the wg-client1 interface via the '_resolvectl_' command below.  
您还可以通过下面的“解析”命令验证 wg-client1 接口上的 DNS 解析器。

```shell
resolvectl status wg0
```

## 参考
1. https://www.howtoforge.com/how-to-install-wireguard-vpn-on-rocky-linux-9/
2. https://linuxiac.com/how-to-set-up-wireguard-vpn-server-on-ubuntu/#step-31-generate-publicprivate-keypair
3. https://www.cyberciti.biz/faq/ubuntu-20-04-set-up-wireguard-vpn-server/