// client/pages/detail/detail.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    productDetail: {}
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getProductDetail(options.id)
  
  },
  getProductDetail(id){
    wx.showLoading({
      title: '商品数据加载中...'
    })
    // 访问数据库
    qcloud.request({
      url: config.service.productDetail + id,
      success: res => {
        console.log(res.data)
        wx.hideLoading()
        if(!res.data.code){
          this.setData({
            productDetail: res.data.data
          })
        
        }else{
          setTimeout(() => {      //两秒过后重回上一页
            wx.navigateBack()
          }, 2000)
        }
      },
      fail: err => {
        console.log(err)
      wx.hideLoading()
        setTimeout(() => {
          wx.navigateBack()
        }, 2000)
      }
    })
  },
  buy() {
    wx.showLoading({
      title: '商品购买中...',
    })
    let product = Object.assign({
      count: 1
    }, this.data.productDetail)
    console.log(product)
    qcloud.request({
      url: config.service.addOrder,
      login: true,
      method: 'POST',
      data: {
        list: [product],
        isInstantBuy: true
      },
      success: result => {
        wx.hideLoading()
      
        let data = result.data
        if (!data.code) {
          wx.showToast({
            title: '商品购买成功',
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '商品购买失败',
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '商品购买失败',
        })
      }
    })
  },
  addToTrolley() {
    console.log('add')
    wx.showLoading({
      title: '正在添加到购物车...',
    })
    qcloud.request({
      url: config.service.addTrolley,
      login: true,
      method: 'PUT',
      data: this.data.productDetail,
      success: result => {
        wx.hideLoading()
        let data = result.data
        console.log('sdesdsd')
        if (!data.code) {
          wx.showToast({
            title: '已添加到购物车',
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '添加到购物车失败',
          })
        }
      },
      fail: () => {
        console.log(666)
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '添加到购物车失败',
        })
      }
    })
  },
  onTapEntryComment(){
    console.log(11)
    let product = this.data.productDetail
    if(product.commentCount){
      wx.navigateTo({
        url: `/pages/comment/comment?id=${product.id}&price=${product.price}&name=${product.name}&image=${product.image}`
      })
    }
  }
})