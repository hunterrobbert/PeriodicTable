define(function(require, exports, module) {
    var Engine        = require('famous/core/Engine')
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Modifier      = require('famous/core/Modifier');
    var ModifierChain = require('famous/modifiers/ModifierChain');
    var RenderController = require('famous/views/RenderController');
    var GenericSync     = require('famous/inputs/GenericSync');
    var TouchSync       = require('famous/inputs/TouchSync');
    var MouseSync       = require('famous/inputs/MouseSync');
    var ScrollSync      = require('famous/inputs/ScrollSync');
    var PinchSync       = require('famous/inputs/PinchSync');
    var Accumulator     = require('famous/inputs/Accumulator');
    var Transitionable = require('famous/transitions/Transitionable');
    var Timer           = require('famous/utilities/Timer');
    var TweenTransition = require('famous/transitions/TweenTransition');
    var RenderNode    = require('famous/core/RenderNode');





    function TestView() {
        View.apply(this, arguments);

        this.elementSize = 50;
        this.tableWidth = this.elementSize * 18.72;
        this.tableHeight = this.elementSize * 10.4;
        this.windowHeight = window.innerHeight;
        this.windowWidth = window.innerWidth;
        console.log(this.windowWidth);



        var mainEngine = Engine.createContext();
        mainEngine.setPerspective(1000);

        Transitionable.registerMethod('tween', TweenTransition);
        this.yTransitionable = new Transitionable(0);
        this.xTransitionable = new Transitionable(0);
        this.zTransitionable = new Transitionable(0);

        var position = [0,0];

        GenericSync.register({
          mouse: MouseSync,
          touch: TouchSync
        });

        var accumulator = new Accumulator(position);
        var genericSync = new GenericSync(['mouse', 'touch']);

        Engine.pipe(genericSync);
        genericSync.pipe(accumulator);

        genericSync.on('update', function() {
          var genericPosition = accumulator.get();

          this._eventOutput.emit('planeChanged', genericPosition);
        }.bind(this));

        var scrollAccumulator = new Accumulator([0,0]);

        var scrollSync = new ScrollSync();
        Engine.pipe(scrollSync);
        scrollSync.pipe(scrollAccumulator);

        scrollSync.on('update', function(data) {
          var scrolled = scrollAccumulator.get();
          this._eventOutput.emit('planeZChanged', scrolled[1]);
        }.bind(this));


        var pinchAccumulator = new Accumulator(0);
        var pinchSync = new PinchSync();
        Engine.pipe(pinchSync);
        pinchSync.pipe(pinchAccumulator);

        pinchSync.on('update', function(data) {
          var pinched = pinchAccumulator.get() * 2;
          this._eventOutput.emit('planeZChanged', pinched);
        }.bind(this));



        _setPlaneListener.call(this);
        mainEngine.add(_createElements.call(this));

        this.add(mainEngine);

    }

    TestView.prototype = Object.create(View.prototype);
    TestView.prototype.constructor = TestView;

    TestView.DEFAULT_OPTIONS = {
      elementData: {},
      animationDuration: 1500,
      transition: {
        method: 'tween',
        curve: 'easeInOut',
        duration: 1500
        }
    };


    function _createElements() {

      var context = this;
      var table = new RenderNode();
      context.elementElements = [];

            var elementNumber = 0;
            var columnNumber = -1;
            var rowNumber = -1;
            var distance = context.elementSize + 2;
            var notElements = [7,8,9,
                                    10,17,18,19,
                                    20,21,22,27,28,29,
                                    30,31,32,37,
                                    40,41,42,47,
                                    50,51,52,57,
                                    60,61,62,67,
                                    70,71,72,77,
                                    80,81,82,87,
                                    90,91,92,97,
                                    100,101,102,107,
                                    110,111,112,117,
                                    120,127,
                                    130,137,
                                    140,147,
                                    150,157,
                                    160,167,
                                    177];
            var elementColors = {
              'none': 'rgba(255, 255, 255, 0.54)',
              'hydrogen': 'rgba(102, 102, 102, 0.54)',
              'alkaliMetal': 'rgba(245, 176, 120, 0.54)',
              'alkaliEarthMetal': 'rgba(241, 245, 120, 0.54)',
              'transitionMetal': 'rgba(242, 118, 118, 0.54)',
              'poorMetals': 'rgba(120, 245, 220, 0.54)',
              'otherNonMetals': 'rgba(132, 245, 120, 0.54)',
              'nobleGases': 'rgba(120, 159, 245, 0.54)',
              'lanthanoids': 'rgba(245, 120, 220, 0.54)',
              'actinoids': 'rgba(195, 120, 245, 0.54)'
            };





      for (var i = 0; i < 180; i++) {

        columnNumber++;

        if (i % 10 == 0) {
          columnNumber = -1;
          columnNumber ++;
          rowNumber++;
        }

        if (notElements.indexOf(i) > -1) {
          //DONT ADD SURFACE
        } else {
          //ADD ELEMENT
          elementNumber = elementNumber ++;

                  var elementSurface = new Surface({
                    size: [50,50],
                    content: context.options.elementData[elementNumber].abreviation,
                    properties: {
                      lineHeight: context.elementSize + 'px',
                      textAlign: 'center',
                      backgroundColor: elementColors[context.options.elementData[elementNumber].type],
                      fontSize: '20',
                      overflow: 'hidden',
                      color: 'white'
                    }
                  });

                  var originalTranslate = Transform.translate((-context.tableWidth/2)+(distance * rowNumber), (-context.tableHeight/2)+(distance*columnNumber),0);

                  var positionModifier = new Modifier({
                    align: [0.5,0.5],
                    transform: originalTranslate
                  });

                  var tableConnection = new Modifier({
                    origin: [0.5,0.5],
                  });

                  var flatConnection = new Modifier({
                    origin: [0.5,0.5]
                  });


                  var modifierChain = new ModifierChain();
                  modifierChain.addModifier(positionModifier);
                  modifierChain.addModifier(tableConnection);

                  tableConnection.transformFrom(function() {
                      return Transform.multiply(Transform.translate(0,0,context.zTransitionable.get()), Transform.multiply(Transform.rotateY(context.yTransitionable.get()), Transform.rotateX(context.xTransitionable.get())))
                  });

                  flatConnection.transformFrom(function() {
                      return Transform.multiply(Transform.translate(0,0,context.zTransitionable.get()), Transform.multiply(Transform.rotateY(context.yTransitionable.get()), Transform.rotateX(context.xTransitionable.get())))
                  });

                  context.elementElements.push({surface: elementSurface, original: originalTranslate, modifierChain: modifierChain, position: positionModifier, table: tableConnection, flat: flatConnection});
                  console.log(elementNumber);
                  setElementSurfaceListener(context, elementNumber);

                  table.add(modifierChain).add(elementSurface);

                  elementNumber++


        }

      }

      return table;

    }


    function setElementSurfaceListener(context, i) {
      //console.log(i);
      //console.log(context.elementElements[i]);

      //////////////////////////////////////////////////////////////////////////////////////FLING LISTENERS:::::

      var accumulator = new Accumulator([0,0]);
      var sync = new GenericSync(['mouse', 'touch']);

      context.elementElements[i].surface.pipe(sync);
      sync.pipe(accumulator);


      var inTable = function(data) {
        var velocity = data.velocity;
        if (velocity[0] > 1){

          detachElement();
          translateRight(velocity);

          sync.removeListener('end', inTable);
          sync.on('end', inHolding);

        } else if (velocity[0] < 0.1 && velocity [0] > -0.1) {
          detachElement();
          enlargeElement();

          sync.removeListener('end', inTable);
          sync.on('end', inView);
        }
      }

      var inHolding = function(data) {
        var velocity = data.velocity;
        if (velocity[0] < -1) {

          attachElement();
          translateIntoTable(velocity);

          sync.removeListener('end', inHolding);
          sync.on('end', inTable);

        } else if (velocity[0] < 0.1 && velocity [0] > -0.1) {
          enlargeElement();

          sync.removeListener('end', inHolding);
          sync.on('end', inView);
        }
      }

      var inView = function(data) {
        var velocity = data.velocity;
        if (velocity[0] > 1) {

          translateRight(velocity);

          sync.removeListener('end', inView);
          sync.on('end', inHolding);

        }  else if (velocity[0] < 0.1 && velocity [0] > -0.1 || velocity[1] < -1) {
          attachElement();
          unenlargeElement();

          sync.removeListener('end', inView);
          sync.on('end', inTable);
        }
      }


      sync.on('end', inTable);


      function detachElement() {
        var flatXTransitionable = new Transitionable(context.xTransitionable.get());
        var flatYTransitionable = new Transitionable(context.yTransitionable.get());
        var flatZTransitionable = new Transitionable(context.zTransitionable.get());

        context.elementElements[i].modifierChain.removeModifier(context.elementElements[i].table);
        context.elementElements[i].modifierChain.addModifier(context.elementElements[i].flat);

        context.elementElements[i].flat.transformFrom(function() {
          return Transform.multiply(Transform.translate(0,0,flatZTransitionable.get()), Transform.multiply(Transform.rotateY(flatYTransitionable.get()), Transform.rotateX(flatXTransitionable.get())))
        });
        flatYTransitionable.set(0, context.options.transition);
        flatXTransitionable.set(0, context.options.transition);
        flatZTransitionable.set(0, context.options.transition);

      }

      function attachElement() {
        var tableYTransitionable = new Transitionable(0);
        var tableXTransitionable = new Transitionable(0);
        var tableZTransitionable = new Transitionable(0);

        context.elementElements[i].flat.transformFrom(function() {
          return Transform.multiply(Transform.translate(0,0,tableZTransitionable.get()), Transform.multiply(Transform.rotateY(tableYTransitionable.get()), Transform.rotateX(tableXTransitionable.get())))

        });
        tableYTransitionable.set(context.yTransitionable.get(), context.options.transition);
        tableXTransitionable.set(context.xTransitionable.get(), context.options.transition);
        tableZTransitionable.set(context.zTransitionable.get(), context.options.transition);



        Timer.setTimeout(function() {
          context.elementElements[i].modifierChain.addModifier(context.elementElements[i].table);
          context.elementElements[i].modifierChain.removeModifier(context.elementElements[i].flat);
        }.bind(this), 1500);
      }

      function translateRight(velocity) {
        relocatedX = context.windowWidth / 2.778;
        relocatedY = (velocity[1] * 100);
        relocatedZ = 200;
        // var original = context.elementElements[i].original;
        // var distance = original[12];
        // duration = 2000 / velocity[0] - distance;

        context.elementElements[i].position.setTransform(Transform.translate(relocatedX,relocatedY,relocatedZ), {
          duration: 1500,
          curve: 'easeOut'
        });
      }

      function translateIntoTable(velocity) {

        context.elementElements[i].position.setTransform(context.elementElements[i].original, {
          duration: 1500,
          curve: 'easeOut'
        });
      }

      function enlargeElement() {
        context.elementElements[i].position.setTransform(Transform.translate(0,0,600), {
          duration: 1500,
          curve: 'easeOut'
        });
      }

      function unenlargeElement() {
        context.elementElements[i].position.setTransform(context.elementElements[i].original, {
          duration: 1500,
          curve: 'easeOut'
        });
      }

    }



    function _setPlaneListener() {
      this.on('planeChanged', function(genericPosition) {
        this.yTransitionable.set(genericPosition[0]/150);
        this.xTransitionable.set(-genericPosition[1]/150);
      });

      this.on('planeZChanged', function(scroll) {
        this.zTransitionable.set(scroll);
      });
    }












    module.exports = TestView;
});