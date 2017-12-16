'use strict';
const http = require('http');
const url = require('url');
const fs = require('fs');
const Stream = require('stream');

module.exports = class Application{
    constructor() {
        //子类必须在constructor方法中调用super方法，否则新建实例时会报错。这是因为子类没有自己的this对象，而是继承父类的this对象，然后对其进行加工。如果不调用super方法，子类就得不到this对象。
        // super();
        //创建一个空数组存放middleware，洋葱流程的核心
        //middleware是一个数组，元素都是generator，例如[g1, g2, g3]。compose函数将middleware数组转成形如*g1(g2(g3(noop)))的generator。这样g1、g2、g3就会以回形针的顺序来执行。
        this.middleware = [];
        //处理环境变量
        this.env = process.env.NODE_ENV || 'development';
    }

    //ES6 引入 rest 参数（形式为...变量名），用于获取函数的多余参数，这样就不需要使用arguments对象了。
    listen(...listen) {
        /*const server = http.createServer(function (req, res) {
            console.log(res.headersSent);
            res.end('world');
        });*/
        const server = http.createServer(this.init());
        return server.listen(...listen);
    }

    //把中间件参数放入 this.middleware 数组，并返回 this 以便链式调用。
    use(fn){
        if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
        //把写的中间件都放入一个数组内
        this.middleware.push(fn);
        this.context={};
        //返回 this 以便链式调用
        return this;
    }

    //启动服务后初始化一些参数
    init() {
        const fn=this.compose(this.middleware);
        const handleRequest=(req,res)=>{
            const ctx=this.createContext(req,res);
            return this.handleRequest(ctx,fn);
        };
        //返回这个方法用来接收req,res
        return handleRequest;
    }
    handleRequest(ctx, fnMiddleware) {
        const res = ctx.res;
        res.statusCode = 404;
        const handleResponse = () => this.respond(ctx);
        return fnMiddleware(ctx).then(handleResponse).catch();
    }

    compose (middleware) {
        //传入一个数组，返回一个fn接收两个参数
        return function (context, next) {
            // console.log(context.res)
            // last called middleware #
            let index = -1;
            return dispatch(0);
            function dispatch (i) {
                if (i <= index) return Promise.reject(new Error('next() called multiple times'));
                index = i;
                //如果当前数组i有就赋值，如果没有就把传进来的next赋值
                const fn = middleware[i] || next;
                //如果fn没有了就说明都执行完了，返回Promise的resolve
                if (!fn) return Promise.resolve();
                try {
                //这里执行fn并传参，fn如果是middleware[i]那么第一个参数就是封装的ctx,第二个参数就是封装的下一个middleware[i]或next
                    return Promise.resolve(fn(context, function next () {
                        return dispatch(i + 1)
                    }))
                } catch (err) {
                    return Promise.reject(err)
                }}}
    }

    createContext(req, res) {
        const context={};
        const request={};
        const response={};
        context.app = request.app = response.app = this;
        context.req = request.req = response.req = req;
        context.res = request.res = response.res = res;
        request.ctx = response.ctx = context;
        context.path=req.url;
        console.log(url.parse(req.url).pathname);
        context.method = req.method;
        return context;
    }

    respond(ctx) {
        const res = ctx.res;
        let body = ctx.body;
        const code = ctx.status;
        if (ctx.res.headersSent) {
            res.end();
        } else {
            res.statusCode = 200;
        }

        /*if ('HEAD' == ctx.method) {
            if (!res.headersSent && isJSON(body)) {
                ctx.length = Buffer.byteLength(JSON.stringify(body));
            }
            return res.end();
        }*/

        // status body
        if (null == body) {
            res.statusCode = 404;
            /*body = ctx.message || String(code);
            if (!res.headersSent) {
                ctx.type = 'text';
                ctx.length = Buffer.byteLength(body);
            }*/
            return res.end(body || 'not found');
        }

        // responses
        if (Buffer.isBuffer(body)) return res.end(body);
        if ('string' == typeof body) return res.end(body);
        if (body instanceof Stream) return body.pipe(res);

        // body: json
        body = JSON.stringify(body);
        if (!res.headersSent) {
            ctx.length = Buffer.byteLength(body);
        }
        res.end(body || 'not found');
    }

    server(){

    }
};