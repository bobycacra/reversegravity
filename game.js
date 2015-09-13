var requestAnimFrame = (function(){
	return window.requestAnimationFrame	||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame	||
		window.oRequestAnimationFrame	  ||
		window.msRequestAnimationFrame	 ||
		function(callback){
			window.setTimeout(callback, 1000 / 60);
		};
})();

var image = {
	player: new Image(),
	ground: new Image(),
	rock: new Image(),
	hp: new Image(),
	heli: new Image(),
	bullet: new Image(),
	tornado: new Image()
};

var game = {
	canvas: document.getElementById('canvas'),
	ctx: canvas.getContext('2d'),
	w: canvas.width,
	h: canvas.height,
	ratio: canvas.width / canvas.height,
	play: false,
	isGameOver: false,
	score: 0,
	highScore: localStorage.getItem('hscore'),
	frameCount: 0,
	gravity: 0.55,
	reverse: false,
	opacity: 0,
	shake: false,
	vib: 3,
	
	loadImages: function() {
		var numImage = 0;
		var loadedImage = 0;
		
		for (var i in image) {
			numImage++;
			
			image[i].onload = function() {
				loadedImage++;
				
				if (loadedImage === numImage) {
					game.newGame();
				}
			}
			
			image[i].src = 'assets/' + i + '.png';
		}
	},
	
	mainMenu: function() {
		document.getElementById('canvas').style.opacity = 1;
		document.getElementById('canvas').style.background = '#000000';

		game.draw.text('REVERSEGRAVITY', game.w / 2, 50, '#ffffff', 'center', '30px Arial');
		game.draw.text('Desktop',  game.w / 2, 100, '#ffffff', 'center', '13px Arial')
		game.draw.text('SPACE to jump, ENTER to reverse gravity', game.w / 2, 130, '#ffffff', 'center', '13px Arial');	
		game.draw.text('Mobile',  game.w / 2, 160, '#ffffff', 'center', '13px Arial')
		game.draw.text('Screen LEFT to jump, Screen RIGHT to reverse gravity', game.w / 2, 190, '#ffffff', 'center', '13px Arial');
		game.draw.text('CLICK TO PLAY', game.w / 2, 250, '#ffffff', 'center', '13px Arial');
	},
	
	resize: function() {
		var gameWidth = window.innerWidth;
		var gameHeight = window.innerHeight;
		var scaleToFitX = gameWidth / 480;
		var scaleToFitY = gameHeight / 320;

		var currentScreenRatio = gameWidth / gameHeight;
		var optimalRatio = Math.min(scaleToFitX, scaleToFitY);

		if (currentScreenRatio >= game.ratio && currentScreenRatio <= game.ratio) {
			canvas.style.width = gameWidth + "px";
			canvas.style.height = gameHeight + "px";
		}
		else {
			canvas.style.width = 480 * optimalRatio + "px";
			canvas.style.height = 320 * optimalRatio + "px";
		}
	},
	
	info: function() {
		game.draw.rect(game.w - 120 - 3, 20 - 3, 100 + 6, 25 + 6, '#000000')
		game.draw.rect(game.w - 120, 20, player.hp, 25, 'dimgrey');
		game.draw.text('Run ' + game.score + ' m', 20, 45, '#000000', 'left', '18px Arial');
	},
	
	scenario: function() {
		if (game.score >= 1500) {
			rock.timer = 100;
		}

		if (game.score >= 2500) {
			rock.timer = 80;	
		}
			
		if (game.score >= 5500) {
			rock.timer = 60;	
		}
		
		if (game.score >= 5000) {
			heli.vx = -5;
			groundTop.vx = -5;
			groundBottom.vx = -5;
			player.speed = 5;
			game.score += 2;
		}
		
		if (player.hp <= 0 || player.hp < 0) {
			player.hp = 0;
			
			if (game.score > game.highScore) {
				game.highScore = game.score;
				localStorage.setItem('hscore', game.highScore);
			}
			
			document.getElementById('run').innerHTML = 'Run ' + game.score + ' m <br>';
			document.getElementById('best').innerHTML = 'Best ' + localStorage.getItem('hscore') + ' m <br>';
			
			game.isGameOver = true;
			game.ctx.setTransform(1, 0, 0, 1, 0, 0);
			
			document.getElementById('canvas').style.opacity = 0.5;	
			document.getElementById('gameOver').style.display = 'block';
		} else if (player.hp >= 100 || player.hp == 100) {
			player.hp = 100;
		}
	},
	
	update: function() {
		if (game.opacity <= 1) {
			game.opacity += 0.01;
		}
			
		document.getElementById('canvas').style.opacity = game.opacity;
		
		if (game.shake) {
			game.vib = -~~game.vib;
			game.ctx.transform(1, 0, 0, 1, game.vib, game.vib);
		} else {
			game.ctx.setTransform(1, 0, 0, 1, 0, 0);
		}
		
		game.frameCount++;
		game.score++;
		player.update();
		heli.update();
		bullet.update();
		rock.update();
		groundTop.update();
		groundBottom.update();
		tornado.update();
		item.update();
		game.info();
		game.scenario();
	},
	
	newGame: function() {
		document.getElementById('canvas').style.opacity = 0;
		document.getElementById('gameOver').style.display = 'none';
		game.opacity = 0;
		game.score = 0;
		game.gravity = 0.55;
		game.frameCount = 0;
		game.isGameOver = false;

		player.reset();
		ground.reset();
		heli.reset();
		item.reset();
		bullet.reset();
		rock.reset();
		tornado.reset();
		
		game.main();	
	},
	
	main: function() {
		document.getElementById('canvas').style.background = 'silver';
		game.ctx.clearRect(0, 0, game.w, game.h);
		
		if (game.play) {
			game.update();
		} else {
			game.mainMenu();
		}
		
		if (!game.isGameOver) {
			requestAnimFrame(game.main);	
		}
	},
	
	mouseDown: function() {
		if (!game.play) {
			setTimeout(function() {
				game.play = true;
				document.getElementById('canvas').style.opacity = 0;
			}, 1000);
		}
	},
	
	keyDown: function(e) {
		if (e.keyCode == 32) {
			player.jump = true;
		}
		
		if (e.keyCode == 13) {
			if (game.play) {
				if (!player.jump) {
					game.gravity = -game.gravity;
					player.jump = true;
					
					setTimeout(function(){
						if (player.flipVertical) {
							player.flipVertical = false;
						} else {
							player.flipVertical = true;
						}
					}, 200);
				}
			}		
		}
	},
	
	touch: function(e) {
		if (!game.play) {
			setTimeout(function() {
				game.play = true;
			}, 1000);
		}
		
		e.preventDefault();
					
		x = e.targetTouches[0].pageX;
		y = e.targetTouches[0].pageY;
		
		if (x < window.innerWidth / 2) {
			player.jump = true;
		}
		
		if (x > window.innerWidth / 2) {
			if (game.play) {
				if (!player.jump) {
					game.gravity = -game.gravity;
					player.jump = true;
					
					setTimeout(function(){
						if (player.flipVertical) {
							player.flipVertical = false;
						} else {
							player.flipVertical = true;
						}
					}, 200);
				}
			}		
		}
	},
	
	draw: {
		text: function(text, x, y, c, align, font) {
			game.ctx.save();
			game.ctx.font = font;
			game.ctx.textAlign = align;
			game.ctx.fillStyle = c;
			game.ctx.fillText(text, x, y);
			game.ctx.restore();
		},
		
		rect: function(x, y, w, h, c) {
			game.ctx.save();
			game.ctx.fillStyle = c;
			game.ctx.fillRect(x, y, w, h);
			game.ctx.restore();
		}
	}
}

