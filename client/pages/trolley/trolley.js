const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')
const app = getApp()

Page({
  /**
  * 页面的初始数据
  */
  data: {

    userInfo: null,
    locationAuthType: app.data.locationnavithType,
    trolleyList: [], // 购物车商品列表
    trolleyCheckMap: [], // 购物车中选中的id哈希表
    trolleyAccount: 0, // 购物车结算总价
    isTrolleyEdit: false, // 购物车是否处于编辑状态
    isTrolleyTotalCheck: false, // 购物车中商品是否全选
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {

  },
  onTapLogin: function () {
    app.login({
      success: ({ userInfo }) => {
        this.setData({
          userInfo,
          locationAuthType: app.data.locationAuthType
        })
        this.getTrolley()
      },
      error: () => {
        this.setData({
          locationAuthType: app.data.locationAuthType
        })
      }
    })
  },
  getTrolley() {
    wx.showLoading({
      title: '刷新购物车数据...',
    })
    qcloud.request({
      url: config.service.trolleyList,
      login: true,
      success: result => {
        wx.hideLoading()
        let data = result.data
        if (!data.code) {
          this.setData({
            trolleyList: data.data
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '数据刷新失败',
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '数据刷新失败',
        })
      }
    })
  },
  onShow: function () {
    
    // 同步授权状态
    this.setData({
      locationAuthType: app.data.locationAuthType
    })
    console.log(this.data.locationAuthType)
    app.checkSession({
      success: ({ userInfo }) => {
        this.setData({
          userInfo
        })
        this.getTrolley()
      }
    })
  },
  // 单选
  isSingleCheck(event){
    let id = event.currentTarget.dataset.id
    let trolleyCheckMap = this.data.trolleyCheckMap
    let trolleyList = this.data.trolleyList
    console.log(trolleyList)
    let checkNum = 0
    let trolleyListLength = trolleyList.length
    
    console.log(trolleyListLength)
    let isTrolleyTotalCheck
    let trolleyAccount
    trolleyCheckMap[id] = !trolleyCheckMap[id]

    trolleyList.forEach(trolley => {
      checkNum += trolleyCheckMap[trolley.id]? 1: 0
    })

    isTrolleyTotalCheck = (checkNum === trolleyListLength) ? true: false
    trolleyAccount = this.trolleyAccount(trolleyList,trolleyCheckMap)

    this.setData({
      trolleyCheckMap,
      isTrolleyTotalCheck,
      trolleyAccount
    })
  },
  // 判断是否全选
  isTotalCheck(){
    
      let isTrolleyTotalCheck = !this.data.isTrolleyTotalCheck
      let trolleyList = this.data.trolleyList
      let trolleyCheckMap = this.data.trolleyCheckMap
      let trolleyAccount
      trolleyList.forEach(product => {
        trolleyCheckMap[product.id] = isTrolleyTotalCheck
      })
    trolleyAccount = this.trolleyAccount(trolleyList, trolleyCheckMap)

      this.setData({
        trolleyCheckMap,
        isTrolleyTotalCheck
      })
  },
  // 计算总价
  trolleyAccount(trolleyList,trolleyCheckMap){
    let trolleyAccount = 0
    trolleyList.forEach(product => {
        if(trolleyCheckMap[product.id]){
          trolleyAccount += product.price * product.count
        }
    })
    console.log(trolleyAccount)
    return trolleyAccount

  },
  isTrolleyEdit(){
    let isTrolleyEdit = this.data.isTrolleyEdit
   
    if(isTrolleyEdit){
      //点击完成时候，更新到服务器中
      this.updateTrolley()
    }else{
      this.setData({
        isTrolleyEdit: !isTrolleyEdit
      })
    }  
  },
  alterTrolleyNum(event){
    let dataset = event.currentTarget.dataset
    let type = dataset.type  //用于判断增加还是减少
    let id = dataset.id       //用于区别是哪一个商品
    let trolleyList = this.data.trolleyList
    let trolleyCheckMap = this.data.trolleyCheckMap
    let len = trolleyList.length
    let product,trolleyAccount
    for(var index = 0;index < len;index++){
      if(trolleyList[index].id === id){
          product = trolleyList[index]
          break
      }
    }

    if(product){
      if(type === "add"){
        product.count++
      }else{
        if(product.count <= 1){
          trolleyList.splice(index,1)
          delete trolleyCheckMap[index]
        }else{
          product.count--
        }
      }
    }

    trolleyAccount = this.trolleyAccount(trolleyList,trolleyCheckMap)

    if(!trolleyList.length){
      //当购物车商品数量为零时，自动同步到服务器中
      this.updateTrolley()
    }

    this.setData({
      trolleyList,
      trolleyCheckMap,
      trolleyAccount
    })
  },
  updateTrolley(){
    wx.showLoading({
      title: '商品数据更新中...'
    })
    qcloud.request({
      url: config.service.updateTrolley,
      login: true,
      method: 'post',
      success: res => {
        wx.hideLoading()
        let data = res.data
        if(!data.code){
          wx.showToast({
            title: '商品数据更新成功!'
          })
          this.setData({
            isTrolleyEdit: false
          })
        }else{
          console.log(dsadasdasd)
          wx.showToast({
            icon: 'none',
            title: '商品数据更新失败'
          })
        }
      },
      fail: (error) => {
        
        console.log(error)
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '商品数据更新失败'
        })
      }
    })
  },
  //结算功能
  onTapPay(){
    if(!this.data.trolleyAccount)return
    let trolleyList = this.data.trolleyList
    let trolleyCheckMap = this.data.trolleyCheckMap
    let needToPayTrolley = trolleyList.filter(product => {
      return !!trolleyCheckMap[product.id]
    })
    
    console.log(needToPayTrolley)
    wx.showLoading({
      title: '结算中...'
    })
    qcloud.request({
      url: config.service.addOrder,
      login: true,
      method: 'post',
      data: {
        list: needToPayTrolley
      },
      success: res => {
        wx.hideLoading()
        let data = res.data
        if(!data.code){
          wx.showToast({
            title: '结算成功...'
          })
          this.getTrolley()
        }else{
          wx.showToast({
            icon: none,
            title: '结算失败...'
          })
        }
      },
      fail: error => {
        wx.hideLoading()
        wx.showToast({
          icon: none,
          title: "结算失败..."
        })
      }
    })
  }
})