var app = getApp();
Page({
  data: {
    src: "",
    fengmian: "",
    videoSrc: "",
    who: "",
    openid: "",
    token: "",
    windowWidth: 0,
    trackshow: "进行人脸检测",
    canvasshow: true,
    access_token: ''
  },

  onLoad() {
    var that = this
    wx.showLoading({
      title: '努力加载中',
      mask: true
    })
    //wx.getSystemInfoSync获取系统信息，然后获取屏幕宽度
    var sysInfo = wx.getSystemInfoSync()
    that.setData({
      windowWidth: sysInfo.windowWidth,
    })
    // 创建 系统相机的 camera 上下文 CameraContext 对象。而上下文，主要是关键字this的值
    that.ctx = wx.createCameraContext()
    console.log("onLoad"),
    
    // that.setData({
    //   openid: app.globalData.openid,
    //   token: app.globalData.token
    // });
    
    // 每次更新access_token
    wx.request({
      url: "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=02DD6ojdFcPR2we6RzudsEwI&client_secret=2GH00g1qxTonrdc57FzRnZs1GUVn8b3K&",
      method: 'POST',
      dataType: "json",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  
        console.log("access_token是" + res.data.access_token);     
        that.setData({
          access_token: res.data.access_token
        });
      }
    })

    wx.hideLoading()
  },

  onReady: function () {
    // 使用 wx.createContext 获取绘图上下文 context
    // var context = wx.createCanvasContext('canvas')
    // context.setStrokeStyle("#00ff00")
    // context.setLineWidth(2)
    // //创建一个矩形路径
    // // context.rect(0, 0, 150, 150)
    // context.stroke()
    // context.draw()
  },

  //是否开启进行人脸检测
  track(e) {
    var that = this
    if (e.target.dataset.trackshow == "进行人脸检测") {
      that.setData({
        trackshow: "停止人脸检测",
        canvasshow: true
      })
      that.takePhoto()
      that.interval = setInterval(this.takePhoto, 500)
    } else {
      clearInterval(that.interval)
      that.setData({
        trackshow: "进行人脸检测",
        canvasshow: false
      })
    }
  },
  //进行人脸检测
  takePhoto() {
    console.log("takePhoto")
    var that = this
    var takephonewidth
    var takephoneheight
    that.ctx.takePhoto({
      quality: 'low',
      success: (res) => {
        // console.log(res.tempImagePath),
        // 获取图片真实宽高
        wx.getImageInfo({
          src: res.tempImagePath,
          success: function (res) {
            takephonewidth = res.width,
            takephoneheight = res.height
          }
        })
        // console.log(takephonewidth, takephoneheight)
        //获取全局唯一的文件管理器
        wx.getFileSystemManager().readFile({
          filePath: res.tempImagePath, //选择图片返回的相对路径
          encoding: 'base64', //编码格式
          success: res => { //成功的回调
            // console.log('data:image/png;base64,' + res.data),
            wx.request({
              url: "https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=" + that.data.access_token,     
              data: {
                image: res.data,
                image_type: "BASE64",
                max_face_num: 10
              },
              method: 'POST',
              dataType: "json",            
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },              
              success: function (res) {
                if (res.data.error_code === 0) {
                  console.log("检测到人脸");
                  var context = wx.createCanvasContext('canvas')
                  context.setStrokeStyle("#00ff00")
                  context.setLineWidth(2)
                  //创建一个矩形路径
                  for (let j = 0; j < res.data.result.face_num; j++) {
                    var cavansl = res.data.result.face_list[j].location.left / takephonewidth * that.data.windowWidth
                    var cavanst = res.data.result.face_list[j].location.top / takephoneheight * that.data.windowWidth
                    var cavansw = res.data.result.face_list[j].location.width / takephonewidth * that.data.windowWidth
                    var cavansh = res.data.result.face_list[j].location.height / takephoneheight * that.data.windowWidth                   
                    context.rect(cavansl, cavanst, cavansw, cavansh)
                  }                  
                  context.stroke()
                  context.draw()                
                } else {
                  // console.log("未检测到人脸");  
                  //把cavans画框清除 
                  var context = wx.createCanvasContext('canvas')
                  context.setStrokeStyle("#00ff00")
                  context.setLineWidth(2)
                  //创建一个矩形路径
                  context.rect(0, 0, 0, 0)
                  context.stroke()
                  context.draw()
                }
              },
            })

          }
        })
      }
    })
  },
  //M:N人脸识别
  search() {
    var that = this
    that.setData({
      who: ""
    })
    var takephonewidth
    var takephoneheight
    //拍摄照片
    that.ctx.takePhoto({
      quality: 'heigh',
      success: (res) => {
        // console.log(res.tempImagePath),
        // 获取图片真实宽高
        wx.getImageInfo({
          src: res.tempImagePath,
          success: function (res) {
              takephonewidth = res.width,
              takephoneheight = res.height
          }
        })

        that.setData({
          src: res.tempImagePath
        }),
          wx.getFileSystemManager().readFile({
            filePath: that.data.src, //选择图片返回的相对路径
            encoding: 'base64', //编码格式
            success: res => {
              wx.request({
                url: "https://aip.baidubce.com/rest/2.0/face/v3/multi-search?access_token=" + that.data.access_token,
                data: {
                  image: res.data,
                  image_type: "BASE64",
                  group_id_list: "xcx_face_1"                 
                },
                method: 'POST',
                dataType: "json",
                header: {
                  'content-type': 'application/json'
                },
                success: function (res) {
                  console.log(res.data);                      
                      if (res.data.error_code === 0) {
                        console.log("识别成功"); 
                        var context = wx.createCanvasContext('canvasresult')                          
                        context.setStrokeStyle("#00ff00")
                        context.setLineWidth(3)
                        context.setFillStyle('#31859c')
                        //创建一个矩形路径
                        for (let j = 0; j < res.data.result.face_num; j++) {
                          var cavansl = res.data.result.face_list[j].location.left / takephonewidth * that.data.windowWidth / 2
                          var cavanst = res.data.result.face_list[j].location.top / takephoneheight * that.data.windowWidth / 2
                          var cavansw = res.data.result.face_list[j].location.width / takephonewidth * that.data.windowWidth / 2
                          var cavansh = res.data.result.face_list[j].location.height / takephoneheight * that.data.windowWidth / 2
                          var cavanstext = res.data.result.face_list[j].user_list.length > 0 ? res.data.result.face_list[j].user_list[0].user_id + " " + res.data.result.face_list[j].user_list[0].score.toFixed(0) + "%" : "Unknow"
                          context.setFontSize(14)
                          context.fillText(cavanstext, cavansl, cavanst - 2)
                          context.rect(cavansl, cavanst, cavansw, cavansh)
                        }
                        context.stroke()
                        context.draw()    
                  } else {
                      console.log("识别失败，未在人脸库中识别到该人脸");
                      that.setData({
                        who: res.data.error_msg
                      })
                      var context = wx.createCanvasContext('canvasresult') 
                      context.setStrokeStyle("#00ff00")                   
                      context.setLineWidth(2)
                      context.stroke()
                      context.draw()
                  }
                },
              })
            }
          })
      }
    })
  }

})
