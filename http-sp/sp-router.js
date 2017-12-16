const methods = require('methods');
//参照null的tiny-koa
const Route = class {
    constructor(path, method, route) {
        this.path = path;
        this.method = method.toUpperCase();
        console.log('==============='+this.method)
        this.route = (ctx, next) => {
            ctx.params = this.params;
            route(ctx, next);
        };
        this.params = {};
    }

    match(reqPath) {
        let paramsObj = {};

        let routePathArr = this.path.split('/').filter(_=>_!=='');
        let reqPathArr = reqPath.split('/').filter(_=>_!=='');

        if (routePathArr.length !== reqPathArr.length) {
            return false;
        }

        for (let i = 0, len = routePathArr.length; i < len; i++) {
            let route = routePathArr[i];
            let isParam = route.startsWith(':');

            if (isParam) {
                let paramKey = route.slice(1);
                paramsObj[paramKey] = reqPathArr[i];
            } else if(route !== reqPathArr[i]) {
                return false;
            }
        }
        this.params = paramsObj;

        return true;
    }
};

const Routeinit = class {
    constructor() {
        this.stack=[];
        this.methods = methods || [
            'GET',
            'POST'
        ];
        for (let m of methods) {
            Routeinit.prototype[m]= (path, route) =>{
                this.stack.push(new Route(path, m, route));
            }
        }
    }

    all(path, route) {
        this.stack.push(new Route(path, 'all', route));
    }
    getMatchRoutes(reqPath) {
        return this.stack.filter((item) => {
            return item.match(reqPath);
        });
    }

    routes() {
        return async (ctx, next) => {
            let routePath = ctx.path;
            let matchRouts = this.getMatchRoutes(routePath);
            if (matchRouts.length === 0) {
                return next();
            }

            let dispatch = (i) => {
                if (i === matchRouts.length) {
                    return next(); // to next middleware
                }
                let route = matchRouts[i].route;

                let routeWrap = () => {
                    return route(ctx, () => {
                        return dispatch(i+1);
                    });
                };

                return Promise.resolve(routeWrap());
            };

            return dispatch(0);
        }
    }

};
module.exports = Routeinit;