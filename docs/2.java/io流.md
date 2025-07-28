---
title: io流
tags:
  - java
createTime: 2025/02/14 16:00:32
permalink: /article/uplig8h7/
---
1. IO框架的由来：程序设计语言必须要提供程序与外部设备交互的方式

2. 数据从外流到内存，就是输入；数据从内存出去，就是输出

3. 任何外设与内存之间的输入/出操作都是IO流完成的

4. Java的API提供了两个顶层抽象类InputStream，OutputStream；操作文件可以用FileInputStream，FileOutputStream；将来操作别的也可以有其他类继承InputStream，OutputStream

5. 开闭原则：对拓展开发，对修改关闭

6. 不带缓冲区的流对象，只能一个字节一个字节的读；带缓冲区的流对象，可以一次读一个缓冲区，用BufferedInputStream和BufferedOutputStream，BufferedInputStream的defaultBufferSize=8192

7. 所有流都是建立在字节流上的，字节流可以读任何字节，但是未必能读懂，比如汉字，所以需要两个转换流InputStreamReader（将字节转化成字符）,OutputStreamWriter（将字符转换成字节），这其中用到了设计模式中的装饰模式

8. FileReader和FileWriter可以直接把文件转成读取写入流，省去创建字节流和转换流的过程，并有抽象类Reader和Writer，以此类推，也有BufferedReader和BufferWriter，字符流本身就带有缓冲区，缓冲字符流对于字符流来说效率提升不大

9. 流ByteArrayReader/Writer，PipedWriter/Reader数据不出内存，close()方法可有可无

10. Java中字符采用Unicode标准，一个英文是一个字节，一个中文是两个字节，在UTF8编码中，一个中文是三个字节

11. 字节流用来处理视频，音频，PPT，word，图片等，字符流用来处理纯文本文件

12. FileInputStream读和FileOutputStream写

```Java
作者：醋酸菌HaC
链接：https://www.zhihu.com/question/67535292/answer/1728183629
来源：知乎
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

public class OutputStreamTest {
    public static void main(String[] args) throws IOException {
        writeFile(); //单个字节写、字节数字写
        readFile1();//单个字节读取
        readFile2();//字节数组读取
        readFile3();//一次性读取
    }
    
    static void writeFile() throws IOException {
        //1、第一种方法写，单个字节写
        //会自动创建文件，目录不存在会报错， true 表示 追加写，默认是false
        FileOutputStream fileOutputStream = new FileOutputStream("F:\\hello.txt", false);
        //往文件里面一个字节一个字节的写入数据
        fileOutputStream.write((int) 'H');
        fileOutputStream.write((int) 'a');
        fileOutputStream.write((int) 'C');
        //2、第二种方法写 字节数组写
        String s = " HelloCoder";
        //入文件里面一个字节数组的写入文件，文件为UTF_8格式
        fileOutputStream.write(s.getBytes(StandardCharsets.UTF_8));
        //刷新流
        fileOutputStream.flush();
        //关闭流
        fileOutputStream.close();
    }
    
    static void readFile1() throws IOException {
        //1、第一种读的方法，但字节读
        System.out.println("------一个字节读------");
        //传文件夹的名字来创建对象
        FileInputStream fileInputStream = new FileInputStream("F:\\hello.txt");
        int by = 0;
        //一个字节一个字节的读出数据
        while ((by = fileInputStream.read()) != -1) {
            System.out.print((char) by);
        }
        //关闭流
        fileInputStream.close();
    }
    
    static void readFile2() throws IOException {
        //2、第二种读的方法，字节数组读
        System.out.println();
        System.out.println("------字节数组读------");
        FileInputStream fileInputStream = new FileInputStream("F:\\hello.txt");
        //通过File对象来创建对象
        fileInputStream = new FileInputStream(new File("F:\\hello.txt"));
        int by = 0;
        byte[] bytes = new byte[10];
        //一个字节数组的读出数据，高效
        while ((by = fileInputStream.read(bytes)) != -1) {
            for (int i = 0; i < by; i++) {
                System.out.print((char) bytes[i]);
            }
        }
        //关闭流
        fileInputStream.close();
    }

    static void readFile3() throws IOException {
        //3、第三种读方法，一次性读
        System.out.println();
        System.out.println("------一次性读文件------");
        FileInputStream fileInputStream = new FileInputStream("F:\\hello.txt");
        fileInputStream = new FileInputStream(new File("F:\\hello.txt"));
        //一次性读文件
        int iAvail = fileInputStream.available();
        int by = 0;
        byte[] bytesAll = new byte[iAvail];
        while ((by = fileInputStream.read(bytesAll)) != -1) {
            for (int i = 0; i < by; i++) {
                System.out.print((char) bytesAll[i]);
            }
        }
        fileInputStream.close();
    }
}
```

FileReader读和FileWriter写

