
import qiniu from 'qiniu'
import fs from 'fs'
import uuid from 'node-uuid'

import Download from '../../utils/download'
import Tools from '../../utils/tools'
import config from '../../config'

import { User } from '../../models'

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = config.qiniu.accessKey;
qiniu.conf.SECRET_KEY = config.qiniu.secretKey;

//要上传的空间
const bucket = config.qiniu.bucket;

//构建上传策略函数
const uptoken = (bucket, key) => {
  var putPolicy = new qiniu.rs.PutPolicy(bucket);
  return putPolicy.token();
}

let query = {}
let mutation = {}
let resolvers = {}

import To from '../../utils/to'
import CreateError from '../common/errors';

query.qiniuToken = async (root, args, context, schema) => {

  const { user, role } = context

  if (!user) {
    throw CreateError({
      message: '没有权限访问',
      data: { }
    });
  }

  const token = uptoken(bucket);

  if (!token) {
    throw CreateError({
      message: 'token 创建失败',
      data: { }
    });
  }

  return {
    token: token,
    url: config.qiniu.url
  }
}

export { query, mutation, resolvers }

/**
 * 下载互联网图片，并上传到七牛
 */
export const downloadImgAndUploadToQiniu = function (imgUrl) {
  return new Promise(async (resolve, reject)=>{

    // 图片临时储存的名称
    let temporaryName = uuid.v4();

    await Download({
      uri: imgUrl,
      dir: 'public/',
      filename: temporaryName+".jpg"
    });

    // tools.download(imgUrl, 'public/', temporaryName+".jpg", function(){
    
      let token = uptoken(bucket);
  
      //构造上传函数
      function uploadFile(uptoken, key, localFile, callback) {
        let extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, key, localFile, extra, callback);
      }
      
      //调用uploadFile上传
      uploadFile(token, '', 'public/'+temporaryName+'.jpg', function(err, ret){
        if(!err) {

          try{          // 删除文件
            fs.unlink('public/'+temporaryName+'.jpg', function(){
              resolve(config.qiniu.url + '/' + ret.key);
            });
          } catch (err) {
            console.log(err);
            // 上传失败， 处理返回代码
            reject('delet image error');
          }

        } else {
          console.log(err);
          // 上传失败， 处理返回代码
          reject('upload error');
        }
      });
  
    });

  // });
}

export const uploadImage = function(imgUrl, userId, callback) {

  Tools.download(imgUrl, 'public/', userId+".jpg", function(){
    
    var token = uptoken(bucket)

    //构造上传函数
    function uploadFile(uptoken, key, localFile, callback) {
      var extra = new qiniu.io.PutExtra();
      qiniu.io.putFile(uptoken, key, localFile, extra, callback);
    }

    //调用uploadFile上传
    uploadFile(token, '', 'public/'+userId+'.jpg', async function(err, ret){
      if(!err) {

        [ err, res ] = await To(User.update({
          query: { _id: userId },
          update: { avatar: config.qiniu.url + '/' + ret.key }
        }));

        if (err) console.log(err);
        // 删除源文件
        fs.unlink('public/'+userId+'.jpg', function(){
          callback(true)
        });

        /*
        User.update({ _id: userId }, { avatar: config.qiniu.url + '/' + ret.key + '?imageMogr2/auto-orient/thumbnail/!200' }, function(err){
          if (err) console.log(err);
          // 删除源文件
          fs.unlink('public/'+userId+'.jpg', function(){
            callback(true)
          })
        })
        */
      } else {
        // 上传失败， 处理返回代码
        callback(false)
      }
    });

  });

}