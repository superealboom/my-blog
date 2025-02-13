---
title: kafka基础知识
tags:
   - kafka
createTime: 2025/02/13 22:16:36
permalink: /article/nwvm3hop/
---

## 1 Kafka作用

1. 解耦：模块之间的交互，假设生产数据模块有5个，消费数据模块有5个，那一共有25种交互可能，考虑情况很多，用mq解耦
2. 异步：假设订单模块逻辑需要10ms，下单后需要更新库存模块(100ms)，积分模块(100ms)，物流模块(100ms)，同步逻辑一共需要310ms。采用异步方式，下单后将通知写入mq(5ms)，返回结果，一共需要15ms即可。至于库存、积分、物流模块将通过消费者的形式读取通知，进行更新操作
3. 削峰：mysql一般2000请求/秒，如果用户在促销时间段大量请求，大概10000请求/秒，自然数据库承受不住压力，所以将用户请求到mq中，由mq承受请求压力，系统从mq中拉取请求，以2000请求/秒的速度拉取，保证数据库能够正常处理信息，其余请求积压在mq中。系统自然不会一直承受大量访问，高峰期一过，积压在mq中的请求也会慢慢被处理

## 2 Kafka缺点

1. 可用性：如果系统只是A模块调用B模块的简单逻辑，自然不需要用mq，强上mq需要增加考虑mq使用不当挂掉的风险 
2. 复杂性：mq需要考虑的情况也很多，重复消费、消息丢失、消息是否要求顺序、积压太多等 
3. 一致性：例如异步中举的例子，订单模块返回成功，积分和物流模块正常消费消息更新，如果库存模块的mq没有正常处理，数据显然已经不一致，也是很严重的问题

## 3 kafka架构

1. kafka消息持久化在磁盘 
2. broker：kafka节点（实例），一个broker就是一台kafka服务器 
3. producer：生产者，发送消息到broker 
4. consumer：消费者，从broker消费消息 
5. group：消费者组，由若干consumer组成，group之间互不影响，一个分区只能由一个组内的消费者消费 
6. topic：主题，逻辑上的概念，包含多个partition，可以分布到多个broker上 
7. partition：分区，一个有序的队列 
8. replica：副本，一个分区可以有多个副本，副本内是相同信息，包含一个leader和若干follower 
9. leader：主副本，生产者和消费者只与主副本交互 
10. follower：从副本，与leader数据保持同步，leader挂掉后，从follower中选举新leader并对外提供服务

了解kafka架构后，对副本replica还是不太清楚 👇

## 4 replicas管理

1. AR：Assigned Replicas 所有副本 
2. ISR：In-Sync Replicas 副本同步队列 
3. OSR：Outof-Sync Replicas 副本未同步队列 
4. AR = ISR + OSR 
5. leader维护ISR中的follower，当ISR内follower同步滞后延迟超过一定阈值(延迟时间和延迟条数)时，就会将follower放入到OSR中，等进度追上了leader时，重新放入ISR，新加入的follower也会放入OSR

对于副本有了解后，那follower和leader又怎么工作呢 👇

## 5 follower如何与leader同步数据

1. 既不是同步复制，也不是异步复制 
2. 同步复制的风险：等待响应时间加长，影响吞吐率 
3. 异步复制的风险：leader挂掉，如果还未完全复制，丢失数据 
4. 所以利用ISR伸缩性均衡数据不丢失以及吞吐率，内部批量写磁盘减少时间差，磁盘顺序读和Zero-copy机制提高复制性能

了解了leader和follower的工作，也应该知道这和kafka的高可用有关吧 👇

## 6 如何高可用

1. 读数据：读数据时直接读取leader的数据即可，kafka会均匀的将一个partition的所有replica分布在不同的机器上，提高容错性 
2. 写数据：写数据时生产者将数据写到leader上，leader将数据放在磁盘上，follower主动pull数据。(其中一种模式是：一旦所有follower写入数据后，发送ack给leader，leader发送成功的消息给生产者)；写数据时消费者只从leader处读取数据。(其中一种模式是：所有follower都返回ack时，消息才会被消费者拿到)
3. 总之，没有副本机制是做不到高可用，高可用必然实现，其中某一台机器宕机后，数据不能丢

高可用从读写的角度分析，那么读写为什么不分离呢？ 👇

## 7 为什么不支持读写分离

1. kafka读写都是和leader交互，自然不是读写分离的
2. 如果支持读写分离，主写从读的模式下，延时窗口导致数据不一致（在写入leader后，follower主动pull数据时，如果读取了follower的信息，显示是旧信息） 
3. 网络延时自然耗时，对于时间敏感应用更不适用

消费数据时，如何保证不会重复消费呢？ 👇

## 8 如何保证不会重复消费(消息幂等性)

1. 首先要确认重复消费带来的影响，比如消息要进数据库，redis，文件等 
2. 结合业务需求来考虑，基于不会重复的唯一键，或者利用redis的set天然幂等性 
3. 对于数据的增删改操作采用合理的逻辑处理方式

