'use strict';
const fs = require('fs');
const mime = require('mime');

module.exports = (config) => {
    let staticDir = null;
    if (typeof config === 'string') {
        staticDir = config;
    }

    return async (ctx, next) => {
        let statInfo = false;
        let filePath = staticDir + decodeURI(ctx.path);
        try {
            statInfo = fs.statSync(filePath);
        } catch (err) {}
        if (statInfo && statInfo.isFile()) {
            let index = filePath.lastIndexOf(".");
            let ext = filePath.substr(index+1);
            ctx.res.setHeader('Content-Type', (mime.getType(ext))+ ";charset=utf-8");
            let rs = fs.createReadStream(filePath);
            ctx.body = rs;
        } else {
            return next();
        }
    }
};