var sprite = function(image, x, y, w, h, vx, vy) {
	var sprite = {
		image: image,
		x: x,
		y: y,
		w: w,
		h: h,
		vx: vx,
		vy: vy,
		
		render: function() {
		
			game.ctx.save();
			
			if (sprite.flipVertical) {
				game.ctx.scale(1, -1);
				game.ctx.drawImage(sprite.image, sprite.x - (sprite.w / 2), -sprite.y - (sprite.h / 2));
			} else if (sprite.flipHorizontal) {
				game.ctx.scale(-1, 1);
				game.ctx.drawImage(sprite.image, -sprite.x - (sprite.w / 2), sprite.y - (sprite.h / 2));
			} else {
				game.ctx.scale(1, 1);
				game.ctx.drawImage(sprite.image, sprite.x - (sprite.w / 2), sprite.y - (sprite.h / 2));
			}
			
			game.ctx.restore();
		},
	
		collisionWith: function(sprite2) {
			return sprite.x + (sprite.w / 2) >= sprite2.x - (sprite2.w / 2)
				&& sprite.y + (sprite.h / 2) >= sprite2.y - (sprite2.h / 2)
				&& sprite.x - (sprite.w / 2) <= sprite2.x + (sprite2.w / 2)
				&& sprite.y - (sprite.h / 2) <= sprite2.y + (sprite2.h / 2)
		},
		
		flipVertical: false,
		flipHorizontal: false	
	};
	
	return sprite;
}

