var verticalProductScollers = function (obj) {

    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    // requestAnimationFrame polyfill by Erik Mller
    // fixes from Paul Irish and Tino Zijdelx

    (function () {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
    }());

    //Ken sayers
    var verticalProductScroller = function (wrapper, obj) {

        var _outerWrapper = wrapper;
        var _scrollItemsWrapper = dojo.query(obj.scrollItemsWrapper, _outerWrapper)[0];
        var _itemsToBeScrolled = dojo.query(obj.itemsToBeScrolled, _scrollItemsWrapper);
        var _scollButtons = dojo.query(obj.scollButtons, _outerWrapper);
        var _btnActiveClass = obj.btnActiveClass, _numberOfItems = _itemsToBeScrolled.length;
        var _wrapElInFocus = true;
        var _itemHeight = _itemsToBeScrolled[0].offsetHeight;
        var _currentScrollPos = _scrollItemsWrapper.scrollTop;
        var _animationLength = 333;
        var _easeOutQuad = function (t) {
            return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        };
        var _cutOffTop = _itemHeight - (_itemHeight / 3);
        var _cutOffTop2 = _itemHeight / 2;
        var _cutOffBottom = ( (_numberOfItems - 1) * _itemHeight) - dojo.position(_scrollItemsWrapper).h;
        var _cutOffBottom2 = _cutOffBottom + (_itemHeight / 2);
        var _timerMouseDown;
        var _pushIntent = false;
        var _startMouseDownTimer = function (direction) {
            _timerMouseDown = setTimeout(function () {
                _pushScroller(direction);
            }, obj.pushIntentLength)
        };
        var _stopMouseDownTimer = function () {
            clearTimeout(_timerMouseDown);
            _pushIntent = false;
        };
        var _pushScroller = function (direction) {
            var increment, max;
            _pushIntent = true;
            if (direction === 'up') {
                increment = -4;
            } else {
                increment = 4;
            }
            var draw = function () {

                if (_pushIntent) {
                    requestAnimationFrame(draw);
                } else {
                    _spanToGrid();
                }
                _scrollItemsWrapper.scrollTop = _scrollItemsWrapper.scrollTop + increment;
            };
            draw();
        };
        var _updateBtnState = function (scrollPos) {
            //top
            if (scrollPos > _cutOffTop) {
                if (!(dojo.hasClass(_scollButtons[0], _btnActiveClass))) {
                    dojo.addClass(_scollButtons[0], _btnActiveClass);
                }
            } else if (scrollPos < _cutOffTop2) {
                if (dojo.hasClass(_scollButtons[0], _btnActiveClass)) {
                    dojo.removeClass(_scollButtons[0], _btnActiveClass);
                }
            }
            //bottom
            if (scrollPos > _cutOffBottom2) {
                if (dojo.hasClass(_scollButtons[1], _btnActiveClass)) {
                    dojo.removeClass(_scollButtons[1], _btnActiveClass);
                }
            } else if (scrollPos < _cutOffBottom) {
                if (!(dojo.hasClass(_scollButtons[1], _btnActiveClass))) {
                    dojo.addClass(_scollButtons[1], _btnActiveClass);
                }
            }
        };
        var _addActiveClassToDownBtn = function(){
            dojo.addClass(_scollButtons[1], _btnActiveClass);
        };
        var _spanToGrid = function () {
            var targetScrollTop = ((Math.round(_scrollItemsWrapper.scrollTop / _itemHeight)) * _itemHeight);
            var now, timer = 0;
            var startTime = new Date().getTime();
            var draw = function () {
                if (timer <= 1) {
                    requestAnimationFrame(draw);
                } else {
                    _updateBtnState();
                    _currentScrollPos = _scrollItemsWrapper.scrollTop;
                }
                now = new Date().getTime();
                timer = (now - startTime) / _animationLength;
                _scrollItemsWrapper.scrollTop = Math.round(_scrollItemsWrapper.scrollTop + ((targetScrollTop - _scrollItemsWrapper.scrollTop ) * _easeOutQuad(timer)));
            };
            draw();
        };

        dojo.connect(_outerWrapper, 'onclick', function (e) {
            if (!_pushIntent) {
                if (dojo.hasClass(e.target, _btnActiveClass)) {
                    if (e.target === _scollButtons[0]) {
                        _scrollItemsWrapper.scrollTop = _scrollItemsWrapper.scrollTop - _itemHeight;
                    } else if (e.target === _scollButtons[1]) {
                        _scrollItemsWrapper.scrollTop = _scrollItemsWrapper.scrollTop + _itemHeight;
                    }
                    _updateBtnState();
                }
            }
            _stopMouseDownTimer();
        });

        dojo.connect(_outerWrapper, 'mousedown', function (e) {
            var _direction;
            if (dojo.hasClass(e.target, _btnActiveClass)) {
                if (e.target === _scollButtons[0]) {
                    _direction = 'up';
                }
                if (e.target === _scollButtons[1]) {
                    _direction = 'down';
                }
                if (_direction) {
                    _stopMouseDownTimer();
                    _startMouseDownTimer(_direction);
                }
            }
        });

        dojo.connect(_scrollItemsWrapper, 'scroll', function (e) {
            _updateBtnState(e.target.scrollTop);
        });

        dojo.connect(_scrollItemsWrapper, 'onmouseleave', self, function () {
            _wrapElInFocus = false;
            if (!_wrapElInFocus) {
                if (!(_currentScrollPos === _scrollItemsWrapper.scrollTop)) {
                    _spanToGrid();
                }
            }
        });

        _addActiveClassToDownBtn();

    };

    var vps = dojo.query(obj.outerWrapper);
    var scrollers = [];
    if (vps) {
        dojo.forEach(vps, function (entry, index) {
            scrollers.push(new verticalProductScroller(entry, obj));
        });
    }
};

verticalProductScollers({
    outerWrapper: '.mk-col-third',
    scrollItemsWrapper: '.mk-league-products',
    itemsToBeScrolled: '.mk-league-product',
    scollButtons: '.mk-product-leagues-btn',
    btnActiveClass: 'active',
    pushIntentLength: 1000
});




