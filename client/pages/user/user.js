// pages/user/user.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')

const app = getApp()

Page({

  data: {
    locationAuthType: app.data.locationAuthType,
    userInfo: null,
    // userInfo: {
    //   nickName: "优达学城",
    //   avatarUrl: "", // 头像 URL 地址
    // }, // 虚拟数据
  },
  onLoad() {
  
  },
  onTapLogin() {
    app.login({
      success: ({ userInfo }) => {
        this.setData({
          userInfo,
          locationAuthType: app.data.lcoationAuthType
        })
      },
      error: () => {
        this.setData({
          locationAuthType: app.data.locationAuthType
        })
      }
    })
  },
  onShow() {
   console.log(app.data.locationAuthType)
   //先将locationAuthType的值同步
    this.setData({
      locationAuthType: app.data.locationAuthType
    })
    console.log(this.data.locationAuthType)
    //获取用户信息
    app.checkSession({
      success: ({userInfo}) => {
        this.setData({
          userInfo
        })
      }
    })
  }
})