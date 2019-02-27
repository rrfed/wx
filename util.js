module.exports = {
    _BASE_HTTP: "https://www.XXX.com", //基础http地址   
    _HEADER: "",
    //常用验证方法
    Tools: {
        /**
         * 手机号码格式是否正确
         * @param mobile:string 手机号码 11位
         * @return true/false
         */
        isMobile: function(mobile) {
            if (mobile && mobile.length != 11) return false;
            var reg = /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|17[0-9]{9}$|18[0-9]{9}$/;
            if (mobile == '' || !reg.test(mobile)) {
                return false;
            }
            return true;
        },
        /**
         * 身份证号码格式是否正确
         * @param cardNo:string 身份证号码
         * @return true/false
         */
        isIdCardNo: function(cardNo) {
            if (cardNo == '' || !/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/i.test(cardNo)) {
                return false;
            }
            return true;
        },

        /**
         * 公用处理数据---格式化金额  保留2位小数 千分位逗号
         * @param {type} number
         * @param {type} decimals
         * @param {type} thousands_sep
         * @param {type} dec_point
         * @param {type} roundtag  舍入参数，默认 "round" 四舍五入 ,"ceil" 向上取,"floor"向下取,
         * @returns {unresolved}
         */
        priceFormat: function(number, decimals, thousands_sep, dec_point, roundtag) {
            /*
             * 参数说明：
             * number：要格式化的数字
             * decimals：保留几位小数
             * dec_point：小数点符号
             * thousands_sep：千分位符号
             * roundtag:舍入参数，默认 "round" 四舍五入 ,"ceil" 向上取,"floor"向下取,
             * */
            //if(!number) return 0.00*1;
            number = (number + '').replace(/[^0-9+-Ee.]/g, '');
            roundtag = roundtag || "round"; //"ceil","floor","round"
            var n = !isFinite(+number) ? 0 : +number,
                prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
                sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
                dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
                s = '',
                toFixedFix = function(n, prec) {
                    var s = n.toString();
                    var sArr = s.split(".");
                    var m = 0;
                    try {
                        m += sArr[1].length;
                    } catch (e) {}

                    if (prec > m) {
                        return s;
                        /*'' + Number(s.replace(".", "")) / Math.pow(10, m);*/
                    } else {
                        sArr[1] = Math[roundtag](Number(sArr[1]) / Math.pow(10, m - prec));
                        while (sArr[1].toString().length < prec) {
                            sArr[1] = '0' + sArr[1];
                        }
                        return sArr.join('.');
                    }
                };
            s = (prec ? toFixedFix(n, prec) : '' + Math.floor(n)).split('.');
            var re = /(-?\d+)(\d{3})/;
            while (re.test(s[0])) {
                s[0] = s[0].replace(re, "$1" + sep + "$2");
            }

            if ((s[1] || '').length < prec) {
                s[1] = s[1] || '';
                s[1] += new Array(prec - s[1].length + 1).join('0');
            }
            return s.join(dec);
        },
    },
    /**
     * 提示信息
     */
    Messager: {
        /**
         * 成功的提示
         */
        success: function(_msg) {
            wx.showToast({
                title: _msg,
                icon: "success"
            });
        },
        /**
         * 错误的提示
         */
        error: function(_msg) {
            wx.showToast({
                title: _msg,
                icon: "none"
            });
        },
        /**
         * 加载中
         */
        loading: function() {
            wx.showLoading({
                title: "loading...",
                icon: "loding",
                mask: true
            });
        },
        /**
         * 去掉加载中的提示
         */
        hideLoading: function() {
            wx.hideLoading();
        }
    },
    /**
     * 获取网络数据
     * @param _config:object {url:"",type:"get/post",data:{},callback:function(){}}
     */
    loadJson(_config) {
        var _inThis = this;
        //加入loding

        this.Messager.loading();
    
        wx.getStorage({
            key: 'sid',
            success: function(sid) {               
                wx.request({
                    url: _inThis._BASE_HTTP + _config.url,
                    data: _config.data,
                    header: {
                        Authorization: sid.data,
                        'content-type': 'application/json' // 默认值
                    },
                    method: _config.type,
                    success: function(response) {
                        _inThis.Messager.hideLoading();
                        if (response.data.code * 1 == 100001){
                            _inThis.Messager.error("用户未登录");
                            setTimeout(function(){
                                wx.navigateTo({
                                    url: "/pages/login/login"
                                });
                            },1000)
                        }else{
                            if (typeof _config.callback == "function") {
                                _config.callback(response.data);
                            }
                        }
                        
                    },
                    fail: function() {
                        _inThis.Messager.hideLoading();
                        wx.showToast({
                            title: "接口请求失败",
                            icon: "none"
                        });
                    }
                });
            },
            fail:function(res){
                console.log(res);
                // _inThis.getSid()
            }
        })
    },
    /**
    * 文件上传
    */
    uploadFile(_config) {
        var _url = _config.url;
        var _filePath = _config.filePath;
        var _inThis = this;
        this.Messager.loading();
        wx.getStorage({
            key: 'sid',
            success: function(res) {
                wx.uploadFile({
                    url: _inThis._BASE_HTTP + _url, //仅为示例，非真实的接口地址
                    filePath: _filePath,
                    header: {
                        Authorization: res.data
                    },
                    name: 'file',
                    success: function(response) {
                        _inThis.Messager.hideLoading();
                        if (typeof _config.callback == "function") {

                            _config.callback(JSON.parse(response.data));
                        }
                    },
                    fail: function() {
                        _inThis.Messager.hideLoading();
                        wx.showToast({
                            title: "接口请求失败",
                            icon: "none"
                        });
                    }
                })
            },
        })
    },

    getSid: function () {
        var _inThis = this;
        wx.request({
            url: _inThis._BASE_HTTP + "/api/appns/open/trace",
            method: "GET",
            success: function (res) {
                var _res = res.data;
                if (_res.code * 1 == 1) {
                    _inThis.Messager.hideLoading();
                    wx.setStorage({
                        key: 'sid',
                        data: _res.data,
                    })
                }
            },
            fail: function () {
                wx.showToast({
                    title: "接口请求失败",
                    icon: "none"
                });
            }
        })
    },
    //获取图片
    getImg(_config) {
        var _inThis = this;

        this.Messager.loading();


        wx.getStorage({
            key: 'sid',
            success: function(sid) {
                wx.request({
                    url: _inThis._BASE_HTTP + "/api/file/image/" + _config.fid,
                    method: 'GET',
                    header: {
                        Authorization: sid.data
                    },
                    responseType: 'arraybuffer',
                    success: res => {
                        _inThis.Messager.hideLoading();
                        let base64 = wx.arrayBufferToBase64(res.data);
                        base64 = 'data:image/jpg;base64,' + base64;
                        if (typeof _config.callback == "function") {
                            _config.callback(base64);
                        }
                    }

                });
            },
        })
    },
    //获取token 
    getToken: function() {
        wx.request({
            url: _inThis._BASE_HTTP + "/api/wns/yunManage/getYunToken",
            type: "GET",
            success: function (_accessToken) {
                if (_accessToken.statusCode * 1 == 200) {
                    var accessToken = _accessToken.data;
                    if (accessToken.code * 1 == 1) {
                        wx.setStorage({
                            key: 'accessToken',
                            data: accessToken.data.data.accessToken,
                        })
                        var timestamp = Date.parse(new Date());
                        timestamp = timestamp / 1000;
                        wx.setStorage({
                            key: 'accessTokenTime',
                            data: timestamp,
                        })
                    }
                }
            }

        })
    },
    /**
     * OCR识别
     * ocr{
     *  imgUrl:"",
     * ocrUrl:"",
     * ocrType:"",
     * accessToken:"",
     * type:""
     * }
     * 图片url：imgUrl
     * 云的路径：ocrUrl
     * 识别类型：ocrType
     * 权限：accessToken
     * type:请求方式
     */

    ocrDistinguish(_config) {
        this.Messager.loading();

        ///api/file/upload
        var _imgUrl = _config.imgUrl;
        var _ocrUrl = _config.ocrUrl;
        var _ocrType = _config.ocrType ? _config.ocrType : "";
        var _accessToken = _config.accessToken;
        var _type = _config.type;
        var _callback = _config.callback;

        var imgSuffixList = _imgUrl.split(".");
        var imgSuffix = imgSuffixList[imgSuffixList.length - 1];

        var _inThis = this;

        var _data = {

        }

        wx.getStorage({
            key: 'sid',
            success: function(sid) {      
                wx.request({
                    url: _inThis._BASE_HTTP + "/api/wns/yunManage/getYunToken",
                    type: "GET",
                    success: function(_accessToken) {
                        if (_accessToken.statusCode * 1 == 200) {
                            var accessToken = _accessToken.data;
                            if (accessToken.code * 1 == 1) {
                                wx.setStorage({
                                    key: 'accessToken',
                                    data: accessToken.data.data.accessToken,
                                })
                                

                                _inThis.uploadFile({
                                    url: '/api/file/upload',
                                    filePath: _imgUrl,
                                    callback: function(res1) {


                                        if (res1.code * 1 == 1) {
                                            _inThis.Messager.loading();
                                            wx.request({
                                                url: _inThis._BASE_HTTP + "/api/file/image/" + res1.data,
                                                method: 'GET',
                                                responseType: 'arraybuffer',
                                                success: res => {
                                                    let base64 = wx.arrayBufferToBase64(res.data);
                                                    var _data = {}
                                                    if (_ocrType) {
                                                        _data = {
                                                            imgBase64: base64,
                                                            imgType: imgSuffix,
                                                            idCardSide: _ocrType
                                                        }
                                                    } else {
                                                        _data = {
                                                            imgBase64: base64,
                                                            imgType: imgSuffix
                                                        }
                                                    }
                                                    wx.request({
                                                        url: _ocrUrl,
                                                        method: _type,
                                                        header: {
                                                            "access-token": accessToken.data.data.accessToken
                                                        },
                                                        data: _data,
                                                        success: json => {
                                                            if (json.statusCode * 1 == 200) {
                                                                _inThis.Messager.hideLoading();
                                                                var _res = json.data
                                                                if (_res.r * 1 == 1) {
                                                                    json.data.fid = res1.data;

                                                                    if (typeof _callback == "function") {
                                                                        _callback(json.data);
                                                                    }
                                                                } else {
                                                                    wx.showToast({
                                                                        title: json.msg
                                                                    })
                                                                }
                                                            }
                                                        }
                                                    })
                                                }

                                            });
                                        }

                                    }
                                })
                            }
                        }

                    },
                    fail: function() {
                        _inThis.Messager.hideLoading();
                        wx.showToast({
                            title: "接口请求失败",
                            icon: "none"
                        });
                    }
                })
            }
        })
    }
}
