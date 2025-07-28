---
title: redis分布式锁
tags:
  - redis
createTime: 2025/02/14 15:23:56
permalink: /article/0xjvboul/
---

首先结合springboot先配置一下redis 在application.yml的配置文件里。

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: root
    url: jdbc:mysql://127.0.0.1:3306/demo?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=GMT%2B8
  redis:
    database: 1
    host: 127.0.0.1
    port: 6379
```

```java
@Autowired
private StringRedisTemplate redisTemplate;

/*
    前情提要:
    key: productId;//商品ID
    value: System.currentTimeMillis() + 10*1000;//超时时间10秒
    前两个版本是错误，一步一步完善得到最终版本
*/


/*第一个版本*/
/*
这时候只需要考虑，
    如果key存在于redis数据库，那么证明锁已经存在。
    如果key不存在redis数据库，那么证明锁不存在，可以获得锁。
 所以在这里，key是有用的，其实value是无所谓的。
*/
public boolean lock(String key, String value) {

    if (redisTemplate.opsForValue().setIfAbsent(key, value)) {
        return true;
    }

    return false;
}


/*第二个版本*/
/*
这时候考虑的要多，
    如果一个线程拿到锁之后，还未解锁，
    服务器挂掉了，这样锁就一直存在，那显然不行。
于是要设置一个超时时间，当一个线程持有锁多长时间后，
      需要解锁。
那么value就有用了，可以当作超时时间来存。
*/
public boolean lock(String key, String value) {

    if (redisTemplate.opsForValue().setIfAbsent(key, value)) {
        return true;
    }

    String currentValue = redisTemplate.opsForValue().get(key);
    if (!StringUtils.isEmpty(currentValue) && Long.parseLong(currentValue) < System.currentTimeMillis()) {
        redisTemplate.opsForValue().set(key, value);
        return true;
    }

    return false;
}

/*第三个版本*/
/*
这时候发现，
    这样写完之后，无法保证加锁的原子性，
    如果多个线程进来怎么办？
    多个线程都会拿到key的锁。
然后，再引入第二个redis的方法:getAndSet。
    只有第一个线程是 redis数据库中的value与value自身比较，自然可以拿到锁。
    之后的线程都是用 入参value 与 redis数据库中的value比较，两者必然不相等，拿不到锁。
*/
public boolean lock(String key, String value) {

    if (redisTemplate.opsForValue().setIfAbsent(key, value)) {
        return true;
    }

    String currentValue = redisTemplate.opsForValue().get(key);
    if (!StringUtils.isEmpty(currentValue) && Long.parseLong(currentValue) < System.currentTimeMillis()) {
        String oldValue = redisTemplate.opsForValue().getAndSet(key, value);
        if (!StringUtils.isEmpty(oldValue) && oldValue.equals(currentValue)) {
            return true;
        }
    }

    return false;
}

/*
SET KEY VALUE [EX seconds] [PX milliseconds] [NX|XX]

[EX seconds]: 设置过期时间为seconds秒
[PX milliseconds]: 设置过期时间为milliseconds秒
[NX|XX]: NX->key不存在时，才set. XX->key存在时，才set》
*/

/*第四版本*/
public boolean lock(String key, String value) {

    if (redisTemplate.opsForValue().setIfAbsent(key, value, 10, TimeUnit.SECONDS)) {
        return true;
    }

    return false;
}
```

