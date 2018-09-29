// pages/home/home.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')
Page({
  data:{
    productList: [], // 商品列表
  },
  onLoad(){
    this.getProductList()
  },
  getProductList(){
    wx.showLoading({
      title: '商品数据加载...'
    })
    qcloud.request({
      url: config.service.productList,
      success: res => {
        wx.hideLoading()
        if(!res.data.code){
          this.setData({
            productList: res.data.data
          })
        }else{
          wx.showToast({
            icon: 'none',
            title: '商品数据获取失败...'
          })
        }
      },
      fail: err => {
        console.log(err)
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '商品数据获取失败...'
        })
      }
    })
  },
  addToTrolley(event){
    let id = event.currentTarget.dataset.id
    let productList = this.data.productList
    let len = productList.length
    let product
    for(let i = 0; i < len; i++){
      if(productList[i].id === id){
          product = productList[i]
          break
      }
    }
    if (product) {
      qcloud.request({
        url: config.service.addTrolley,
        login: true,
        method: 'PUT',
        data: product,
        success: result => {
          let data = result.data
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
          wx.showToast({
            icon: 'none',
            title: '添加到购物车失败',
          })
        }
      })
    }
  }
})