var spriteAnimation = function(image, x, y, sx, sy, swidth, sheight, w, h, frame, totalFrame, speed, vx, vy) {	
	var sprite = {
		image: image,
		x: x,
		y: y,
		sx: sx,
		sy: sy,
		swidth: swidth,
		sheight: sheight,
		w: w,
		h: h,
		frame: frame,
		totalFrame: totalFrame,
		speed: speed,
		vx: vx,
		vy: vy,
	
		render: function() {
			
			game.ctx.save();

			if (sprite.flipVertical) {
				game.ctx.scale(1, -1);
				game.ctx.drawImage(sprite.image, sprite.sx, sprite.sy * sprite.frame, sprite.swidth, sprite.sheight, sprite.x - (sprite.w / 2), -sprite.y - (sprite.h / 2), sprite.w, sprite.h);
			} else if (sprite.flipHorizontal) {
				game.ctx.scale(-1, 1);
				game.ctx.drawImage(sprite.image, sprite.sx, sprite.sy * sprite.frame, sprite.swidth, sprite.sheight, -sprite.x - (sprite.w / 2), sprite.y - (sprite.h / 2), sprite.w, sprite.h);
			} else {
				game.ctx.scale(1, 1);
				game.ctx.drawImage(sprite.image, sprite.sx, sprite.sy * sprite.frame, sprite.swidth, sprite.sheight, sprite.x - (sprite.w / 2), sprite.y - (sprite.h / 2), sprite.w, sprite.h);
			}
			
			game.ctx.restore();		

			sprite.frameCount++;
			
			if (sprite.frameCount % sprite.speed == 0) {
				sprite.frame++;
			} 
			
			if (sprite.frame == sprite.totalFrame) {
				sprite.frame = 0;
			}
			
		},
		
		collisionWith: function(sprite2) {
			return sprite.x + (sprite.w / 2) >= sprite2.x - (sprite2.w / 2)
				&& sprite.y + (sprite.h / 2) >= sprite2.y - (sprite2.h / 2)
				&& sprite.x - (sprite.w / 2) <= sprite2.x + (sprite2.w / 2)
				&& sprite.y - (sprite.h / 2) <= sprite2.y + (sprite2.h / 2)
		},
		
		frameCount: 0,
		flipVertical: false,
		flipHorizontal: false
	};
	
	return sprite;
}

var player = function() {
	var player = spriteAnimation(image.player, 100, canvas.height - 29, 0, 35, 35, 35, 35, 35, 1, 3, 6, 0, -10);
	
	player.update = function() {
		player.render();
		
		if (player.jump) {
			player.y += player.vy;
			player.vy += game.gravity;
			player.frame = 0;
		}
		
		if (player.collisionWith(groundTop)) {
			player.jump = false;
			player.vy = 10;
			gravity = -0.55;
			player.y = groundTop.y + 26;
			player.flipVertical = true;
		}
		
		if (player.collisionWith(groundBottom)) {
			player.jump = false;
			player.vy = -10;
			gravity = 0.55;
			player.y = groundBottom.y - 26;
			player.flipVertical = false;
		}
		
		if (player.collisionWith(heli)) {
			player.hp = 0;
		}
		
		if (player.collisionWith(tornado)) {
			player.hp -= 3;
			
			game.shake = true;
			
			setTimeout(function() {
				game.shake = false;
			}, 100);
		}
	}	
	
	player.reset = function() {
		player.speed = 6;
		player.hp = 100;
		player.jump = false;
		player.flipVertical = false;
		player.y = game.h - 29;
	}
	
	player.jump = false;
	player.hp = 100;
	
	return player;
}

