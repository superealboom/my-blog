---
title: zookeeper学习
tags:
  - zookeeper
createTime: 2025/02/13 21:42:46
permalink: /article/q4mv3bg9/
---
## 1 特点
1. 1个leader，n个follower
2. 半数以上节点存活，zookeeper集群正常工作，适合奇数台服务器
3. Server有相同数据副本
4. 更新顺序性，更新原子性
## 2 数据结构
树形结构，一个Znode（节点）默认存储1MB数据
## 3 应用场景
### 3.1 统一命名
一个域名对应多个IP，同时Nginx也可以做到
### 3.2 统一配置
- 比如Kafka集群，配置文件可以交由Zookeeper管理实现
    1. 将配置信息写入zookeeper的Znode
    2. 各个Kafka服务器监听Znode
    3. Znode数据被修改，zookeeper通知Kafka服务器
- 根据监听可以做统一集群配置
- 根据监听可以做服务器动态上下线
### 3.3 软负载均衡
zookeeper节点存储一个域名对应IP的访问量，设法让访问量最少的IP对应的服务器去响应客户端的请求
## 4 安装启动

- [zookeeper官网](https://zookeeper.apache.org)

- [zookeeper下载地址](https://archive.apache.org/dist/zookeeper/) （下载选择 tar.gz 文件，我选择的是3.5.7版本）

### 4.1 linux单机版

#### 4.1.1 创建目录并解压缩

```shell
 mkdir /opt/module
 cd /opt/module
 tar -zxvf zookeeper-3.5.7.tar.gz
 mkdir /opt/module/zookeeper-3.5.7/data
 mkdir /opt/module/zookeeper-3.5.7/log
```


#### 4.1.2 修改配置文件

```shell
cd /opt/module/zookeeper-3.5.7/conf
cp zoo_sample.cfg zoo.cfg
vim zoo.cfg
dataDir=/opt/module/zookeeper-3.5.7/data
dataLogDir=/opt/module/zookeeper-3.5.7/log
```


#### 4.1.3 zoo.cfg参数解读

1. `tickTime = 2000`：通信心跳时间，Zookeeper服务器与客户端心跳时间，单位毫秒
2. `initLimit = 10`：LF初始连接时能容忍的最多心跳数
3. `syncLimit = 5`：LF之间通信时间如果超过syncLimit * tickTime，Leader认为Follwer死掉，从服务器列表中删除Follwer

#### 4.1.4 单机启动

```shell
cd /opt/module/zookeeper-3.5.7/bin
sh zkServer.sh start
sh zkServer.sh stop
sh zkServer.sh status
```


### 4.2 linux集群版

#### 4.2.1 集群规划

1. 三台服务器，分别是hadoop101，hadoop102，hadoop103
2. 都部署了zookeeper

#### 4.2.2 配置服务器编号

```shell
 cd /opt/module/zookeeper-3.5.7
 mkdir data
 vi myid
 # myid内容在101上写1，102上写2 ...
```


#### 4.2.3 配置zoo.cfg

增加如下配置server.A=B:C:D

> (server . myid文件里的值 = 服务器的地址 : FL交换信息的端口 : 执行选举时服务器相互通信的端口)

```shell
server.1=hadoop101:2888:3888
server.2=hadoop102:2888:3888
server.3=hadoop103:2888:3888
```


#### 4.2.4 集群启动

脚本zk.sh 内容(免密)

```shell
#!/bin/bash
 case $1 in
 "start"){
 for i in hadoop101 hadoop102 hadoop103
   do
     echo ---------- zookeeper $i 启动 ------------
     ssh $i "/opt/module/zookeeper-3.5.7/bin/zkServer.sh start"
   done
 };;
 "stop"){
 for i in hadoop101 hadoop102 hadoop103
   do
     echo ---------- zookeeper $i 停止 ------------
     ssh $i "/opt/module/zookeeper-3.5.7/bin/zkServer.sh stop"
   done
 };;
 "status"){
 for i in hadoop101 hadoop102 hadoop103
   do
     echo ---------- zookeeper $i 状态 ------------
     ssh $i "/opt/module/zookeeper-3.5.7/bin/zkServer.sh status"
   done
 };;
 esac
```


其余命令

```shell
 # 增加脚本执行权限
 chmod u+x zk.sh
 zk.sh start(stop,status)
```


## 5 leader选举机制

> SID - 服务器ID与myid一致ZXID - 事务IDEpoch - 每个leader任期代号，无leader时相同

### 5.1 第一次选举

1. 每台服务器启动会投自己一票，当有2台服务器拥有选票时会比较myid，myid大的可获得所有选票
2. 当服务器拥有选票数量大于半数，选中成功，成为leader
3. 选举leader中，服务器状态为LOOKING。选举成功后，分别编成LEADING和FOLLOWING

### 5.2 非第一次选举

服务器无法与leader保持连接

#### 5.2.1 leader无问题

服务器与leader断开连接后，该服务器认为leader出现问题所以进行重新选举操作，会被告知当前leader信息，重新建立连接同步状态

#### 5.2.2 leader确实挂掉

1. 剩下服务器进行重新选举操作，由剩下服务器的（Epoch，ZXID，SID）决定
2. Epoch大的胜出，Epoch相同时ZXID大的胜出，ZXID相同时SID大的胜出

## 6 客户端

```shell
# 普通进入本地客户端
bin/zkCli.sh
# 进入指定服务器的客户端
bin/zkCli.sh -server hadoop101:2181
```


### 6.1 节点信息

```shell
# 事务ID
[zookeeper]cZxid = 0x0
# 创建时间毫秒数
ctime = Thu Jan 01 08:00:00 CST 1970
# 节点最后信息的事务ID
mZxid = 0x0
# 更新时间毫秒数
mtime = Thu Jan 01 08:00:00 CST 1970
# 节点下的子节点最后信息的事务ID
pZxid = 0x0
# 节点下的子节点修改次数
cversion = -1
# 节点变化版本
dataVersion = 0
# 节点访问控制列表的版本
aclVersion = 0
# 临时节点时 - 节点的sessionid，其余节点 - 0
ephemeralOwner = 0x0
# 节点数据长度
dataLength = 0
# 子节点数量
numChildren = 1
```


### 6.2 节点类型

- 持久(Persistent) 短暂(Ephemeral) 有序 无序

- 默认持久无序，有序加-s,短暂加 -e

### 6.3 监听器

#### 6.3.1 监听原理

1. main线程中创建zkClient，这时会创建两个线程，一个负责网络连接通信（connet），一个负责监听（listener）
2. 通过connect线程将注册的监听事件发送给Zookeeper，在监听器列表中将注册的监听事件添加到列表中
3. Zookeeper监听到有数据或路径变化，就会将这个消息发送给listener线程
4. listener线程内部调用了process()方法，进行后续操作

#### 6.3.2 监听命令
```shell
# 监听节点内容命令
get -w /zookeeper
# 监听节点数量变化命令
ls -w /zookeeper
# 递归删除节点命令
deleteall
```
