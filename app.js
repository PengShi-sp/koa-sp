// const App=require('./koa-sp/koasp.js');
// const App=require('koa');
// const Router=require('./koa-sp/sp-router');
// const Router=require('koa-router');

const App=require('./http-sp/server');
const app=new App();
const Router = require('./http-sp/sp-router');
const router = new Router();
const spstatic=require('./http-sp/sp-static');
const bodyparser=require('./http-sp/sp-body');


app.use(bodyparser());
app.use(async (ctx, next) => {
    if ('/haha' == ctx.path) {
        ctx.body = JSON.stringify({asd:'asd',yut:'uty'});
    } else {
        await next();
    }
});

app.use(async (ctx, next) => {
    if (ctx.path === '/api/fetch') {
        ctx.body = ctx.req.body;
    } else {
        return next();
    }
});
/*app.use(async (ctx, next) => {
    if (ctx.path === '/api/weatherapi') {
        ctx.body = ctx.req.body;
    } else {
        return next();
    }
});*/
// http://www.sojson.com/open/api/weather/json.shtml?city=北京
/*app.use(async (ctx, next) => {
    if ('/' == ctx.path) {
        ctx.body = JSON.stringify({asd:'asd',yut:'uty'});
    } else {
        await next();
    }
});*/

router.get('/', function (ctx, next) {
        ctx.body = 'Hello World!';
});
let routeMiddleware = router.routes();

app.use(routeMiddleware);
/*
app.use(async (ctx, next) => {
    console.log(ctx.req.method);
    if ('/haha' == ctx.path) {
        ctx.body = JSON.stringify({asd:'asd',yut:'uty'});
    } else {
        await next();
    }
});
app.use(ctx => {
    ctx.body = 'Hello Koa';
});*/
/*console.log('-------------'+router.routes())
app.use(router.routes()).use(router.allowedMethods());*/
app.use(spstatic(__dirname));
app.listen(8000,function () {
    console.log('listening on port 8000');
});