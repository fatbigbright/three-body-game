function circle(canvas, x, y, radius, color, mass){
    var context = canvas.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    var gradient;
    var speed_x = 0;
    var speed_y = 0;
    var up_flag = false;
    var down_flag = false;
    var left_flag = false;
    var right_flag = false;
    var step = 0.3;
    var MAX_SPEED = 3;
    var MAX_SPEED_X = MAX_SPEED;
    var MIN_SPEED_X = -MAX_SPEED;
    var MAX_SPEED_Y = MAX_SPEED;
    var MIN_SPEED_Y = -MAX_SPEED;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.mass = mass;
    this.getOriginalForce = function(speed){
        speed_x = speed.x;
        speed_y = speed.y;
    };
    this.massEffect = function(g_x, g_y){
        speed_x += g_x;
        speed_y += g_y;
    };

    this.draw = function(){
        if(up_flag){
            speed_y += -step; 
            up_flag = false;
        }
        if(down_flag){
            speed_y += step;
            down_flag = false;
        }
        if(left_flag){
            speed_x += -step;
            left_flag = false;
        }
        if(right_flag){
            speed_x += step;
            right_flag = false;
        }

        if(speed_x <= MIN_SPEED_X) speed_x = MIN_SPEED_X; 
        if(speed_x >= MAX_SPEED_X) speed_x = MAX_SPEED_X;
        if(speed_y <= MIN_SPEED_Y) speed_x = MIN_SPEED_Y;
        if(speed_y >= MAX_SPEED_Y) speed_y = MAX_SPEED_Y;

        this.x += speed_x;
        this.y += speed_y;

        /*
        if(this.x - this.radius <= 0) {
            this.x = this.radius;
            speed_x = 0;
        }
        if(this.x + this.radius >= canvasWidth) {
            this.x = canvasWidth - this.radius;
            speed_x = 0;
        }
        if(this.y - this.radius <= 0){
            this.y = this.radius;
            speed_y = 0;
        }
        if(this.y + this.radius >= canvasHeight){
            this.y = canvasHeight - this.radius;
            speed_y = 0;
        }
        */

        gradient = context.createLinearGradient(this.x - this.radius/2, this.y - this.radius/2, this.x + this.radius/2, this.y + this.radius/2);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(1, color);
        
        context.fillStyle = gradient;
        context.beginPath();
        //x, y,radius, startAngle, endAngle, counterclockwise
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
    };
}

function gravity(star, planet){
    var G = 6.67;
    var deltaX = star.x - planet.x;
    var deltaY = star.y - planet.y;
    var distanceSquare = deltaX * deltaX + deltaY * deltaY;
    var distance = Math.sqrt(distanceSquare);
    var planet_gravity_factor = G * star.mass / (distanceSquare * distance);
    var g_planet_x = deltaX * planet_gravity_factor;
    var g_planet_y = deltaY * planet_gravity_factor;

    //planet.massEffect(g_planet_x, g_planet_y);

    /* perturbation of the star */
    var star_gravity_factor = G * planet.mass / (distanceSquare * distance);
    var g_star_x = -deltaX * star_gravity_factor;
    var g_star_y = -deltaY * star_gravity_factor;
    //star.massEffect(g_star_x, g_star_y);
    return { 
        star_g_x: g_star_x,
        star_g_y: g_star_y,
        planet_g_x: g_planet_x, 
        planet_g_y: g_planet_y,
        distance: distance
    };
}

window.onload = function(){
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;

    var stop = document.getElementById('stop');
    var run = document.getElementById('run');

    var mess1 = document.getElementById('mass1');
    var star1X = document.getElementById('star1X');
    var star1Y = document.getElementById('star1Y');
    var speed1X = document.getElementById('speed1X');
    var speed1Y = document.getElementById('speed1Y');

    var mess2 = document.getElementById('mass2');
    var star2X = document.getElementById('star2X');
    var star2Y = document.getElementById('star2Y');
    var speed2X = document.getElementById('speed2X');
    var speed2Y = document.getElementById('speed2Y');

    var mess3 = document.getElementById('mass3');
    var star3X = document.getElementById('star3X');
    var star3Y = document.getElementById('star3Y');
    var speed3X = document.getElementById('speed3X');
    var speed3Y = document.getElementById('speed3Y');

    var check_fixed_coordinate = document.getElementById('check_fixed_coordinate');
    var fixed_red = document.getElementById('red');
    var fixed_yellow = document.getElementById('yellow');
    var fixed_blue = document.getElementById('blue');
    check_fixed_coordinate.checked = false;
    fixed_red.disabled = true;
    fixed_yellow.disabled = true;
    fixed_blue.disabled = true;
    check_fixed_coordinate.onclick = function(){
        if(check_fixed_coordinate.checked){
            fixed_red.disabled = false;
            fixed_yellow.disabled = false;
            fixed_blue.disabled = false;
        }else{
            fixed_red.disabled = true;
            fixed_yellow.disabled = true;
            fixed_blue.disabled = true;

            fixed_red.checked = false;
            fixed_yellow.checked = false;
            fixed_blue.checked = false;
        }
    };

    var token;
    run.onclick = function(){
        run.value = 'running';
        run.disabled = true;
        var star1 = new circle(canvas, parseFloat(star1X.value), parseFloat(star1Y.value), 10, 'Red', parseFloat(mess1.value));
        var star2 = new circle(canvas, parseFloat(star2X.value), parseFloat(star2Y.value), 10, 'Yellow', parseFloat(mess2.value));
        var star3 = new circle(canvas, parseFloat(star3X.value), parseFloat(star3Y.value), 10, 'Blue', parseFloat(mess3.value));

        star1.getOriginalForce({ x: parseFloat(speed1X.value), y: parseFloat(speed1Y.value)});
        star2.getOriginalForce({ x: parseFloat(speed2X.value), y: parseFloat(speed2Y.value)});
        star3.getOriginalForce({ x: parseFloat(speed3X.value), y: parseFloat(speed3Y.value)});

        token = setInterval(function(){
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            var g_12 = gravity(star1, star2);
            var g_23 = gravity(star2, star3);
            var g_31 = gravity(star3, star1);

            if(g_12.distance <= star1.radius + star2.radius || 
               g_23.distance <= star2.radius + star3.radius ||
               g_31.distance <= star3.radius + star1.radius){
                   clearInterval(token);
                   run.value = 'Run';
                   run.disabled = false;
            }
            star1.massEffect(g_12.star_g_x + g_31.planet_g_x, g_12.star_g_y + g_31.planet_g_y);
            star2.massEffect(g_12.planet_g_x + g_23.star_g_x, g_12.planet_g_y + g_23.star_g_y);
            star3.massEffect(g_31.star_g_x + g_23.planet_g_x, g_31.star_g_y + g_23.planet_g_y);

            star1.draw();
            star2.draw();
            star3.draw();
        }, 1000/30);
    };
    stop.onclick = function(){
        clearInterval(token);
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        run.value = 'Run';
        run.disabled = false;
    };
}
