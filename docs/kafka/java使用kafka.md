---
title: java使用kafka
tags:
  - kafka
createTime: 2025/02/13 22:16:55
permalink: /article/9lm8a7ob/
---
## 1 maven

https://mvnrepository.com/ 搜索 org.apache.kafka 可以看到有两种maven格式，以2.3.1举例

1. 引入jar -

- kafka-clients-2.3.1.jar

```Java
<!-- https://mvnrepository.com/artifact/org.apache.kafka/kafka-clients -->
<dependency>
    <groupId>org.apache.kafka</groupId>
    <artifactId>kafka-clients</artifactId>
    <version>2.3.1</version>
</dependency>
```

1. 引入jar -

- kafka_2.11-2.3.1.jar （多出来的这个是scala客户端）

```Java
<!-- https://mvnrepository.com/artifact/org.apache.kafka/kafka -->
<dependency>
    <groupId>org.apache.kafka</groupId>
    <artifactId>kafka_2.11</artifactId>
    <version>2.3.1</version>
</dependency>
```

## 2 生产者

```Java
package com.superealboom.demo.kafka;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.junit.Test;

import java.util.Properties;


public class ProducerDemo {

    KafkaProducer<String, String> producer = null;

    @Test
    public void send() throws Exception {
        final Properties producerProps = new Properties();
        producerProps.put(ProducerConfig.CLIENT_ID_CONFIG, "producer-kafka-1");//client.id
        producerProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "127.0.0.1:9092");//bootstrap.servers
        producerProps.put(ProducerConfig.ACKS_CONFIG, "-1");//acks
        producerProps.put(ProducerConfig.RETRIES_CONFIG, "30");//retries
        producerProps.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, "1");//max.in.flight.requests.per.connection
        producerProps.put(ProducerConfig.BATCH_SIZE_CONFIG, "16384");//batch.size
        producerProps.put(ProducerConfig.LINGER_MS_CONFIG, "10");//linger.ms
        producerProps.put(ProducerConfig.BUFFER_MEMORY_CONFIG, "33554432");//buffer.memory
        producerProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringSerializer");//key.serializer
        producerProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringSerializer");//value.serializer
        producerProps.put(ProducerConfig.SEND_BUFFER_CONFIG, "262144");

        producer = new KafkaProducer<>(producerProps);

        sendSync("test","key-1","this is java-kafka-18");
    }


    public void sendSync(String topic, String key, String message) throws Exception {
        producer.send(new ProducerRecord<>(topic, key, message)).get();
    }

    public void sendAsync(String topic, String key, String message) {
        producer.send(new ProducerRecord<>(topic, key, message), (recordMetadata, e) -> {
            if (e != null){
                e.printStackTrace();
            }
        });
    }
}
```

## 3 消费者

### 3.1 一直消费

```Java
package com.superealboom.demo.kafka;

import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.util.Arrays;
import java.util.List;
import java.util.Properties;

/**
 * @description: while
 * @author: tianci
 * @date: 2022/5/2 20:38
 */
public class ConsumerDemo_while {

    public static void main(String[] args) {
        final Properties properties = new Properties();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "127.0.0.1:9092");
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, "kafka-1");
        properties.put(ConsumerConfig.CLIENT_ID_CONFIG, "consumer-kafka-1");
        properties.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        properties.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        properties.put(ConsumerConfig.RECEIVE_BUFFER_CONFIG, "33554432");
        properties.put(ConsumerConfig.MAX_PARTITION_FETCH_BYTES_CONFIG, "30720");
        properties.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, "3000");
        properties.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, "1048576");
        properties.put(ConsumerConfig.FETCH_MAX_BYTES_CONFIG, "104857600");
        properties.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, "1200000");
        properties.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "1000000");
        properties.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, "60000");
        properties.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, "org.apache.kafka.clients.consumer.RangeAssignor");
        properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        Consumer<String, String> consumer = new KafkaConsumer<>(properties);
        List<String> topicNameList = Arrays.asList("test");
        consumer.subscribe(topicNameList);
        while (true) {
            ConsumerRecords<String, String> records = consumer.poll(100);
            for (ConsumerRecord<String, String> record : records) {
                System.out.println("offset = " + record.offset() + ", key = " + record.key() + ", value = " + record.value());
            }
        }
    }

}
```

### 3.2 指定位置

