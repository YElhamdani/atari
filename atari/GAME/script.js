
LEVEL = 1;

var SHOTSPEED = 250;
var BULLETSPEED = 1000; // en millisecondes
var STEPSPEED = 3; // Multipliateur
var MOVECYCLE = ['left+', 'top+', 'left-', 'top+'];

var moveStep = 0; 

var keysPressed = [];

var gunPosition = 390;
var noBullet = false;
var enemyIdIndex = bulletIdIndex = 0;
var enemiesPositions = [];

var enemiesShotInterval;
var enemiesMoveInterval;
var gunShotInterval;

var gameStarted = false;

function resetGame() {
	$('.enemy, .bullet, .bullet2').remove();
	$('#gun').hide();
	gameStarted = false;
	clearInterval(enemiesShotInterval);
	clearInterval(enemiesMoveInterval);
	clearInterval(gunShotInterval);
}

function gameLog(log, alert) {
	var id = new Date().getTime();
	$('<div></div>', {'data-id': id}).addClass('log').text(log).appendTo($('#logs-container')).css('background', '#FF7').animate({backgroundColor: '#444'}, 500);
	setTimeout(function() {
		$('.log[data-id='+id+']').fadeOut(function() {
			$(this).remove();
		});
	}, 6000);
}

function win() {
	gameLog("Niveau suivant"); /////

	LEVEL++;
	$('#filter').show('pulsate').html('<span style="font-size:40px;"><b>LEVEL '+LEVEL+'</b></span><br /><br />Appuyez sur A');
	resetGame();
}

function loseLife() {
	gameLog("Perte d'une vie"); /////

	$('#game').stop().css('background', 'darkred').animate({backgroundColor: 'black'}, 2000);
	if($('.life:visible').length) $('.life:last').remove();
	else gameOver($('#score').text());
}

function gameOver(score) {
	gameLog("Game over"); /////

	LEVEL = 1;
	$('#filter').show('pulsate').html('<span style="font-size:40px;"><b>GAME OVER</b></span><br />Score : '+score+'<br /><br /><br />Appuyez sur A');
	resetGame();
	$('#lifes').html('<img src="heart.gif" class="life" /><img src="heart.gif" class="life" /><img src="heart.gif" class="life" />');
	$('#score').hide().text('0');
}

