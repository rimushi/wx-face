//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      // url: '../logs/logs'
      url: '../video/video'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      //修改保存后，全局数据globalData未失效，
      console.log("1");
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况     
      //重新编译后，globalData全局数据失效，但此时已经取得授权；会重新加载app.js的中的onLaunch里面的方法，允许授权后的回调
      app.userInfoReadyCallback = res => {
        console.log("2");
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  //第一次加载引导用户授权的事件,因为bindgetuserinfo，所以支不支持属性配置open-type都会调用这个方法
  getUserInfo: function(e) {
    console.log("3");
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
