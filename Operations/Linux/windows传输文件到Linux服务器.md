## SCP
```pwsh
spc <file> <user>@<host>:<server_path>
```

	将`D:\server`文件发送到IP为`192.168.0.158`的`root`账号下的`home`目录
```pwsh
scp D:\server root@192.168.0.158:\home
```