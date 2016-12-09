// server.js
// set up ========================
var express = require('express');
var multer = require('multer');
var app = express();
var mysql = require('mysql');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var async = require('async');
var Sequelize = require('sequelize');
var Enumerable = require('linq');
var fs = require('fs');


// configuration =================
app.set('port', (process.env.PORT || 8084));
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
app.use(bodyParser({ uploadDir: '/path/to/temporary/directory/to/store/uploaded/files' }));
var connStr = 'mysql://ch4pj48srg20sqnt:mi0nrgdxn1qpv4w9@tkck4yllxdrw0bhi.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/ryvfnuo9gyupf0g7';
var connection = mysql.createConnection(connStr);


//ORM
var sequelize = new Sequelize(connStr, {
    define: {
        timestamps: false,
        freezeTableName: true
        //,timezone: '-03:00'  
    }
});

//utils
function pretty(j) {

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
}, { tableName: 'Usuario' }
);

var Post = sequelize.define('post', {
    postId: {
        type: Sequelize.INTEGER,
        field: 'PostId',
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    legenda: {
        type: Sequelize.STRING,
        field: 'Legenda',
        allowNull: false
    },
    nomeArquivo: {
        type: Sequelize.STRING,
        field: 'NomeArquivo',
        allowNull: false
    },
    usuarioId: {
        type: Sequelize.INTEGER,
        field: 'UsuarioId',
        allowNull: false
    }
}, { tableName: 'Post' }
);
;

//https://codeforgeek.com/2014/11/file-uploads-using-node-js//
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        console.log(file);
        var nomeArquivo = file.fieldname + '_' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1];
        console.log('nomeArquivo: ' + nomeArquivo);
        callback(null, nomeArquivo);
    }
});
var upload = multer({ storage: storage }).single('foto_de_catioro');
app.post('/api/uploadfoto', function (req, res) {

    console.log('req.body');
    console.log(req.body);
    console.log('');

    upload(req, res, function (err, data) {
        if (err) {
            console.log(err);
            return res.end("Error uploading file.");
        }

        var resposta = { sucesso: true, mensagem: 'foto upload ok', nomeArquivo: req.file.filename };

        res.json(resposta);
    });
});

// routes ==================================================
app.post('/api/salvarpost', function (req, res) {

    Post.create({
        legenda: req.body.Legenda,
        nomeArquivo: req.body.NomeArquivo,
        usuarioId: req.body.UsuarioId
    }).then(function (post) {
        console.log('post');
        console.log(JSON.stringify(post));
        console.log('');

        var resposta = { sucesso: true, mensagem: 'post salvo ok', postId: post.postId };

        res.json(resposta);
    });
});

app.post('/api/obterposts', function (req, res) {

    //console.log('req.body');
    //console.log(req.body);
    //console.log('');

    Post
        .findAll({ where: { usuarioId: req.body.usuarioId } })
        .then(function (posts) {

            console.log(posts);

            var resposta = { sucesso: true, mensagem: 'obter posts ok', posts: posts };

            res.json(resposta);
        });
});


app.get('/fetch', function (req, res) {
    res.status(200).send('ok');
});

// listen (start app with node server.js) ======================================
app.listen(app.get('port'), function () {

    console.log('cf web api na porta', app.get('port'));
});
