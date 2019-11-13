var app = angular.module('FansApp', []);


app.controller('FansCtrl', function($scope, $http) {

  $scope.baseURL = '/flow-games/fans';  // ultrajanky gh-pages hack
  
  $scope.dice = [];
  $scope.DISPLAY_MODES = ['pose', 'minimal'];
  $scope.displayMode = $scope.DISPLAY_MODES[0];
  $scope.numTransitions = 2;
  $scope.DICE_PARAMETERS = {
    // all must be unique
    relation: ['C', 'I', 'O', 'S', 'W', 'X'],
    transition: ['isolation', 'spin / antispin', 'tracer', 'slide', 'glide',
                 'stack', 'extension', 'fold', 'toss'],
    num_poses: {C: 6, I: 4, O: 5, S: 6, W: 6, X: 6},
  };

  $scope.getDiceTypes = function() {
    // alternate relations and transitions
    return _.reduce(
      _.map(_.range($scope.numTransitions), function(t) {
          return ['relation', 'transition'] }),
      function(a, b) { return a.concat(b); }, []).concat('relation')
  }

  $scope.getDieType = function(die_name) {
    for (var die_type in $scope.DICE_PARAMETERS)
      if (_.contains($scope.DICE_PARAMETERS[die_type], die_name))
        return die_type;
  };

  $scope.changeNumTransitions = function(n) {
    var prevN = $scope.numTransitions;
    $scope.numTransitions = n;
    if (n < prevN) {
        $scope.dice = $scope.dice.slice(0, 2*n+1);
    } else {
        $scope.shuffle();
    }
    $scope.updateUrlParams();
  };

  $scope.changeMode = function(mode) {
    if (!_.contains($scope.DISPLAY_MODES, mode)) {
        console.error('invalid mode', mode);
        return;
    }
    $scope.displayMode = mode;
    $scope.updateUrlParams();
    $scope.initialize();
  };

  $scope.randomVariant = function(relation) {
    return _.random(1, $scope.DICE_PARAMETERS.num_poses[relation]);
  };

  $scope.shuffle = function(diceTypes) {
    diceTypes = diceTypes || $scope.getDiceTypes();
    $scope.dice = _.map(diceTypes, function(dtype) {
      var params = {
        type: dtype,
        content: _.sample($scope.DICE_PARAMETERS[dtype]),
      };
      params.variant = $scope.randomVariant(params.content);
      return params;
    });
    console.log("shuffled;", _.pluck($scope.dice, 'content'));
    $scope.updateUrlParams();
  };

  $scope.getImageUrl = function(die) {
    var relation = die.content;
    if (! _.contains($scope.DICE_PARAMETERS.relation, relation))
      return null;
    if ($scope.displayMode == 'pose' && die.variant !== undefined) {
      return ($scope.baseURL + '/images/relation_' + relation + die.variant.toString() + '.png');
    }
    return $scope.baseURL + '/images/relation_' + relation+ '.png';
  };

  $scope.updateUrlParams = function() {
    // Dump config to url params
    var dice_names = _.map($scope.dice, function(die) {
      if (die.variant !== undefined) {
        return die.content + ':' + die.variant.toString();
      }
      return die.content;
    });
    window.urlparams.setUrlParams({
        mode: $scope.displayMode,
        transitions: $scope.numTransitions,
        dice: dice_names.join(',')
    });
  };

  $scope.initialize = function() {
    // Load configuration from permalink, or shuffle if DNE
    try {
      var params = window.urlparams.getUrlParams();
      $scope.displayMode = params.mode || $scope.DISPLAY_MODES[0];
      $scope.numTransitions = params.transitions || 2;
    } catch (ex) {
      $scope.shuffle();
      return;
    }
    if (params.dice) {
      console.log("load", params.dice);
      $scope.dice = _.map(params.dice.split(','), function(die_name) {
        if (_.contains(die_name, ':')) {
          die_name = die_name.split(':');
          return {
            type: $scope.getDieType(die_name[0]),
            content: die_name[0],
            variant: die_name[1],
          };
        }
        return {
          type: $scope.getDieType(die_name),
          content: die_name,
          variant: $scope.randomVariant(die_name),
        };
      });
      $scope.updateUrlParams();
    }
    else {
      $scope.shuffle();
    }
  };

  $scope.initialize();
});