```Java
package com.superealboom.demo.kafka;

import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.time.Duration;
import java.util.*;

/**
 * @description: seek
 * @author: tianci
 * @date: 2022/5/2 20:43
 */
public class ConsumerDemo_seek {

    public static void main(String[] args) {

        final Properties properties = new Properties();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "127.0.0.1:9092");
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, "kafka-1");
        properties.put(ConsumerConfig.CLIENT_ID_CONFIG, "consumer-kafka-1");
        properties.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        properties.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        properties.put(ConsumerConfig.RECEIVE_BUFFER_CONFIG, "33554432");
        properties.put(ConsumerConfig.MAX_PARTITION_FETCH_BYTES_CONFIG, "30720");
        properties.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, "3000");
        properties.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, "1048576");
        properties.put(ConsumerConfig.FETCH_MAX_BYTES_CONFIG, "104857600");
        properties.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, "1200000");
        properties.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "1000000");
        properties.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, "60000");
        properties.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, "org.apache.kafka.clients.consumer.RangeAssignor");
        properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        Consumer<String, String> consumer = new KafkaConsumer<>(properties);
        List<String> topicNameList = Collections.singletonList("test");
        consumer.subscribe(topicNameList);
        Set<TopicPartition> assignment = new HashSet<>();
        /*
            while poll无读数据的意义,这里poll的原因如下：
            seek只能重置消费者分配到的分区的消费位置,而分区的分配是在poll的调用过程中实现的
            也就是说，在执行seek之前需要先执行一次poll方法
        */
        while (assignment.size() == 0) {
            consumer.poll(Duration.ofMillis(100));
            assignment = consumer.assignment();
        }
        for (TopicPartition topicPartition : assignment) {
            System.out.println(topicPartition.topic() + "," + topicPartition.partition());
            consumer.seek(topicPartition, 0);
        }
        // 规定从设定的offset开始消费数据
        System.out.println("开始拉取数据");
        ConsumerRecords<String, String> consumerRecords = consumer.poll(5000);
        for (ConsumerRecord<String, String> record : consumerRecords) {
            System.out.println("offset = " + record.offset() + ", key = " + record.key() + ", value = " + record.value());
        }
        System.out.println(consumerRecords.count());
        consumer.commitSync();
        consumer.unsubscribe();
    }
}
```

### 3.3 移动偏移量

```Java
package com.superealboom.demo.kafka;

import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * @description: syn
 * @author: tianci
 * @date: 2022/6/1 09:52
 */
public class ConsumerDemo_sync {
    public static void main(String[] args) {

        final Properties properties = new Properties();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "127.0.0.1:9092");
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, "kafka-1");
        properties.put(ConsumerConfig.CLIENT_ID_CONFIG, "consumer-kafka-1");
        properties.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        properties.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        properties.put(ConsumerConfig.RECEIVE_BUFFER_CONFIG, "33554432");
        properties.put(ConsumerConfig.MAX_PARTITION_FETCH_BYTES_CONFIG, "30720");
        properties.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, "3000");
        properties.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, "1048576");
        properties.put(ConsumerConfig.FETCH_MAX_BYTES_CONFIG, "104857600");
        properties.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, "1200000");
        properties.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "1000000");
        properties.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, "60000");
        properties.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, "org.apache.kafka.clients.consumer.RangeAssignor");
        properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        Consumer<String, String> consumer = new KafkaConsumer<>(properties);

        Map<TopicPartition, OffsetAndMetadata> topicPartitionOffsetAndMetadataMap = new HashMap<>();
        topicPartitionOffsetAndMetadataMap.put(new TopicPartition("test", 0), new OffsetAndMetadata(15));
        consumer.commitSync(topicPartitionOffsetAndMetadataMap);

    }
}
```

### 3.4 某个时间点的偏移量

