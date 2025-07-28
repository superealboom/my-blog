---
title: redis持久化(RDB和AOF)
tags:
  - redis
createTime: 2025/02/14 15:23:44
permalink: /article/7gaaqo7i/
---

redis提供了三种持久化的方案，将内存中的数据持久化写入磁盘。

![image-20250214154021598](https://afuo-blog.oss-cn-beijing.aliyuncs.com/redis.assets/image-20250214154021598.png)

打开conf配置文件，第一个框表示：900秒内有1个写入操作，就RDB一次。300秒内有10个写入操作，就RDB一次。60秒内有10000个写入操作，就RDB一次。

第二个框表示：当备份进程出错的时候，主进程就停止接收新的写入操作，保证持久化的数据的一致性。

第三个框表示：RDB文件的压缩选项，Yes表示将RDB文件压缩后再去做保存。建议设置成no，因为redis是CPU密集型服务区，开启压缩后会带来更多的CPU的消耗，相比硬盘成本，CPU更值钱。

![image-20250214154105367](https://afuo-blog.oss-cn-beijing.aliyuncs.com/redis.assets/image-20250214154105367.png)

![image-20250214154124096](https://afuo-blog.oss-cn-beijing.aliyuncs.com/redis.assets/image-20250214154124096.png)

![image-20250214154136577](https://afuo-blog.oss-cn-beijing.aliyuncs.com/redis.assets/image-20250214154136577.png)

![image-20250214154151174](https://afuo-blog.oss-cn-beijing.aliyuncs.com/redis.assets/image-20250214154151174.png)

------

**RDB和AOF的优缺点比较**1>RDB优点：全量数据快照，文件小，恢复快RDB缺点：无法保存最近一次快照之后的数据2>AOF优点：可读性高，适合保存增量数据，数据不易丢失AOF缺点：文件体积大，恢复时间长

------

**RDB-AOF混合**redis4.0之后推出RDB-AOF混合持久化方式，并且是默认配置。BGSAVE做镜像全量持久化，AOF做增量持久化。在redis实例重启时，会使用BGSAVE持久化文件重新构建内容，再使用AOF重放近期的操作指令。
