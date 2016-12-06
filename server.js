// server.js
// set up ========================
var express = require('express');
var app = express();
var mysql = require('mysql');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var async = require('async');
var Sequelize = require('sequelize');
var Enumerable = require('linq');


// configuration =================
app.set('port', (process.env.PORT || 8082));
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
var connStr = 'mysql://ch4pj48srg20sqnt:mi0nrgdxn1qpv4w9@tkck4yllxdrw0bhi.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/ryvfnuo9gyupf0g7';
var connection = mysql.createConnection(connStr);


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


// routes ==================================================
app.post('/api/bbb', function (req, res) {

    
});

app.get('/api/aaa', function (req, res) {

   
});



// application -------------------------------------------------------------
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});


// listen (start app with node server.js) ======================================
app.listen(app.get('port'), function() {

    console.log('cf web api na porta', app.get('port'));
});
