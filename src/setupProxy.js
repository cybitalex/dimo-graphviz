const proxy = require('http-proxy-middleware');
module.exports = function(app) {
    app.use(proxy('/default/graphvizLambdaS3', 
        { target: 'https://kipbd0b0l4.execute-api.us-east-1.amazonaws.com',changeOrigin:true }
    ));
 	app.use(proxy('/graphviz-states/*', 
        { target: 'https://dimo-graphviz-storage.s3.amazonaws.com',changeOrigin:true }
    ));
       
}