```Java
package com.superealboom.demo.kafka;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndTimestamp;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * @description: time
 * @author: tianci
 * @date: 2022/6/7 15:39
 */
@Slf4j
public class ConsumerDemo_time {
    private static DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    public static void main(String[] args) throws Exception {
        final Properties properties = new Properties();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "127.0.0.1:9092");
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, "kafka-1");
        properties.put(ConsumerConfig.CLIENT_ID_CONFIG, "consumer-kafka-1");
        properties.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        properties.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        properties.put(ConsumerConfig.RECEIVE_BUFFER_CONFIG, "33554432");
        properties.put(ConsumerConfig.MAX_PARTITION_FETCH_BYTES_CONFIG, "30720");
        properties.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, "3000");
        properties.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, "1048576");
        properties.put(ConsumerConfig.FETCH_MAX_BYTES_CONFIG, "104857600");
        properties.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, "1200000");
        properties.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "1000000");
        properties.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, "60000");
        properties.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, "org.apache.kafka.clients.consumer.RangeAssignor");
        properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        Consumer<String, String> consumer = new KafkaConsumer<>(properties);
        long fetchDataTime = df.parse("1999-06-07 16:32:00").getTime();
        restOffset(consumer, "topic01", fetchDataTime);

        // "2022-06-01 10:18:00"  - time = {2022-06-01 10:18:09}, offset = {10}
        // "2022-06-01 10:19:00"  - time = {2022-06-01 10:21:19}, offset = {11}
    }

    /**
     *
     * @Title restOffset
     * @Description
     * @param consumer      消费者
     * @param topic         主题
     * @param fetchDataTime 需要查找的位置点时间戳
     * @return void
     */
    private static void restOffset(Consumer<String, String> consumer, String topic, long fetchDataTime) {
        try {
            // 获取topic的partition信息
            List<PartitionInfo> partitionInfos = consumer.partitionsFor(topic);
            List<TopicPartition> topicPartitions = new ArrayList<>();

            Map<TopicPartition, Long> timestampsToSearch = new HashMap<>();

            for (PartitionInfo partitionInfo : partitionInfos) {
                topicPartitions.add(new TopicPartition(partitionInfo.topic(), partitionInfo.partition()));
                timestampsToSearch.put(new TopicPartition(partitionInfo.topic(), partitionInfo.partition()),
                        fetchDataTime);
            }
            System.out.println("设置读取时间戳,{"+fetchDataTime+"}");
            consumer.assign(topicPartitions);

            // 获取每个partition一个小时之前的偏移量
            Map<TopicPartition, OffsetAndTimestamp> map = consumer.offsetsForTimes(timestampsToSearch);

            OffsetAndTimestamp offsetTimestamp = null;
            System.out.println(topic+",开始设置各分区初始偏移量...");
            for (Map.Entry<TopicPartition, OffsetAndTimestamp> entry : map.entrySet()) {
                // 如果设置的查询偏移量的时间点大于最大的offset记录时间，那么value就为空
                offsetTimestamp = entry.getValue();
                if (offsetTimestamp != null) {
                    int partition = entry.getKey().partition();
                    long timestamp = offsetTimestamp.timestamp();
                    long offset = offsetTimestamp.offset();
                    System.out.println("partition ={"+partition+"}, time = {"+ df.format(new Date(timestamp))+"}, offset = {"+offset+"}");
                    // 设置读取消息的偏移量
                    // consumer.seek(entry.getKey(), offset);
                }
            }
            System.out.println("{"+topic+"},设置各分区初始偏移量结束...");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### 3.5 通过consumer查看积压

```Java
package com.superealboom.demo.kafka;

import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.Test;

import java.time.Duration;
import java.util.*;

/**
 * @author tianci
 * @description 查看kafka积压情况
 * @date 2022/4/19 16:03
 */
public class Overstock_Consumer {

    @Test
    public void look() {
        final Properties properties = new Properties();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "127.0.0.1:9092");
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, "kafka-1");
        properties.put(ConsumerConfig.CLIENT_ID_CONFIG, "consumer-kafka-1");
        properties.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        properties.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        properties.put(ConsumerConfig.RECEIVE_BUFFER_CONFIG, "33554432");
        properties.put(ConsumerConfig.MAX_PARTITION_FETCH_BYTES_CONFIG, "30720");
        properties.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, "3000");
        properties.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, "1048576");
        properties.put(ConsumerConfig.FETCH_MAX_BYTES_CONFIG, "104857600");
        properties.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, "1200000");
        properties.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "1000000");
        properties.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, "60000");
        properties.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, "org.apache.kafka.clients.consumer.RangeAssignor");
        properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        Consumer<String, String> consumer = new KafkaConsumer<>(properties);
        // 也可以用  consumer.listTopics() 列举
        List<String> topicNameList = Arrays.asList("test");

        for (String topicName : topicNameList) {
            List<TopicPartition> topicPartitionList = new ArrayList<>();
            Collection<PartitionInfo> partitionInfos = consumer.partitionsFor(topicName);
            partitionInfos.forEach(
                    partitionInfo -> topicPartitionList.add(new TopicPartition(partitionInfo.topic(), partitionInfo.partition()))
            );
            Map<TopicPartition, Long> beginningOffsetMap = consumer.beginningOffsets(topicPartitionList);
            Map<TopicPartition, Long> endOffsetMap = consumer.endOffsets(topicPartitionList);
            for (TopicPartition topicPartition :topicPartitionList) {
                System.out.print("topicName:" + topicPartition.topic() + ",");
                System.out.print("partition:" + topicPartition.partition() + "  ");
                System.out.print("beginningOffset:" + beginningOffsetMap.get(topicPartition) + ",");
                OffsetAndMetadata committed = consumer.committed(topicPartition);
                System.out.print("currentOffset:" + committed.offset() + ",");
                System.out.print("endOffset:" + endOffsetMap.get(topicPartition) + ",");
                System.out.println("lag:" + (endOffsetMap.get(topicPartition) - committed.offset()));
                // lag = endOffset - currentOffset;
            }
        }
    }
}
```

### 3.6 通过AdminClient查看积压

```Java
package com.superealboom.demo.kafka;