能保证不会重复消费，那如何保证不会少消费呢？👇

## 9 如何保证消息可靠传输(消息丢失)？

1. 情况一：消费者拿到数据后还未完全处理完成，偏移量就提交了，自然就丢数 
2. 情况二：写数据到leader后，follower还未同步，leader直接宕机，重新选举leader，自然就丢数 
3. 情况三：broker存储数据，通过缓存写入磁盘，还未写入磁盘时宕机，数据直接丢失

对于情况一 

1. 可以改自动提交为手动提交
2. 可以用zookeeper记录kafka分区消费情况，消费者从指定偏移量处seek 

对于情况二

1. topic设置replication.factor必须大于1，保证每个分区都至少有2个副本
2. 生产者设置retries=MAX(无限次重试)，保证一旦写入失败，卡在重试这里不动
3. 生产者设置acks=-1或all，保证必须写入所有replica，才算是写入成功
4. kafka服务器设置min.insync.replicas必须大于1，保证leader至少有一个follower保持联系

设置acks参数可以更换模式，那么都有什么模式呢？👇

## 10 acks参数设置

1. acks用来指定分区中有多少个副本收到这条消息，生产者才认为这条消息是写入成功
2. acks=1(默认)，leader写入成功，就代表成功
3. acks=0，发送消息即算写入成功，容易导致消息丢失
4. acks=-1、acks=all，ISR中的所有副本都成功写入消息后生产者才认为是写入成功

如果消息内容是对数据库某行记录update，如何保证顺序性呢？👇

## 11 如何保证顺序性

1. 情况一：一个topic下有多个partition，发送消息是分散在不同partition上的
2. 情况二：如果1个topic下只有1个partition，那么自然保证此topic下的顺序性
3. 对于情况二：如果必须要多个partition呢，可以用partition-key，相同的key发送到同一个partition上，key可以作为某种有强制顺序性的标识，比如id，流水号等
4. 注意：到了消费者一端，如果是多线程模型消费，也无法保证消费顺序性，所以才去单线程模型，考虑到吞吐量，在单线程模型消费下，将消费到数据通过强制性标识比如id，流水号分发到不同的内存队列上，在这里创建多线程，由每个线程负责一个内存队列

如果考虑到顺序性，也采取了合适的模型，那么如果先序数据发送失败，后序数据发送成功呢？👇

## 12 生产者发送消息模式

1. 发后忘记（fire-and-forget）：不关心消息是否正确到达
2. 同步（sync）：调用get()方法，返回Future对象，同步等待消息是否发送成功
3. 异步（async）：有回调函数，当发送失败时调用此函数，不会阻塞其他消息发送
4. 这里异步请求发送失败的消息，可以打上失败标记，存在失败队列中，单独用某个定时器重新发送

某个分区一边生产，一边消费，如何确定能消费到哪些呢？👇

## 13 如何确定拿到某条分区消息

1. 分区相当于日志文件
2. 日志起始偏移量（LogStartOffset）、即将写入消息偏移量（LogEndOffset,简称LEO）、可以消费区间（High Watermark,简称HW）
3. 举例：LSO为0，LEO为100，HW为70，则代表该分区offset可以从0开始消费，能消费的区间是0-69，如果该分区接受消息，将放在offset是100的位置上
4. ISR中replicas中都维护自己的LEO，并且最小的LEO作为所有副本的HW(包括它自己)
5. HW更新过程
   1. 生产者将消息发送到leader
   2. leader将消息保存到日志中，更新自己的偏移量
   3. follower向leader请求同步，携带自己的LEO
   4. leader通过LEO得到自己的HW，并将消息和HW返回给follower
   5. follower拿到消息同步到日志中，并更新HW

6. leader epoch：其实这就是一个版本号，在 follower 同步请求中不仅仅传递自己的 LEO，还会带上当前的 LE，当 leader 变更一次，这个值就会增 1

partition-key可以保证局部有序性，那么partition还有什么策略呢？👇

## 14 分区策略有哪些

1. 轮询RoundRobin：key为null时，依次将消息发送到topic的各个partition
2. key：根据key进行hash，能保证局部有序性，但是如果partition的数量发生变化，很难保证key和分区的映射关系
3. 自定义策略和指定partition发送
4. Range：消费者的总数和分区总数进行整除运算来分配，按照主题粒度的，所以可能会不均匀
5. Sticky：分区的分配尽可能均匀，以及分配要尽可能和上次保持一致

又了解到了分区再分配，那么分区再分配解决了什么问题呢？👇

## 15 分区再分配解决了什么问题

1. 如果没有分区再分配，那会发生什么呢？
2. 情况一：集群中broker下线了，如果节点上的分区是单副本的，那么这些分区就不可用了
3. 情况二：集群中加了一个broker，那么新的分区会分配在这个broker上，旧的分区却不会分配在这个broker上，导致老节点和新节点之间负载不均衡
4. 分区再分配就是通过控制器给分区增加新的副本，通过网络把旧副本上的数据复制到新副本上，复制完成后，再将旧副本清除（通过复制限流不影响集群正常功能）

