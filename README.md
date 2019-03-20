# wx
微信小程序开发公用的JS库

|
|-- util.js 公用库

## web-view
- web-view传递参数的时候如果包含中文的情况下，需要进行encodeURI编码，不然会出现打开页面白屏的情况
```
wxml:
<web-view src="https://www.xxxx.com/riskapp/xys/personxys.html?proname={{proname}}&t={{ti}}"></web-view>

js:
   /**
   * 页面的初始数据
   */
  data: {
	  proname:encodeURI("我是中文参数"),
	  ti:new Date().getTime() //时间戳 防止页面缓存
  }

```

## bindtap 和catchtap
- bind事件绑定不会阻止冒泡事件向上冒泡，catch事件绑定可以阻止冒泡事件向上冒泡