import org.apache.kafka.clients.admin.*;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.Test;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

/**
 * @author tianci
 * @description 查看kafka积压情况
 * @date 2022/4/19 16:53
 */
public class Overstock_AdminClient {

    @Test
    public void look() throws ExecutionException, InterruptedException {
        final Properties properties = new Properties();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "127.0.0.1:9092");
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, "kafka-1");
        properties.put(ConsumerConfig.CLIENT_ID_CONFIG, "consumer-kafka-1");
        properties.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        properties.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        properties.put(ConsumerConfig.RECEIVE_BUFFER_CONFIG, "33554432");
        properties.put(ConsumerConfig.MAX_PARTITION_FETCH_BYTES_CONFIG, "30720");
        properties.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, "3000");
        properties.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, "1048576");
        properties.put(ConsumerConfig.FETCH_MAX_BYTES_CONFIG, "104857600");
        properties.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, "1200000");
        properties.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "1000000");
        properties.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, "60000");
        properties.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, "org.apache.kafka.clients.consumer.RangeAssignor");
        properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        AdminClient adminClient = AdminClient.create(properties);

        List<String> groupIdsOfTopic = new ArrayList<>();
        ListConsumerGroupsResult groupResult = adminClient.listConsumerGroups(new ListConsumerGroupsOptions());
        Collection<ConsumerGroupListing> list = groupResult.valid().get();
        List<String> groupIds = list.stream().map(ConsumerGroupListing::groupId).collect(Collectors.toList());
        DescribeConsumerGroupsResult consumerGroupsResult = adminClient.describeConsumerGroups(groupIds);
        Map<String, ConsumerGroupDescription> consumerGroupDescriptionMap = consumerGroupsResult.all().get();
        for (Map.Entry<String, ConsumerGroupDescription> entry : consumerGroupDescriptionMap.entrySet()) {
            ConsumerGroupDescription consumerGroupDescription = entry.getValue();
            String groupId = consumerGroupDescription.groupId();
            groupIdsOfTopic.add(groupId);
            // for (MemberDescription memberDescription : consumerGroupDescription.members()) {
            //     String consumerId = memberDescription.consumerId();
            //     String host = memberDescription.host();
            //     System.out.println(consumerId);
            //     System.out.println(host);
            //     for (TopicPartition topicPartition : memberDescription.assignment().topicPartitions()) {
            //         String unitTopic = topicPartition.topic();
            //         Integer unitPartition = topicPartition.partition();
            //         System.out.println(unitTopic);
            //         System.out.println(unitPartition);
            //     }
            // }
        }


        for (String groupId : groupIdsOfTopic) {
            ListConsumerGroupOffsetsResult consumerGroupOffsetsResult = adminClient.listConsumerGroupOffsets(groupId);
            Map<TopicPartition, org.apache.kafka.clients.consumer.OffsetAndMetadata> consumerGroupOffsetsMap = consumerGroupOffsetsResult.partitionsToOffsetAndMetadata().get();
            for (Map.Entry<TopicPartition, org.apache.kafka.clients.consumer.OffsetAndMetadata> entry : consumerGroupOffsetsMap.entrySet()) {
                String topic = entry.getKey().topic();
                int partition = entry.getKey().partition();
                long offset = entry.getValue().offset();
                System.out.print("groupId:" + groupId + ",");
                System.out.print("topic:" + topic + ",");
                System.out.print("partition:" + partition + "  ");
                System.out.println("currentOffset:" + offset);
                // endOffset use consumer.endOffsets;
                // lag = endOffset - currentOffset;
            }
        }
    }
}
```

