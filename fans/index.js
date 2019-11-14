var app = angular.module('FansApp', []);


app.controller('FansCtrl', function($scope, $http) {

	/* Configuration */
  $scope.baseURL = '/flow-games/fans';  // ultrajanky gh-pages hack
  $scope.DISPLAY_MODES = ['pose', 'minimal'];
  $scope.displayMode = $scope.DISPLAY_MODES[0];
  $scope.numTransitions = 2;
  $scope.CARDS_PARAMETERS = {
    // all must be unique
    relation: ['C', 'I', 'O', 'S', 'W', 'X'],
    transition: ['isolation', 'spin / antispin', 'tracer', 'slide', 'glide',
                 'stack', 'extension', 'fold', 'toss'],
    num_poses: {C: 6, I: 4, O: 5, S: 6, W: 6, X: 6},
  };

  $scope.cards = [];

  $scope.getCardsTypeSequence = function() {
    // alternate relations and transitions
    return _.reduce(
      _.map(_.range($scope.numTransitions), function(t) {
          return ['relation', 'transition'] }),
      function(a, b) { return a.concat(b); }, []).concat('relation')
  }

  $scope.getCardType = function(card_name) {
    for (var card_type in $scope.CARDS_PARAMETERS)
      if (_.contains($scope.CARDS_PARAMETERS[card_type], card_name))
        return card_type;
  };

  $scope.changeNumTransitions = function(n) {
    var prevN = $scope.numTransitions;
    $scope.numTransitions = n;
    if (n < prevN) {
        $scope.cards = $scope.cards.slice(0, 2*n+1);
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
    return _.random(1, $scope.CARDS_PARAMETERS.num_poses[relation]);
  };

	// Randomly generate a new set of cards.
  $scope.shuffle = function(cardsTypes) {
    cardsTypes = cardsTypes || $scope.getCardsTypeSequence();
    $scope.cards = _.map(cardsTypes, function(dtype) {
      var params = {
        type: dtype,
        content: _.sample($scope.CARDS_PARAMETERS[dtype]),
      };
      params.variant = $scope.randomVariant(params.content);
      return params;
    });
    console.log("shuffled;", _.pluck($scope.cards, 'content'));
    $scope.updateUrlParams();
  };

  $scope.getImageUrl = function(card) {
    var relation = card.content;
    if (! _.contains($scope.CARDS_PARAMETERS.relation, relation))
      return null;
    if ($scope.displayMode == 'pose' && card.variant !== undefined) {
      return ($scope.baseURL + '/images/relation_' + relation + card.variant.toString() + '.png');
    }
    return $scope.baseURL + '/images/relation_' + relation+ '.png';
  };

  // Dump config to url params
  $scope.updateUrlParams = function() {
    var cards_names = _.map($scope.cards, function(card) {
      if (card.variant !== undefined) {
        return card.content + ':' + card.variant.toString();
      }
      return card.content;
    });
    window.urlparams.setUrlParams({
        mode: $scope.displayMode,
        transitions: $scope.numTransitions,
        cards: cards_names.join(',')
    });
  };

	// Load configuration from permalink.
	// If invalid, randomly generate new cards.
  $scope.initialize = function() {
    try {
      var params = window.urlparams.getUrlParams();
      $scope.displayMode = params.mode || $scope.DISPLAY_MODES[0];
      $scope.numTransitions = params.transitions || 2;
    } catch (ex) {
      $scope.shuffle();
      return;
    }
    if (params.cards) {
      console.log("load", params.cards);
      $scope.cards = _.map(params.cards.split(','), function(card_name) {
        if (_.contains(card_name, ':')) {
          card_name = card_name.split(':');
          return {
            type: $scope.getCardType(card_name[0]),
            content: card_name[0],
            variant: card_name[1],
          };
        }
        return {
          type: $scope.getCardType(card_name),
          content: card_name,
          variant: $scope.randomVariant(card_name),
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
