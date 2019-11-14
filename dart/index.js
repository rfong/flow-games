var app = angular.module('DartApp', []);

var pickRandom = function(arr) {
	return arr[_.random(0, arr.length-1)];
};

// move types : allowed body parts
var move_types = {
	'shot': ['mouth', 'butt', 'shoulder', 'toe', 'heel', 'foot', 'knee', 'elbow'],
	'wrap': ['neck', 'armpit', 'arm', 'hand', 'wrist', 'leg', 'foot'],
};
move_types['turn'] = move_types['wrap'];
var all_body_parts = _.uniq(_.flatten(_.values(move_types)));

// flair : whitelisted body parts, or null if all
var flair_options = {
	'pirouette': null,
	'over the head': ['elbow', 'mouth'],
	'behind the back': ['elbow', 'hand', 'wrist', 'neck'],
	'level change': null,
	'gesture': null,
	'jump': null,
	'groundwork': null,
	'plane change': null,
	'roll': null,
};

function capitalizeFirstLetter(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateBasicMove() {
	var moveType = pickRandom(_.keys(move_types)),
			bodyPart = pickRandom(move_types[moveType])
			flair = pickRandom(_.filter(_.keys(flair_options), function(k) {
				return flair_options[k]==null || _.contains(flair_options[k], bodyPart);
			}).concat([null]));
	return (
		capitalizeFirstLetter(bodyPart) + " " + moveType +
		(flair===null ? "" : (", " + flair))
	);
};

function generateEmptyKnot() {
	var wrappedBodyPart = pickRandom(move_types['wrap'].concat('back')),
			shotBodyPart = pickRandom(move_types['shot']),
			flair = pickRandom(_.filter(_.keys(flair_options), function(k) {
				return flair_options[k]==null || _.contains(flair_options[k], shotBodyPart);
			}).concat([null]));
	return (
		"Empty knot around " + wrappedBodyPart +
		", shot with " + shotBodyPart +
		(flair===null ? "" : (", use " + flair))
	);
}

function generateMove() {
	// P(empty knot) = 1/n, where n = (# basic moves + 1)
	if (_.random(0, _.keys(move_types).length) == 0) {
		return generateEmptyKnot();
	}
	return generateBasicMove();
}

for (var i=0; i<10; i++) {
	console.log(generateMove());
}

app.controller('DartCtrl', function($scope, $http) {

  $scope.baseURL = '/flow-games/dart';  // ultrajanky gh-pages hack
	$scope.prompts = [];

	$scope.morePrompts = function(n) {
		if (n==null) {
			n = 3;
		}
		$scope.prompts.push(
			_.map(_.range(3), function() { return generateMove(); })
		);
		document.getElementById('footer').scrollIntoView();
	};

	$scope.clearPrompts = function() {
		$scope.prompts = [];
    $scope.morePrompts();
	};
	$scope.clearPrompts();
  
});
