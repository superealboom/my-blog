---
title: 并发编程 synchronized 和 volatile
tags:
  - ai随机问
createTime: 2025/08/05 13:35:10
permalink: /article/tfuytfd6/
---

## 1. 并发编程的三大问题

在看 synchronized 和 volatile 前，首先了解这三个问题

| 问题       | 通俗解释                                                     | 例子                                                         |
| :--------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **原子性** | 一个操作或多个操作，要么全部执行且执行过程不被打断，要么都不执行。 | `i++` 其实是 `i = i + 1`（读、加、写三步），多线程下可能被打断，导致结果错误。 |
| **可见性** | 当一个线程修改了共享变量的值，其他线程能立即看到修改后的值。 | 线程 A 修改了变量 `flag=true`，线程 B 可能还看到 `flag=false`（因为线程有本地缓存）。 |
| **有序性** | 程序执行的顺序按照代码的先后顺序执行（禁止编译器 / CPU 对指令重排序）。 | 代码写的是 `a=1; b=2;`，实际执行可能变成 `b=2; a=1;`（重排序不影响单线程，但可能影响多线程）。 |

👇 先了解 synchronized

## 2. synchronized 是什么？

1. `synchronized` 是 Java 最基础的同步机制，能解决**原子性、可见性、有序性**三大问题
2. `synchronized` 的核心是 “锁”，底层依赖 JVM 的 **Monitor（监视器）** 实现，不同用法的实现细节略有不同
   - **同步代码块** ：通过 `monitorenter` 和 `monitorexit` 两个指令实现。进入代码块时执行 `monitorenter`（获取锁），退出时执行 `monitorexit`（释放锁）。如果抛出异常，JVM 会自动释放锁
   - **同步方法** ：不需要指令，而是在方法的 `class` 文件中添加 `ACC_SYNCHRONIZED` 标志。调用方法时，JVM 会检查这个标志，若存在则先获取锁，执行完后释放锁

👇 synchronized 如何解决三大问题？

## 3. synchronized 如何解决三大问题？

1. 原子性：**独占锁**：同一时间只有一个线程能获得锁，进入同步块 / 方法
2. 可见性：释放锁时，会将线程本地缓存中的变量**强制刷新到主内存**；获取锁时，会**清空线程本地缓存**，从主内存重新读取变量
3. 有序性：通过 “锁的排他性” 隐式保证有序性（编译器 / CPU 不会对单线程有问题的代码重排序）

👇 synchronized 是怎么使用的？

## 4. synchronized怎么使用？

1. 作用在普通方法上（非静态方法）：锁住的对象：**当前对象实例（`this`）**

   ```java
   public class SyncDemo {
       public synchronized void method() {
           try {
               Thread.sleep(1000);
               System.out.println(Thread.currentThread().getName() + "执行完毕");
           } catch (InterruptedException e) {
               e.printStackTrace();
           }
       }
   
       public static void main(String[] args) {
           SyncDemo obj1 = new SyncDemo();
           SyncDemo obj2 = new SyncDemo();
   
           // 线程1和线程2调用同一个对象的method()：互斥（依次执行）
           new Thread(() -> obj1.method(), "线程1").start();
           new Thread(() -> obj1.method(), "线程2").start(); // 等待线程1执行完才执行
   
           // 线程3调用另一个对象的method()：不互斥（与线程1同时执行）
           new Thread(() -> obj2.method(), "线程3").start(); // 和线程1同时开始
       }
   }
   ```

2. 作用在静态方法上（锁住的对象：**当前类的 Class 对象**）

   ```java
   public class SyncDemo {
       public static synchronized void staticMethod() {
           try {
               Thread.sleep(1000);
               System.out.println(Thread.currentThread().getName() + "执行完毕");
           } catch (InterruptedException e) {
               e.printStackTrace();
           }
       }
   
       public static void main(String[] args) {
           SyncDemo obj1 = new SyncDemo();
           SyncDemo obj2 = new SyncDemo();
   
           // 所有线程调用静态方法：无论用哪个对象，都竞争Class锁，全局互斥
           new Thread(() -> obj1.staticMethod(), "线程1").start();
           new Thread(() -> obj2.staticMethod(), "线程2").start(); // 等线程1执行完
           new Thread(() -> SyncDemo.staticMethod(), "线程3").start(); // 等线程2执行完
       }
   }
   ```

3. 作用在代码块上（可以是任意对象（如 this、类名.class、自定义对象等）

   ```java
   public class SyncDemo {
       // 自定义锁对象（通常用final修饰，避免锁对象被修改）
       private final Object lock1 = new Object();
       private final Object lock2 = new Object();
   
       public void methodA() {
           synchronized (lock1) { // 用lock1锁
               // 代码块A
           }
       }
   
       public void methodB() {
           synchronized (lock2) { // 用lock2锁
               // 代码块B（与A可并发执行，因为锁不同）
           }
       }
   }
   ```

