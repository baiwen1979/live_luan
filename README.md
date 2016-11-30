潞安新闻中心客户端
=====================

### app描述
		潞安集团的手机新闻客户端，后端数据由潞安集团提供，由两人组成，我负责用户模块。

### 功能简介
		新闻查看；
		新增新闻类别；
		服务类目的增删；
		新闻评论；
		新闻收藏；
		用户发表文章；
		用户进行文件上传；

### 实现方式
		使用ionic实现。

### 结构
![文件结构](https://github.com/JYFiaueng/luan_news/blob/master/docs/文件结构.png)

### 最终效果
![1](https://github.com/JYFiaueng/luan_news/blob/master/docs/1.png)
![2](https://github.com/JYFiaueng/luan_news/blob/master/docs/2.png)
![3](https://github.com/JYFiaueng/luan_news/blob/master/docs/3.png)
![4](https://github.com/JYFiaueng/luan_news/blob/master/docs/4.png)

### 比较总结
		最开始为了快速开发使用APICloud，发现效果不好，后来改为ionic。
		我在做的过程中遇到最坑的是手机端文件上传的功能，由于其继承测试环境不是手机，
		而ionic又没有像APICloud一样方便的连接手机的功能，只能在虚拟机上测试，仅仅生
		成Android安装包就至少上百次，每一点小的改动都要进行apk安装、测试、调整。

		下面是APICloud和ionic的对比：
			ionic
				门槛高，需要angularjs基础
				命令行界面使用
				真机测试不方便
				代码量小，复用度很高
				使用路由切换页面便于集中控制
				代码结构清晰分明
				插件少，质量上乘
				文档还可以，找的不费劲，大部分问题都可以百度或google
				基于MVC模式
				安装包小（4M）
			APICloud
				代码量大
				可复用性底
				无法使用路由，只能依靠页面的逻辑关系进行切换
				上手快，门槛低
				插件多，但是质量参差不齐
				速度略慢
				文档不清晰，查看难
				没有提供相配套的css框架，需要结合jquery Mobel
				生成的安装包大（17M）
				具有wifi真机测试，超好用
				部分插件收费
