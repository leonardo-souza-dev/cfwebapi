// server.js
// set up ========================
var express = require('express');
var multer  =   require('multer');
var app = express();
var mysql = require('mysql');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var async = require('async');
var Sequelize = require('sequelize');
var Enumerable = require('linq');
const fs = require('fs');


// configuration =================
app.set('port', (process.env.PORT || 8084));
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
app.use(bodyParser({uploadDir:'/path/to/temporary/directory/to/store/uploaded/files'}));
var connStr = 'mysql://ch4pj48srg20sqnt:mi0nrgdxn1qpv4w9@tkck4yllxdrw0bhi.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/ryvfnuo9gyupf0g7';
var connection = mysql.createConnection(connStr);
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    console.log(file);
    callback(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length-1]);
  }
});


//ORM
var sequelize = new Sequelize(connStr,   { 
    define: { 
        timestamps: false, 
        freezeTableName: true
        //,timezone: '-03:00'  
    }
});

//utils
function pretty(j){

    var identacao = ',\r\n    "';

    var j = j.replace(',"', identacao).replace(',"', identacao).replace(',"', identacao)
    .replace(',"', identacao).replace(',"', identacao).replace(',"', identacao).replace(',"', identacao)
    .replace(',"', identacao).replace(',"', identacao).replace(',"', identacao).replace(',"', identacao)
    .replace(',"', identacao).replace(',"', identacao).replace(',"', identacao).replace(',"', identacao);

    return j;
}

var Usuario = sequelize.define('usuario', {
        usuarioId: { 
            type: Sequelize.INTEGER, 
            field: 'usuarioId',
            allowNull: false, 
            primaryKey: true, 
            autoIncrement: true 
        },
        avatarUrl: { 
            type: Sequelize.STRING, 
            field: 'legenda',
            allowNull: false  
        }
    },{ tableName: 'Usuario' }
);

var Post = sequelize.define('post', {
        postId: { 
            type: Sequelize.INTEGER, 
            field: 'postId', 
            allowNull: false, 
            primaryKey: true, 
            autoIncrement: true 
        },
        legenda: { 
            type: Sequelize.STRING, 
            field: 'legenda',
            allowNull: false  
        }
    },{ tableName: 'Post' }
);
;

//https://codeforgeek.com/2014/11/file-uploads-using-node-js/
var upload = multer({ storage : storage }).single('foto_de_catioro');
app.post('/api/uploadfoto',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            console.log(err);
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

// routes ==================================================
app.post('/api/salvarpost', function (req, res) {

    console.log('----------');
    console.log(req.body);
    console.log('**********');
});

// listen (start app with node server.js) ======================================
app.listen(app.get('port'), function() {

    console.log('cf web api na porta', app.get('port'));
});