提到了控制器对分区再分配的作用，那么控制器是什么呢？👇

## 16 控制器是什么

1. 集群中的broker其中一个会被选举成控制器
2. 负责管理集群中的所有分区和副本状态
3. 控制器只能有一个
4. 情况一：leader副本出现故障 -> 为其选举出新的leader副本
5. 情况二：ISR集合发生变化 - > 通知所有broker更新其元数据信息
6. 情况三：某个topic增加分区数量 -> 为其重新分配分区

---

## 17 日志文件

1. kafka 采用了追加日志的格式将数据存储在磁盘上，追加日志的格式可以带来写性能的提升
2. kafka 中的 log 文件对应着多个日志分段 LogSegment
3. 日志删除（Log Retention）
   1. 按照一定策略直接删除日志分段
   2. 过期时间和日志大小。默认保留时间是 7 天，默认大小是 1GB
4. 日志压缩（Log Compaction）
   1. 对每个消息的 key 进行整合，只保留同一个 key 下最新的 value
   2. 日志压缩会产生小文件，为了避免小文件过多，kafka 在清理的时候还会对其进行合并
5. 日志索引--为了提高读的性能，需要在写的时候维护一个索引，有偏移量索引和日志索引
6. 偏移量索引：维护一张映射表，key是消息的偏移量，value是日志文件的偏移量，Kafka维护的是稀疏索引，如果没找到对应的key，那么就先找到比offset小一点的key，再找到value，然后在日志中查找
7. 时间戳索引：时间戳索引是一个二级索引，现根据时间戳找到偏移量，然后就可以使用偏移量索引找到对应的消息位置
8. Kafka零拷贝：在内核态直接将文件内容复制到网卡设备上，减少了内核态与用户态之间的切换

## 18 生产者如何写入数据

在生产端主要有两个线程：main 和 sender，两者通过共享内存 RecordAccumulator 通信

1. main线程
   1. KafkaProducer：创建消息
   2. Partitioner：分区器计算该消息的目标分区，然后数据会存储在 RecordAccumulator 中
   3. Serializer：序列化器将消息转换成字节数组的形式
   4. ProducerInterceptors：生产者拦截器在消息发送之前做一些准备工作，比如过滤不符合要求的消息、修改消息的内容

2. sender线程
   1. 创建具体的请求，如果请求过多，会将部分请求缓存起来，将准备好的请求发送到 kafka 集群
   2. 每个请求的大小通过 max.reqeust.size 控制，默认 1MB
   3. 创建好请求后，根据发送到broker的不同重新分组，每个节点可以存储的请求由max.in.flight.requests.per.connection控制，默认5
3. RecordAccumulator消息累加器
   1. buffer.memory：消息累加器缓存大小，默认是32MB
   2. main线程发送消息太多导致缓存快满时，max.block.ms控制阻塞等待时间，默认60s
   3. ProducerBatch没装满时不会一直等待，linger.ms控制等待时间，默认0
   4. 消息被组装成ProducerBatch的形式，batch.size控制大小，默认是1MB，包含一个或多个消息

## 19 生产者参数

main线程

1. acks：1 消息写入方式
2. compression.type：none 消息压缩方式
3. retries：0 重试次数
4. retry.backoff.ms：100ms 重试间隔
5. max.block.ms：60s 发送消息阻塞时间

RecordAccumulator消息累加器

1. batch.size：1MB ProducerBatch大小
2. linger.ms：0 ProducerBatch控制等待时间

sender线程

1. metadata.max.age.ms：5分钟 元数据更新间隔时间
2. max.in.flight.requests.per.connection：5 每个连接最大未响应请求数
3. max.reqeust.size：1MB 每个请求大小限制
4. connection.max.idle.ms：9分钟 连接空闲时间
5. receive.buffer.bytes：32KB 接收缓存区大小
6. send.buffer.bytes：32KB 发送缓存区大小
7. request.timeout.ms：30s 等待请求响应最长时间

其他

1. replica.lag.time.max.ms：follower滞后leader的最长时间间隔
2. bootstrap.servers：连接集群的broker地址

## 20 消费者参数

1. enable.auto.commit：是否自动提交
2. auto.commit.interval.ms：自动提交的时间间隔

## 21 消费者再均衡

1. 消费者之间的协调是通过消费者协调器（ConsumerCoordinator）和组协调器（GroupCoordinator）来完成的
   1. 有新的消费者加入，下线，主动退出
   2. 消费组对应的组协调器节点发生变化
   3. 订阅的主题或分区发生数量变化
2. 再均衡会经过下面几个步骤：
   1. FindCoordinator：消费者查找组协调器所在的机器，然后建立连接
   2. JoinGroup：消费者向组协调器发起加入组的请求
   3. SyncGroup：组协调器将分区分配方案同步给所有的消费者
   4. Heartbeat：消费者进入正常状态，开始心跳

---

参考链接：

[https://zhuanlan.zhihu.com/p/568719368](https://zhuanlan.zhihu.com/p/568719368)