👇 `synchronized` 性能问题？

## 5. synchronized 性能差不差？

1. 早期 `synchronized` 性能很差（因为是 “重量级锁”，依赖操作系统互斥量），但 JDK 6 后引入了**锁升级机制**
2. Java 中所有对象都有一个 “对象头”（Object Header），`synchronized` 的锁状态就存储在对象头中（具体是 `Mark Word` 区域）
3. 锁的状态从低到高依次为：**无锁 → 偏向锁 → 轻量级锁 → 重量级锁** ，升级是单向的，一旦升级就不会降级

锁的状态

1. **无锁**：初始状态，没有线程竞争
2. **偏向锁**：只有一个线程访问时，锁会 “偏向” 这个线程，下次访问无需竞争（直接获取），**减少无竞争开销** 
3. **轻量级锁**：多个线程交替访问时，用 CAS 操作（无阻塞）竞争锁，避免重量级锁的开销，**轻微竞争时使用** 
4. **重量级锁**：多个线程同时竞争时，升级为重量级锁（依赖操作系统互斥量），此时线程会阻塞，**激烈竞争时使用** 

👇 正常业务开发，如果我觉得要加锁，必然要用锁，也必然会有多个线程访问，那无锁和偏向锁必然无法维持，那大多数场景使用的是**轻量级锁**还是**重量级锁**？

## 6. 轻量级锁和重量级锁

1. 轻量级锁的核心优势是**用非阻塞的 CAS 操作处理 “交替竞争”**（多线程轮流获取锁，而非同时争抢）
2. 多数 Web 应用或服务的并发场景是 **多线程交替访问共享资源**，而非 **所有线程同时争抢同一把锁** 
3. 即使出现短暂的 “同时竞争”（如两个线程几乎同时尝试获取锁），轻量级锁会通过 **“自旋”**（线程在用户态循环等待，不进入内核态阻塞）优化
4. **轻量级 -> 重量级** ：重量级锁的升级需要满足严格条件（轻量级锁的 CAS 持续失败 + 自旋次数耗尽），这在大多数场景中不会发生

| 场景类型                  | 并发特点                     | 锁状态   | 占比（业务场景） |
| ------------------------- | ---------------------------- | -------- | ---------------- |
| 单线程 / 固定线程复用     | 无竞争或单一线程重复访问     | 偏向锁   | 约 10%-20%       |
| 普通 Web 接口（中低并发） | 多线程交替访问，同步块耗时短 | 轻量级锁 | 约 60%-70%       |
| 高并发核心接口            | 多线程同时竞争，同步块耗时长 | 重量级锁 | 约 10%-20%       |

👇 那轻量级锁的性能可以接受吗？CAS又是什么？

## 7. 轻量级锁性能和CAS

1. 核心思想： **在不使用锁的情况下，保证多线程对共享变量操作的原子性**

2. 核心参数：

   - **内存地址 V** 存储共享变量的内存地址
   - **预期值 A**：线程认为当前内存中的值应该是 A
   - **新值 B**：线程想要将变量更新为 B

3. 核心逻辑：线程读取 V 中的值记为 `current` 比较 `current` 与 A 是否相等，相等更新成 B，不相等说明变量已被其他线程修改，可以选择重试或放弃

4. CAS可以保证**原子性** 由**硬件层面**保证：CPU 会通过总线锁定（LOCK 前缀指令）或缓存锁定，确保同一时刻只有一个线程能修改内存地址 V 中的值

5. 在java中的应用

   ```java
   public class AtomicInteger extends Number implements java.io.Serializable {
       private volatile int value; // 共享变量，volatile保证可见性
   
       public final int incrementAndGet() {
           // 调用Unsafe的CAS方法，循环重试直到成功
         	// getAndAddInt 底层通过 CAS 操作更新 value，若失败则自旋重试，直到成功（这就是 “乐观锁” 的思想）
           return unsafe.getAndAddInt(this, valueOffset, 1) + 1;
       }
   }
   ```

6. CAS 无锁开销，无需获取 / 释放锁，避免线程阻塞 / 唤醒的内核态切换开销，在低竞争场景下性能远高于 `synchronized` 的重量级锁

7. CAS 失败时线程可立即重试，不会阻塞其他线程，适合 “读多写少” 的场景

👇 CAS会造成什么问题？怎么优化？

## 8. CAS的问题是什么？怎么优化？

1. **ABA 问题**
   - 线程 1 读取到值为 A，线程 2 将 A 改为 B 后又改回 A，线程 1 的 CAS 会认为值未变而成功更新，但实际中间已被修改
   - 给变量加版本号（如 `AtomicStampedReference`，通过 “值 + 版本号” 判断是否被修改）
