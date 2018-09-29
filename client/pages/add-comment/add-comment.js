const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')
Page({
  /**
  * 页面的初始数据
  */
  data: {
    product: {},
    commentValue: '',
    commentImages: []  //用于保存文件路径列表
  },
  onInput(event) {
    this.setData({
      commentValue: event.detail.value.trim()
    })
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    let product = {
      id: options.id,
      name: options.name,
      price: options.price,
      image: options.image
    }
    this.setData({
      product: product
    })
  },
    onInput(event) {
      this.setData({
        commentValue: event.detail.value.trim()
      })
    },
  
  addComment(event) {
    let content = this.data.commentValue
    if(!content)return 
    wx.showLoading({
      title: '发表评论中...'
    })
    this.uploadImage(images => {
      qcloud.request({
        url: config.service.addComment,
        login: true,
        method: 'PUT',
        data: {
          images,
          content,
          product_id: this.data.product.id
        },
        success: res => {
        
          wx.hideLoading()
          let data = res.data
         
          if(!data.code){
            wx.showToast({
              title: '发表成功'
            })
          }
        },
        fail:　() => {
          wx.hideLoading()
          wx.showToast({
            title: "发表评论失败",
            icon: 'none'
          })
        }
      })
    })
  },
  //上传图片
  uploadImage(cb){
    let commentImages = this.data.commentImages
    let images = []
 
    if(commentImages.length){
      let len = commentImages.length
      for(let i = 0; i < len; i++){
    
        wx.uploadFile({
          url: config.service.uploadUrl,
          filePath: commentImages[i],  //要上传的文件资源的路径
          name: 'file',
          success: res => {
            let data = JSON.parse(res.data)
            len--
            if(!data.code){
              images.push(data.data.imgUrl) //存放上传的文件的路径
            }
            if(len <= 0){ 
              cb && cb(images)   //最后将图片的路径同步到数据库中
            }
          },
          fail: () => {
            len--
          }
        })
      }
    }else{
      cb && cb(images)
    }
  },
  //选择图片
  chooseImage(){
    let commentImages = this.data.commentImages
    console.log(commentImages)
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album','camera'],
      success: res => {
        console.log(res.tempFilePaths)
         commentImages = commentImages.concat(res.tempFilePaths) //本地的文件路径列表
        let end = commentImages.length
        let begin = Math.max(end - 3,0)
        commentImages = commentImages.slice(begin,end)
        this.setData({
          commentImages
        })
      }
    })
  },
  previewImg(event){
    let target = event.currentTarget
    let src = target.dataset.src

    wx.previewImage({
      current: src,  //当前图片的路径
      urls: this.data.commentImages //用于切换的图片路径列表
    })
  },
  /**
  * 生命周期函数--监听页面初次渲染完成
  */
  onReady: function () {
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
  },
  /**
  * 生命周期函数--监听页面隐藏
  */
  onHide: function () {
  },
  /**
  * 生命周期函数--监听页面卸载
  */
  onUnload: function () {
  },
  /**
  * 页面相关事件处理函数--监听用户下拉动作
  */
  onPullDownRefresh: function () {
  },
  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () {
  },
  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {
  }
})