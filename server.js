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
var connStr = process.env.CF_MYSQL_CONNSTR;
var connection = mysql.createConnection(connStr);
var mailPwd = process.env.CF_MAIL_PWD;
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
    nomeUsuario: {
        type: Sequelize.STRING,
        field: 'NomeUsuario',
        allowNull: false
    },
    senha: {
        type: Sequelize.STRING,
        field: 'Senha',
        allowNull: false
    }}, { tableName: 'Usuario' }
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
    }}, { tableName: 'Post' }
);

var Curtida = sequelize.define('curtida',  {
    postId: {
        type: Sequelize.INTEGER,
        field: 'PostId',
        allowNull: false,
        primaryKey: true
    },
    usuarioId: {
        type: Sequelize.INTEGER,
        field: 'UsuarioId',
        allowNull: false,
        primaryKey: true
    }}, { tableName: 'Curtida' }
);

Post.hasMany(Curtida, { 
	foreignKey: 'postId',
	constraints: false
});
Curtida.belongsToMany(Post, { 
	through: 'Curtida',
	foreignKey: 'postId',
	constraints: false
});

// routes ==================================================
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        var usuarioId = file.originalname.split('.')[0];
        var parteB = file.originalname.split('.')[file.originalname.split('.').length - 1];
        var nomeArquivo = file.fieldname + '_' + usuarioId + '_' + Date.now() + '.' + parteB;
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

app.post('/api/curtir', function (req, res) {

    console.log('req.body.usuarioId');
    console.log(req.body.usuarioId);
    console.log('req.body.postId');
    console.log(req.body.postId);

    Curtida.create({
        usuarioId: req.body.usuarioId,
        postId: req.body.postId
    }).then(function (curtidaa) {
    	
        console.log('curtidaa');
        console.log(JSON.stringify(curtidaa));
        console.log('');

        var resposta = { mensagem: "SUCESSO", curtida: curtidaa };

        res.json(resposta);
    });
});

app.post('/api/descurtir', function (req, res) {

    console.log('req.body.usuarioId');
    console.log(req.body.usuarioId);
    console.log('req.body.postId');
    console.log(req.body.postId);

    Curtida.destroy({ 
    	where:{
        	usuarioId: req.body.usuarioId,
        	postId: req.body.postId}, 
        force: true 
    }).then(function(){
    	
        var resposta = { mensagem: "SUCESSO" };

        res.json(resposta);
    });
});

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

    Post
        .findAll({limit:5, include: [ { model: Curtida }] })
        .then(function (posts) {

            console.log('posts');
            console.log(JSON.stringify(posts));
            console.log('');

            //var resposta = { sucesso: true, mensagem: 'obter posts ok', posts: posts };

            res.json(posts);
        });
});

app.post('/api/obterpostsOld', function (req, res) {

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

	console.log('*** LOGIN ***');

	var emailDigitado = req.body.email;
	var senhaDigitada = req.body.senha;

    Usuario
        .findAll({ where: { email: emailDigitado, senha: senhaDigitada }})
        .then(function (usuarios) {

			console.log('** usuarios **');
			console.log(JSON.stringify(usuarios[0]));

			console.log('*** usuarios != null ***');
			console.log(usuarios != null);

			console.log('*** usuarios.length > 0 ***');
			console.log(usuarios.length > 0);

        	if (usuarios != null && usuarios.length > 0){

				console.log('*** USUARIO ENCONTRADO ***');

	            console.log('usuarios[0]');
	            console.log(JSON.stringify(usuarios[0]));
	            console.log('');

	            res.json({ mensagem: "SUCESSO", usuario: usuarios[0]});
        		
        	} else if (usuarios == null || usuarios.length == 0) {

        		console.log('*** USUARIO NAO ENCONTRADO ***');

	            res.json({ mensagem: "INEXISTENTE"});

        	}

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

app.post('/api/atualizarusuario', function (req, res) {

	console.log('req.body');
	console.log(req.body);
	console.log(''); 

	var pEmail = req.body.email;
	var pUsuarioId = req.body.usuarioId;
	var pNomeUsuario = req.body.nomeUsuario;

	if (pNomeUsuario != null) {
		Usuario
		.findOne({ where: { nomeUsuario: pNomeUsuario }})
		.then(function(user) {

			if (user == null){
				Usuario
					.findOne({ where: {email: pEmail, usuarioId: pUsuarioId }})
					.then(function(user) {
						console.log('user');console.log(JSON.stringify(user));console.log('');

						if (user != null) {
							console.log('achou');
							user
								.update(
									{ nomeUsuario: pNomeUsuario })
								.then(function(user2) {
									console.log('atualizou');

						    		res.json({ mensagem: "SUCESSO" });
					    		});
						} else {
							console.log('nao achou');

							res.json({ mensagem: 'INEXISTENTE' });
						}
				});
			} else {

				res.json({ mensagem: 'JAEXISTE' });
			}
		});
	}
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

// listen ======================================
app.listen(app.get('port'), function () {

    console.log('cf web api na porta', app.get('port'));
});