var heli = function() {
	var heli = spriteAnimation(image.heli, 2500, Math.floor(Math.random() * 150 + 80), 0, 32, 67, 32, 67, 29, 1, 2, 5, -5, 0);
	
	heli.update = function() {
		heli.render();
		
		heli.x += heli.vx;
		
		if (heli.x < -1000) {
			heli.x = 2500;
			heli.y = Math.floor(Math.random() * 150 + 80);
			heli.bulletArrow = Math.floor(Math.random() * 2 + 1);
		}
		
	}
	
	heli.reset = function() {
		heli.vx = -5;
		heli.x = 2500;
		heli.y = Math.floor(Math.random() * 150 + 80);
		heli.bulletArrow = Math.floor(Math.random() * 2 + 1);
	}
	
	heli.bulletArrow = Math.floor(Math.random() * 2 + 1);
	
	return heli;
}


var ground = {
	top: function() {
		var g = sprite(image.ground, 800, 25 / 2, 1601, 36, -4, 0);
		
		g.update = function() {
			g.render();
			g.flipVertical = true;
			
			g.x += g.vx;
			
			if (g.x <= 0) {
				g.x = 800;
			}
		}
		
		return g;
	},
	
	bottom: function() {
		var g = sprite(image.ground, 800, canvas.height - 25 / 2, 1601, 36, -4, 0);
		
		g.update = function() {
			g.render();
			
			g.x += g.vx;
			
			if (g.x <= 0) {
				g.x = 800;
			}
			
		}
		
		return g;
	},
	
	reset: function() {
		groundTop.vx = -4;
		groundBottom.vx = -4;
	}
}

var item = {
	list: {},
	timer: 800,
	
	generate: function() {
		item.list[Math.random()] = sprite(image.hp, 600, canvas.height / 2, 20, 20, -4.5, 0);
	},
	
	update: function() {
		if (game.frameCount % item.timer == 0) {
			item.generate();
		}
		
		for (var i in item.list) {			
			item.list[i].render();	

			item.list[i].x += item.list[i].vx;
			
			if (game.score >= 5000) {
				item.list[i].vx = -5;
			}
			
			if (item.list[i].collisionWith(player)) {
				if (player.hp < 100) {
					player.hp += 40;
				}
				
				delete item.list[i];
			} else if (item.list[i].x <= -50) {
				delete item.list[i];
			}
		}
	},
	
	reset: function() {
		items = {};
	}
}


var bullet = {
	list: {},
	
	generate: function() {
		bullet.list[Math.random()] = sprite(image.bullet, heli.x, heli.y, 10, 10, -6, 1);
	},
	
	update: function() {
		if (game.frameCount % 15 == 0) {
			bullet.generate();
		}
		
		
		
		for (var i in bullet.list) {
			bullet.list[i].render();
			
			if (game.score > 5000) {
				bullet.list[i].vx = -7;
			}
			
			if (heli.bulletArrow == 1) {
				bullet.list[i].vy = 1;
			} else {
				bullet.list[i].vy = -1;
			}
			
			bullet.list[i].x += bullet.list[i].vx;
			bullet.list[i].y += bullet.list[i].vy;
			
			
			if (bullet.list[i].collisionWith(player)) {
				player.hp -= 5;
				
				game.shake = true;
				
				setTimeout(function() {
					game.shake = false;
				}, 100);
				
				delete bullet.list[i];
			} 
			
			else if (bullet.list[i].y > game.h) {
				delete bullet.list[i];
			}
		}
	},
	
	reset: function() {
		bullet.list = {};
		bullet.vx = -6;
	}
}

