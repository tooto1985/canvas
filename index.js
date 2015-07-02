$(function() {
    var drawMode = false,
        $drawable = $("#drawable"),
        ctx = $drawable[0].getContext("2d"),
        currentColor = "#000000",
        currentSize = 1,
        key = "save",
        storage = window.localStorage[key],
        save = storage === "" || storage === undefined ? [] : JSON.parse(storage);

    function toHex(n) {
        return (n < 16 ? "0" : "") + n.toString(16);
    }

    function mouseDown(color, size, x, y, isRecord) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.moveTo(x, y);
        drawMode = true;
        if (isRecord) {
            save.push([color, size, x, y]);
        }
    }

    function mouseMove(x, y, isRecord) {
        if (drawMode) {
            ctx.lineTo(x, y);
            ctx.stroke();
            if (isRecord) {
                save.push([x, y]);
            }
        }
    }

    function mouseUp(isRecord) {
        drawMode = false;
        if (isRecord) {
            save.push([]);
            window.localStorage[key] = JSON.stringify(save);
        }
    }

    function redo() {
        if (save) {
            for (var i = 0, max = save.length; i < max; i++) {
                if (save[i].length > 2) {
                    mouseDown(save[i][0], save[i][1], save[i][2], save[i][3]);
                } else if (save[i].length === 2) {
                    mouseMove(save[i][0], save[i][1]);
                } else {
                    mouseUp();
                }
            }
        }
    }

    (function() {
        var $colorpick = $("#colorpick"),
            c = {
                r: 0,
                g: 0,
                b: 0
            };

        function changeColor(color) {
            var ctx = $colorpick[0].getContext("2d"),
            gradient = ctx.createRadialGradient(75, 75, 0, 75, 75, 75);
            gradient.addColorStop(0, "white");
            gradient.addColorStop(0.5, color);
            gradient.addColorStop(1, "black");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(75, 75, 75, 0, Math.PI * 2, false);
            ctx.fill();
        }
        $("#r,#g,#b").change(function() {
            var $this = $(this);
            c[$this.attr("id")] = parseInt($this.val());
            changeColor("#" + toHex(c.r) + toHex(c.g) + toHex(c.b));
        }).change();
        $colorpick.click(function(e) {
            var x = e.pageX - $(this).offset().left,
                y = e.pageY - $(this).offset().top,
                ctx = $colorpick[0].getContext("2d"),
                data = ctx.getImageData(x, y, 1, 1).data;
            currentColor = "#" + toHex(data[0]) + toHex(data[1]) + toHex(data[2]);
        });
    })(); //colorpick
    (function() {
        $("#size").change(function() {
            currentSize = parseInt($(this).val(), 10);
        });
    })(); //size
    (function() {
        $("#clear").click(function() {
            ctx.clearRect(0, 0, $drawable.width(), $drawable.height());
            save = [];
            window.localStorage[key] = "";
        });
    })(); //clear
    (function() {
        $("#rabbit").click(function() {
            var img = new Image();
            img.src = "rabbit.gif";
            img.onload = function() {
                function step(i) {
                    setTimeout(function() {
                        move((i*10)-80,174);
                    },i*50);
                }
                function move(x,y) {
                    ctx.clearRect(0, 0, $drawable.width(), $drawable.height());
                    ctx.drawImage(img, x, y);
                    redo();
                }
                for(var i=0;i<39;i++) {
                    step(i);
                }
            };
        });
    })(); //rabbit
    (function() {
        ctx.lineCap = "round";
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, $drawable.width(), $drawable.height());
        $drawable.mousedown(function(e) {
            mouseDown(currentColor, currentSize, e.pageX - $drawable.position().left, e.pageY - $drawable.position().top, true);
        }).mousemove(function(e) {
            mouseMove(e.pageX - $drawable.position().left, e.pageY - $drawable.position().top, true);
        }).mouseup(function(e) {
            mouseUp(true);
        });
    })(); //drawable
    redo();
});