function startLevel(level) {
	if(gameStarted) return;
	gameStarted = true;

	gameLog("Initialisation niveau "+level); /////

	$('#score').show();
	$('#gun').show().css('left', '390px');
	gunPosition = 390;
	enemyIdIndex = bulletIdIndex = 0;
	enemiesPositions = [];
	moveStep = 0;

	gameLog("Insertion des ennemis"); /////
	
	var top = 50;
	for(var i = 0; i < 7; i++) {
		var left = 5;
		for(var j = 0; j < 8; j++) {
			var enemyId = enemyIdIndex;
			enemyIdIndex ++;
			var $enemy = $('<div></div>', {id: enemyId}).addClass('enemy').css({
				top: top,
				left: left
			}).attr({
				'data-x': j,
				'data-y': i
			});
			$enemy.appendTo($('#game'));
			enemiesPositions[enemyId] = [left, top];

			left += 100;
		}
		top += 40;
	}

	gunShotInterval = setInterval(function() {
		var bulletId = bulletIdIndex;
		bulletIdIndex ++;
		var $bullet = $('<div></div>', {id: bulletId}).addClass('bullet').css({
			left: gunPosition + 8
		});


		$('<div></div>')
			.addClass('bullet')
			.css({
				left: gunPosition + 5,
				bottom: 20
			})
			.appendTo($('#game'))
			.animate({
				bottom: 600 - 20
			}, {
				duration: BULLETSPEED,
				easing: 'linear',
				step: function(now, fx) {
					var gunLeft = $(this).position().left,
						gunTop = $(this).position().top;

					for(var i = 0; i < enemiesPositions.length; i++) {
						var enemyLeft = enemiesPositions[i][0],
							enemyTop = enemiesPositions[i][1]

						if(enemiesPositions[i] && (enemyLeft+5 <= gunLeft && gunLeft <= enemyLeft + 50-5) && (enemyTop+5 <= gunTop && gunTop <= enemyTop + 30-5)) {
							$('.enemy[id='+i+']').hide('explode', 300, function() {
								$(this).remove();
							});

							gameLog("Ennemi #"+i+" détruit par projectile #"+bulletId); /////
							$('#score').text(parseInt($('#score').text())+level);

							enemiesPositions[i] = false;
							$(this).stop().remove();	
						}
					}
		   		},
		   		complete: function() {
		   			$(this).remove();
		   		},
		   		queue: false
			});

		var enemiesLeft = false;
		for(var i = 0; i < enemiesPositions.length; i++) {
			if(enemiesPositions[i]) enemiesLeft = true;
		}
		if(!enemiesLeft) win();
	}, SHOTSPEED);

	enemiesMoveInterval = setInterval(function() {

		var currentMoveStep = MOVECYCLE[moveStep];
		if(moveStep == 3) moveStep = 0;
		else moveStep ++;

		gameLog("Déplacement des ennemis : "+currentMoveStep); /////

		for(var i = 0; i < enemiesPositions.length; i++) {
			if(currentMoveStep == 'left+') enemiesPositions[i][0] += 40;
			if(currentMoveStep == 'left-') enemiesPositions[i][0] -= 40;
			if(currentMoveStep == 'top+') enemiesPositions[i][1] += 20;
			if(currentMoveStep == 'top-') enemiesPositions[i][1] -= 20;
		}
		if(currentMoveStep == 'left+') $('.enemy').stop().animate({ left: '+=40' }, 200);
		if(currentMoveStep == 'left-') $('.enemy').stop().animate({ left: '-=40' }, 200);
		if(currentMoveStep == 'top+') $('.enemy').stop().animate({ top: '+=20' }, 200);
		if(currentMoveStep == 'top-') $('.enemy').stop().animate({ top: '-=20' }, 200);

		var tooNearFromGun = $(".enemy").filter(function() {
			return $(this).position().top > 550; 
		}); 
		if(tooNearFromGun.length) gameOver();
	}, 2000);

	enemiesShotInterval = setInterval(function() {
		gameLog("Tir des ennemis"); /////

		var lowests = []; // enemis les plus bas par colonnes
		for(var i = 0; i < 8; i++) {
			lowest = -1;
			for(var j = 0; j < 7; j++) {
				
				var $enemy = $('.enemy[data-x='+i+'][data-y='+j+']');
				if(j > lowest && $enemy.length) {
					lowest = j;
					lowests[i] = $enemy.attr('id');
				}
				
			}
			if(lowest == -1) lowests[i] = false;
		}

		for(var i = 0; i < lowests.length; i++) {
			if(lowests[i]) {
				var $enemy = $('.enemy[id='+lowests[i]+']');

				$('<div></div>')
					.addClass('bullet2')
					.css({
						left: $enemy.position().left + 20,
						top: $enemy.position().top + 30
					})
					.appendTo($('#game'))
					.animate({
						top: 600
					}, {
						duration: 600/$enemy.position().top*700,
						easing: 'linear',
						step: function(now, fx) {
							var bulletLeft = $(this).position().left;
							var bulletTop = $(this).position().top;

							if((gunPosition <= bulletLeft && bulletLeft <= gunPosition + 20) && (600-20-5 <= bulletTop && bulletTop <= 600+5)) {
								$(this).stop().remove();
								loseLife();
								return;
							}
				        	
				   		},
				   		complete: function() {
				   			$(this).remove();
				   		},
				   		queue: false
					});
			}
		}
		
	}, (3000/(1.1*level)));

}

setInterval(function() {
	if(gameStarted) {
		if(keysPressed[39] || keysPressed[37]) { // droite, gauche

			if(keysPressed[39] && gunPosition < 780) gunPosition += STEPSPEED;
			if(keysPressed[37] && gunPosition > 0) gunPosition -= STEPSPEED;
			$('#gun').css({
				left: gunPosition
			});
		}
	}
	if(keysPressed[65]) { // A
		$('#filter').hide();
		startLevel(LEVEL);
	}
}, 10);

$(function() {
	gameLog("Page initialisée"); /////

	$('#game').css({
		left: $(document).width()/2 - $('#game').width()/2,
		top: $(document).height()/2 - $('#game').height()/2
	}).fadeIn();

	$(document).keydown(function(e) {
		keysPressed[e.keyCode] = true;
	});
	$(document).keyup(function(e) {
		keysPressed[e.keyCode] = false;
	});
})