```Java
作者：醋酸菌HaC
链接：https://www.zhihu.com/question/67535292/answer/1728183629
来源：知乎
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

public class ReaderTest {
    public static void main(String[] args) throws IOException {
        write(); //字符串写
        read1();//
        read2();//
    }

    static void write() throws IOException {
        FileWriter fileWriter = new FileWriter("F:\\Hello1.txt");
        //为防止乱码，可以这样写，字符流和字节流互转
//        Writer fileWriter = new BufferedWriter(new OutputStreamWriter(
//                new FileOutputStream("F:\\Hello1.txt"), StandardCharsets.UTF_8));
        fileWriter.write("今天打工你不狠，明天地位就不稳\n" +
                "今天打工不勤快，明天社会就淘汰");
        
        // 如果没有刷新，也没有关闭流的话 数据是不会写入文件的
        fileWriter.flush();
        fileWriter.close();
    }

    static void read1() throws IOException {
        System.out.println("------一个一个char读-------");
        FileReader fileReader = new FileReader("F:\\Hello1.txt");
        int ch = 0;
        String str = "";
        //一个一个char读
        while ((ch = fileReader.read()) != -1) {
            str += (char) ch;
        }
        System.out.println(str);
    }

    static void read2() throws IOException {
        System.out.println("------char数组[]读-------");
        FileReader fileReader = new FileReader(new File("F:\\Hello1.txt"));
        int len = 0;
        char[] chars = new char[10];
        while ((len = fileReader.read(chars)) != -1) {
            //这种读有误
//            System.out.print(new String(chars));
            System.out.print((new String(chars, 0, len)));
        }
        fileReader.close();
    }
}
```

BufferReader读和BufferWriter写（readLine()和newLine()）

```Java
作者：醋酸菌HaC
链接：https://www.zhihu.com/question/67535292/answer/1728183629
来源：知乎
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

public class BufferedReaderTest {
    public static void main(String[] args) throws IOException {
        useInputStreamCopyFile(); //这种方法适用于任何文件
        //下面两种方法copy的文件变大了，因为是使用字符流处理的
        useBufferedReaderCopyFile(); //这种方法只适用于字符文件
        useFileReaderCopyFile(); //这种方法一步到位，只适用于字符文件

    }

    static void useInputStreamCopyFile() throws IOException {
        File file = new File("F:\\Hello1.txt");
        InputStream is = new FileInputStream(file);

        File file2 = new File("F:\\Hello1_copy1.txt");
        OutputStream os = new FileOutputStream(file2);
        int len = 0;
        byte[] bytes = new byte[1024];
        while ((len = is.read(bytes)) != -1) {
            os.write(bytes, 0, len);
        }
        is.close();
        os.close();
    }

    static void useBufferedReaderCopyFile() throws IOException {
        File file = new File("F:\\Hello1.txt");
        InputStream is = new FileInputStream(file);
        Reader reader = new InputStreamReader(is);
        //创建字符流缓冲区，BufferedReader 的构造入参是一个 Reader
        BufferedReader bufferedReader = new BufferedReader(reader);

        File file2 = new File("F:\\Hello1_copy2.txt");
        OutputStream os = new FileOutputStream(file2);
        Writer writer = new OutputStreamWriter(os);
        //创建字符流缓冲区，BufferedWriter 的构造入参是一个 Writer
        BufferedWriter bufferedWriter = new BufferedWriter(writer);

        String line = null;
        //readLine()方法 是根据\n 换行符读取的
        while ((line = bufferedReader.readLine()) != null) {
            bufferedWriter.write(line);
            //这里要加换行
            bufferedWriter.newLine();
        }
        bufferedReader.close();
        bufferedWriter.close();
    }

    static void useFileReaderCopyFile() throws IOException {
        //使用FileReader、FileWriter 一步到位
        Reader reader = new FileReader("F:\\Hello1.txt");
        BufferedReader bufferedReader = new BufferedReader(reader);
        Writer writer = new FileWriter("F:\\Hello1_copy3.txt");
        BufferedWriter bufferedWriter = new BufferedWriter(writer);
        String line = null;
        while ((line = bufferedReader.readLine()) != null) {
            bufferedWriter.write(line);
            bufferedWriter.newLine();
        }
        bufferedReader.close();
        bufferedWriter.close();
    }
}
```

1. close()方法包含flush()方法，Java对磁盘进行操作，IO是有缓存的，最后会有一部分数据在内存中，如果不调用flush()，数据会随着查询结束而消失，就像水管里的水
2. close()是闭流对象，但是会先刷新一次缓冲区，flush()仅仅是刷新缓冲区，强制写出缓冲区的数据
3. PrintWriter和FileWriter区别，printWriter提供了一些便利方法，不会抛出IO异常，大量日志情况下更推荐PrintWriter，print方法不会调用flush，println会调用flush，FileWriter(file, true);//这里设置的true就是设置在文档后面追加内容
4. 阿里面试题（FileInputStream使用完后，想二次使用怎么操作）
5. 使用反射，FileInputStream中有private open方法，传入文件绝对路径

```Java
Class in = fileInputStream.getClass();
Method openo = in.getDeclaredMethod("open", String.class);
//因为是private
openo.setAccessible(true);
openo.invoke(fileInputStream, fileName);
bytes = new byte[10];
while ((by = fileInputStream.read(bytes)) != -1) {
   System.out.print((new String(bytes, 0, by)));
}
```


---

参考链接：[https://www.zhihu.com/question/67535292](https://www.zhihu.com/question/67535292)



