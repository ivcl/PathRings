/**
 * @author      Yongnan
 * @version     1.0
 * @time        11/16/2014
 * @name        info
 */
$(function() {
	/*
  $('#infoBox')
    .css(
      {
        'background-color':'rgba(255,255,255,1)'
      })
    .dialog({
      autoOpen: false,
      modal: false,
      resizable: false,
      show: { effect: 'fade', duration: 500 },
      hide: { effect: 'fade', duration: 500 }
    });
  $('#infoBox').dialog('open');
  $('#infoBox').on('contextmenu', function(e){
    e.preventDefault();
  });
	 */
  $('#information').dialog({
    autoOpen: false,
    modal: false,
    resizable: false,
    width: 'auto',
    height: 'auto',
    close: function () {
      $('#information').children('iframe').attr('src', 'http://www.ncbi.nlm.nih.gov/gquery');
    }
  });
});