2. **自旋开销** : 浪费CPU资源，所以自旋太多会升级为重量级锁
3. **只能保证单个变量的原子性** ：CAS 只能操作单个变量，无法保证多个变量的复合操作

👇 以上说完 `synchronized` 后，再说下 `volatile` 吧

## 9. volatile 是什么？

1. 轻量级关键字、轻量级可见性工具、只能保证可见性和有序性、不能保证原子性
2. `volatile` 的作用依赖 CPU 的**内存屏障**指令，通过限制编译器和 CPU 的 “指令重排序”，并强制刷新内存，实现可见性和有序性
3. 写 `volatile` 会在后面增加写屏障，强制将线程本地缓存中的变量刷新到主内存
4. 读 `volatile` 会在前面增加读屏障，强制从主内存读取最新值，清空线程本地缓存

👇 大概明白了，那`volatile` 有哪些使用场景呢？

## 10. volatile 有那些使用场景？

1. **状态标记量（线程停止标记）**

   ```java
   public class VolatileDemo {
       // 用volatile修饰状态标记，保证可见性
       private volatile boolean isRunning = true;
   
       public void start() {
           new Thread(() -> {
               while (isRunning) { // 线程循环执行任务
                   System.out.println("线程运行中...");
                   try {
                       Thread.sleep(1000);
                   } catch (InterruptedException e) {
                       e.printStackTrace();
                   }
               }
               System.out.println("线程已停止");
           }).start();
       }
   
       public void stop() {
           isRunning = false; // 主线程修改状态
       }
   
       public static void main(String[] args) throws InterruptedException {
           VolatileDemo demo = new VolatileDemo();
           demo.start();
           Thread.sleep(3000); // 运行3秒后停止
           demo.stop(); // 修改isRunning为false
       }
   }
   ```

2. **单例模式（双重检查锁定）**

   ```java
   public class Singleton {
       // 用volatile修饰实例变量，禁止指令重排序
       private static volatile Singleton instance;
   
       private Singleton() {} // 私有构造
   
       public static Singleton getInstance() {
           if (instance == null) { // 第一次检查（无锁，提高效率）
               synchronized (Singleton.class) { // 加锁
                   if (instance == null) { // 第二次检查（避免多线程竞争创建多个实例）
                       // 若不加volatile，这里可能发生指令重排序：
                       // 1. 分配内存 -> 2. 初始化对象 -> 3. 赋值给instance
                       // 重排后可能变为：1 -> 3 -> 2，此时其他线程可能拿到未初始化的instance
                       instance = new Singleton(); 
                   }
               }
           }
           return instance;
       }
   }
   ```

3. **独立观察变量（多线程读，单线程写）**

   ```java
   public class TemperatureSensor {
       // 温度值由传感器线程写入，其他线程读取
       private volatile double currentTemperature;
   
       // 传感器线程：定期更新温度（单线程写）
       public void startSensor() {
           new Thread(() -> {
               while (true) {
                   double temp = readFromHardware(); // 模拟从硬件读取温度
                   currentTemperature = temp; // 写入新值
                   try {
                       Thread.sleep(5000); // 每5秒更新一次
                   } catch (InterruptedException e) {
                       e.printStackTrace();
                   }
               }
           }).start();
       }
   
       // 其他线程：读取当前温度（多线程读）
       public double getCurrentTemperature() {
           return currentTemperature; // 读取最新值
       }
   
       private double readFromHardware() {
           // 模拟硬件读数
           return Math.random() * 50;
       }
   }
   ```

👇 这块对于第二个例子我有一个新的问题，代码里只写了`instance = new Singleton();` 为什么会有顺序变化呢？

## 11. `instance = new Singleton();` 发生了什么？

1. 在 **Java 源码层面的顺序是明确的**（“创建对象 → 赋值给引用”），但在 **底层编译或 CPU 执行时，可能会发生 “指令重排序”**
2. `instance = new Singleton();` 在底层会被拆分为至少 3 个核心步骤
   - **分配内存空间**：为新对象在堆中开辟内存（记为 `memory`）
   - **初始化对象**：调用 `Singleton` 的构造方法，初始化 `memory` 中的成员变量
   - **赋值引用**：将 `instance` 引用指向刚分配的内存地址（即 `instance = memory`，此时 `instance` 不再为 `null`）
3. **注意！**
   - 源码逻辑上，这三步的顺序应该是 `1 → 2 → 3`。但问题在于：**编译器或 CPU 为了优化性能，可能会对这三步进行重排序**
   - 只要不影响单线程下的执行结果，重排序是允许的
   - 如果发生重排序，步骤可能变成 `1 → 3 → 2`，当走到1 -> 3 后，另一个线程恰好进入单例的获取方法，会直接返回这个 `instance` 引用
   - 但这个引用指向的内存中，对象还没完成初始化，后续就会出现 **空指针异常或数据错乱**
