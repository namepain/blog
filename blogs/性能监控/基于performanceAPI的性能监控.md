# 基于 performance API 的前端性能监控

window.performance.timing API 提供了一组计时, 可以用于计算前端页面性能数据。

[w3c 标准](https://www.w3.org/TR/navigation-timing/) 定义的接口

```js
interface PerformanceTiming {
  readonly attribute unsigned long long navigationStart;
  readonly attribute unsigned long long unloadEventStart;
  readonly attribute unsigned long long unloadEventEnd;
  readonly attribute unsigned long long redirectStart;
  readonly attribute unsigned long long redirectEnd;
  readonly attribute unsigned long long fetchStart;
  readonly attribute unsigned long long domainLookupStart;
  readonly attribute unsigned long long domainLookupEnd;
  readonly attribute unsigned long long connectStart;
  readonly attribute unsigned long long connectEnd;
  readonly attribute unsigned long long secureConnectionStart;
  readonly attribute unsigned long long requestStart;
  readonly attribute unsigned long long responseStart;
  readonly attribute unsigned long long responseEnd;
  readonly attribute unsigned long long domLoading;
  readonly attribute unsigned long long domInteractive;
  readonly attribute unsigned long long domContentLoadedEventStart;
  readonly attribute unsigned long long domContentLoadedEventEnd;
  readonly attribute unsigned long long domComplete;
  readonly attribute unsigned long long loadEventStart;
  readonly attribute unsigned long long loadEventEnd;
};
```

同时给出了一个图

![timing.png](./timing.png)

由此可以计算出一些常用的性能指标：

```
redirectEnd - redirectStart             // 重定向耗时
domainLookupEnd - domainLookupStart     // DNS 查询耗时
connectEnd - connectStart               // TCP 连接耗时
domInteractive - domLoading             // dom 解析时间
responseStart - navigationStart         // 白屏时间
responseStart - requestStart            // request 耗时
responseEnd - responseStart             // response 耗时
```

当然这些计算方式并不完全官方可靠，可根据实际经验进行微调。


[Navigation Timing](https://www.w3.org/TR/navigation-timing/)

[Performance — 前端性能监控利器](https://www.cnblogs.com/bldxh/p/6857324.html)

[使用性能API快速分析web前端性能](https://segmentfault.com/a/1190000004010453)

[Hiper](https://github.com/pod4g/hiper/blob/90171c8b3e515c9a89f87195ed81609abd38ceeb/README.zh-CN.md)

[带你监控前端性能](https://github.com/bsxz0604/RemarkForFE/blob/master/Performance%E5%B8%A6%E4%BD%A0%E7%9B%91%E6%8E%A7%E5%89%8D%E7%AB%AF%E6%80%A7%E8%83%BD.md)