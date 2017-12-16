'use strict';
module.exports = () => {


    return async (ctx, next) => {
        let reqStr = await new Promise((resolve, reject) => {
            let data = '';
            ctx.req.on('data', chunk => {
                data += chunk;
            });
            ctx.req.on('end', () => {
                resolve(data);
            })
        });
        let curTypes = ctx.req.headers['content-type'] || 'text/plain';
        var enableForm = checkEnable(curTypes, 'form');
        var enableJson = checkEnable(curTypes, 'json');
        if (ctx.method.toUpperCase() === 'options') {
            return next();
        }


        if (enableJson) {
            ctx.req.body = JSON.parse(reqStr || "null"); // TODO try
        } else if (enableForm) {
            let formArr = reqStr.split('&');
            let formObj = {};
            formArr.forEach((item) => {
                let formItem = item.split('=');
                formItem = formItem.map(_=>decodeURIComponent(_));
                formObj[formItem[0]] = formItem[1];
            });
            ctx.req.body = formObj;
        } else {
            ctx.req.body = reqStr;
        }

        return next();
    }
}
function checkEnable(types, type) {
    return types.includes(type);
}
