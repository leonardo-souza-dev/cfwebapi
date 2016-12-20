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
var url = require('url');
var nodemailer = require('nodemailer');

// configuration =================
app.set('port', (process.env.PORT || 8084));
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
app.use(bodyParser({ uploadDir: '/path/to/temporary/directory/to/store/uploaded/files' }));
//var connStr = 'mysql://ch4pj48srg20sqnt:mi0nrgdxn1qpv4w9@tkck4yllxdrw0bhi.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/ryvfnuo9gyupf0g7';
var connStr = process.env.CF_MYSQL_CONNSTR;
var connection = mysql.createConnection(connStr);

var mailPwd = process.env.CF_MAIL_PWD;
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://catiorofofo.app%40gmail.com:' + mailPwd + '@smtp.gmail.com');

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"Catioro Fofo" <catiorofofo.app@gmail.com>', // sender address
    to: 'leonardotreze@gmail.com', // list of receivers separados por virgula
    subject: 'sua senha no catioro fofo', // Subject line
    text: 'oi, sua senha no catioro fofo é ', // plaintext body
    html: '<b>oi, sua senha no catioro fofo é </b>' // html body
};


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
        field: 'UsuarioId',
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    avatar: {
        type: Sequelize.STRING,
        field: 'Avatar',
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        field: 'Email',
        allowNull: false
    },
    senha: {
        type: Sequelize.STRING,
        field: 'Senha',
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
        var usuarioId = file.originalname.split('.')[0];
        console.log('usuarioId');console.log(usuarioId);
        var parteB = file.originalname.split('.')[file.originalname.split('.').length - 1];
        console.log('parteB');console.log(parteB);
        var nomeArquivo = file.fieldname + '_' + usuarioId + '_' + Date.now() + '.' + parteB;
        console.log('nomeArquivo: ' + nomeArquivo);
        callback(null, nomeArquivo);
    }
});
var upload = multer({ storage: storage }).single('cf');
app.post('/api/uploadfoto', function (req, res) {
	
	console.log('*** uploadfoto ***');
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

        //var resposta = { sucesso: true, mensagem: 'post salvo ok', postId: post.postId };

        res.json({ postId: post.postId});
    });
});

app.post('/api/downloadfoto', function (req, res) {

    console.log('req.body');
    console.log(req.body);
    console.log('');
    
    var file = __dirname + '/uploads/' + req.body.nomeArquivo;
    res.download(file); // Set disposition and send it.
});

app.get('/api/foto', function (req, res) {

    var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var na = req.query.na;

    console.log('na');
    console.log(na);
    console.log('');
    
    var file = __dirname + '/uploads/' + na;
    res.download(file); // Set disposition and send it.
});

app.post('/api/obterposts', function (req, res) {

    console.log('*** OBTER POSTS ***');
    console.log('req.body');
    console.log(req.body);
    console.log('');

    Post
        .findAll({ where: { usuarioId: req.body.usuarioId } })
        .then(function (posts) {

            console.log('posts');
            console.log(JSON.stringify(posts));
            console.log('');

            //var resposta = { sucesso: true, mensagem: 'obter posts ok', posts: posts };

            res.json(posts);
        });
});

app.post('/api/login', function (req, res) {

    Usuario
        .findAll({ where: { senha: req.body.senha } })
        .then(function (usuarios) {

            console.log('usuarios[0]');
            console.log(JSON.stringify(usuarios[0]));
            console.log('');

            res.json(usuarios[0]);
        });
});

app.post('/api/cadastro', function (req, res) {

	console.log('req.body');
	console.log(req.body);
	console.log('');

	var pEmail = req.body.email;
	var pSenha = req.body.senha;

	Usuario
		.findOne({ where: {email: pEmail }})
		.then(function(user) {

			if (user == null) {
				console.log('1');

				Usuario
					.create({ email: pEmail, senha: pSenha })
					.then(function(user2) {
					
						console.log('2');
						console.log('usuario nao encontrado com o email passado, mas foi criado um');

			    		res.json({ sucesso: true, mensagem: "User created!", usuario: user2 });
		    		});
			} else {
				console.log('3');
				res.json({ sucesso: true, mensagem: 'usuario ja existe', usuario: user });
			}
	});
});

app.post('/api/esquecisenha', function (req, res) {

	var emailDigitado = req.body.email;

    Usuario
        .findAll({ where: { email: emailDigitado } })
        .then(function (usuarios) {

        	if (usuarios.length == 1){

	            console.log('usuarios[0]');
	            console.log(JSON.stringify(usuarios[0]));
	            console.log('');

	            // send mail with defined transport object

	            mailOptions.to = emailDigitado;
	            mailOptions.html = mailOptions.html + usuarios[0].senha;

				transporter.sendMail(mailOptions, function(error, info){
    				if(error){
	            		res.json({ mensagem: "error", sucesso: false});
        				return console.log(error);
    				}
    				console.log('Message sent: ' + info.response);
	            res.json({ mensagem: "email enviado", sucesso: true});
				});

        	} else {
        		res.json({ mensagem: "nao foi encontrado usuario com esse email", sucesso: false });
			}
        });
});


app.get('/fetch', function (req, res) {
 
    res.status(200).send('ok');
});

// listen (start app with node server.js) ======================================
app.listen(app.get('port'), function () {

    console.log('cf web api na porta', app.get('port'));
});
