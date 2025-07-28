---
title: 三线程打印abc
tags:
  - java
  - 多线程
createTime: 2025/02/14 16:58:11
permalink: /article/nhpyd4uc/
---

```Java
package com.superealboom.demo.threadTest;


/**
 *  @author: tianci
 *  @Date: 2022/3/22 16:53
 *  @Description:
 *  三线程打印ABC
 */
public class ThreeThreadDemo extends Thread {

    private String name;
    private final Object current;
    private final Object prev;

    private ThreeThreadDemo(String name, Object current, Object prev) {
        this.name = name;
        this.current = current;
        this.prev = prev;
    }

    public static void main(String[] args) throws InterruptedException {
        Object a = new Object();
        Object b = new Object();
        Object c = new Object();

        new ThreeThreadDemo("A", a, c).start();
        Thread.sleep(100);
        new ThreeThreadDemo("B", b, a).start();
        Thread.sleep(100);
        new ThreeThreadDemo("C", c, b).start();

    }

    @Override
    public void run() {
        int count = 10;
        while (count>0) {
            synchronized (prev) {
                synchronized (current) {
                    //打印当前线程字母
                    System.out.println(name);
                    count--;
                    // 这里唤醒当前线程，使得把当前线程当作prev的线程继续执行，保证顺序性
                    current.notify();
                }
                try {
                    prev.wait();//这里让线程等待，等待prev线程唤醒后，才能继续执行，保证顺序性
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

打印A，A唤醒，(第二次进入这里时，A唤醒后，B线程可以继续走，打印B…)C等待，（A线程卡在C的等待上，需要C唤醒）

打印BB唤醒，(第二次进入这里时，B唤醒后，C线程可以继续走，打印C…)A等待，（B线程卡在A的等待上，需要A唤醒）

打印C，C唤醒，(第一次进入这里时，C唤醒后，A线程可以继续走，打印A…)B等待，（C线程卡在B的等待上，需要B唤醒）

*当程序启动，打印出结果，但是程序并未停止。*

按照代码逻辑思考，当第10个A打印完毕之后。是进不出while循环的，无法唤醒A的等待。而B线程中还在等待A的唤醒，C线程中还在等待B的唤醒。所以程序没有停止。
