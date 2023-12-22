#Node #SQL #Oracle #教程

```
-   var oracledb = require('oracledb');  
     
-     async function run() {
-         let connection = await oracledb.getConnection( {
-         user :"system", // [用户名]
-         password :"GetStarted18c", // [密码]
-         connectString :"localhost:1521/XEPDB1" //[主机名]:[端口]/[DB 服务名]
-       });
-       let result = await connection.execute( "SELECT 'Hello World!'FROM dual");
-       console.log(result.rows[0]);
-     }  
     
-     run();
```