import axios from 'axios'
import Vue from 'vue'
import router from './router'
const http = axios.create({
    //baseURL:process.env.VUE_APP_API_URL || '/admin/api',
    baseURL:'http://localhost:3000/admin/api'
    //baseURL:'https://shawyoi.cn/admin/api'
})

http.interceptors.request.use(function(config){
    if(localStorage.token){
        config.headers.Authorization='Bearer ' +(localStorage.token || '')
    }
    return config;
}),function(error){
    return Promise.reject(error);
}

//全局错误拦截，通过在服务端增加修改stutescode并返回错误message，来弹出错误窗口
http.interceptors.response.use(res=>{
    return res
},err=>{
    if(err.response.data.message){
        Vue.prototype.$message({
            type:'error',
            message:err.response.data.message
        })
        if(err.response.status===401){
            router.push('/login')
        }
    }
    return Promise.reject(err)
})
export default http 