var tornado = {
	timer: Math.floor(Math.random() * 2000 + 1000),
	top: {},
	bottom: {},
	
	generate: function() {
		tornado.top[Math.random] = spriteAnimation(image.tornado,  Math.floor(Math.random() * 3000 + 2000), 70, 0, 100, 40, 100, 40, 100, 1, 2, 2, -6, 0);
		tornado.bottom[Math.random] = spriteAnimation(image.tornado, Math.floor(Math.random() * 3000 + 2000), 250, 0, 100, 40, 100, 40, 100, 1, 2, 2, -6, 0);
	},
	
	update: function() {
		if (game.frameCount % tornado.timer == 0) {
			tornado.generate();
		}
		
		for (var i in tornado.top) {
			tornado.top[i].render();
			tornado.top[i].flipVertical = true;
			
			tornado.top[i].x += tornado.top[i].vx;
			
			if (tornado.top[i].collisionWith(player)) {
				player.hp -= 3;
				
				game.shake = true;
				
				setTimeout(function() {
					game.shake = false;
				}, 200);
			}
			
			if (tornado.top.x < -100) {
				delete tornado.top[i];
			}
		}
		
		for (var i in tornado.bottom) {
			tornado.bottom[i].render();
			
			tornado.bottom[i].x += tornado.bottom[i].vx;
			
			if (tornado.bottom[i].collisionWith(player)) {
				player.hp -= 3;
				
				game.shake = true;
				
				setTimeout(function() {
					game.shake = false;
				}, 200);
			}
			
			if (tornado.bottom.x < -100) {
				delete tornado.bottom[i];
			}
		}
		
	},
	
	reset: function() {
		tornado.top = {};
		tornado.bottom = {};
	}
}

var rock = {
	timer: 200,
	vx: -4,
	top: {},
	bottom: {},
	
	generate: function() {
		rock.top[Math.random()] = sprite(image.rock, Math.floor(Math.random() * 1200 + 900), 30, 52, 32, rock.vx, 0);
		rock.bottom[Math.random()] = sprite(image.rock, Math.floor(Math.random() * 1200 + 900), canvas.height - 30, 52, 32, rock.vx, 0);
	},
	
	update: function() {			
		if (game.frameCount % rock.timer == 0) {
			rock.generate();
		}
		
		for (var i in rock.top) {
			rock.top[i].render();
			
			rock.top[i].flipVertical = true;
			
			rock.top[i].x += rock.top[i].vx;
			
			
			if (rock.top[i].collisionWith(player)) {
				game.shake = true;
				
				setTimeout(function() {
					game.shake = false;
				}, 200);
				
				player.hp -= 1.5;
			}

			if (game.score >= 5000) {
				rock.top[i].vx = -5;
			}

			if (rock.top[i].x <= -50) {
				delete rock.top[i];
			}
		}
	
		for (var i in rock.bottom) {
			rock.bottom[i].render();
			
			rock.bottom[i].x += rock.bottom[i].vx;
			
			if (rock.bottom[i].collisionWith(player)) {
				game.shake = true;
				
				player.hp -= 1.5;
				
				setTimeout(function() {
					game.shake = false;
				}, 200);
				
			} 
			
			if (game.score >= 5000) {
				rock.bottom[i].vx = -5;
			}

			if (rock.bottom[i].x <= -50) {
				delete rock.bottom[i];
			}
			
		}
	},
	
	reset: function() {
		rock.timer = 200;
		rock.top = {};
		rock.bottom = {};
	}
}

var groundTop = new ground.top();
var groundBottom = new ground.bottom();
var player = new player();
var heli = new heli();

window.addEventListener('load', game.loadImages, false);
window.addEventListener('load', game.resize, false);
window.addEventListener('resize', game.resize, false);
window.addEventListener('keydown', game.keyDown, false);
window.addEventListener('mousedown', game.mouseDown, false);
document.getElementById('canvas').addEventListener('touchstart', game.touch, false);
document.getElementById('playAgain').addEventListener('click', game.newGame, false);