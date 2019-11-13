/* Janky permalinking with url params
 * @author: rfong
 * requirements: underscore.js, jquery-deparam
 */

window.urlparams = {
  withJSON: false,
};

window.urlparams.setUrlParams = function(params) {
  params = _.object(_.map(params, function(val, key) {
    return [key,
            window.urlparams.withJSON ? JSON.stringify(val) : val.toString()];
  }));
  window.location.hash = $.param(params);
};

window.urlparams.getUrlParams = function() {
  return _.object(_.map(
    $.deparam(window.location.hash.substring(1)),
    function(val, key) {
      return [key, window.urlparams.withJSON ? JSON.parse(val) : val];
    }
  ));
};
