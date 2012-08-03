## 项目介绍
  Web服务端

## 目录介绍
<pre>
SmartDoor
│
├─┬ server - web服务端 
│ ├── controllers - 业务逻辑
│ ├── domain - 领域类 
│ ├── node_modules - 第三方类库
│ ├─┬ public - 对外发布的web静态文件 
│ │ ├── css 
│ │ ├── images 
│ │ ├── js 
│ │ └── lib - 第三方js类库
│ ├── utils - 辅助类
│ ├── view - 视图
│ ├── app.js - 主函数 
│ ├── config.js - 配置文件
│ ├── routes.js - 路由表(url mapping)
│ ├── package.json - 项目的元数据 
│ └── README.MD - 项目介绍(markdown格式)
│
├─┬ client - 客户端
│ ├── app.js -主函数
│ └── config.js - 配置文件
│
├── doc - 文档
├── test - 测试脚本
├── .gitCfg.bat - git配置脚本(初始化时执行)
└── .gitignore - git忽略文件
</pre>

## 配置介绍
* 初始化: cmd下执行 npm install 来安装package.json里面定义的依赖库.
* 依赖库: 也可以执行 npm link <module name> 来链接依赖库.
* 启动程序: node app.js