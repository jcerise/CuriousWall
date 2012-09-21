$(document).ready(function(){
//======================================================================== general

$("#post_text").focus(function() {
  $(this).height(260);
});

$("#post_text").blur(function() {
  $(this).height(40);
});

function hover_a() {
  $(this).addClass('current');
  $(this).find('i').addClass('current');
}

function hover_b() {
  $(this).removeClass('current');
  $(this).find('i').removeClass('current');
}
$('.button').hover(hover_a, hover_b);
$('.hover').hover(hover_a, hover_b);

//Since our posts are loaded after the intial jquery, we need to use the 'live'
//method to apply to later loaded elements.
$(".post .post-text .hover, .reply, .reply-topic, .user-reply, .topicdelete").live({
        mouseenter:
           function()
           {
                $(this).addClass('current');
           },
        mouseleave:
           function()
           {
                $(this).removeClass('current');
           }
       }
    );

/*
 * Set up the # reference spans with a click handler that loads up the 
 * referenced post.
 */
$(".post .post-text span.pref").each().live("click", function() {
    //Get the post reference number from the span
    var prefClass = $(this).text();

    //Get just the number without the leading #
    var prefNum = prefClass.split('#');
    prefNum = prefNum[1];

    //Get the post number, so we can jail all actions to just this post
    var postNum = $(this).parent().parent().attr('name');

    //Check to see if this link is already actively showing the ref. post
    if ($(this).hasClass("active-" + prefClass)) {
    }else{
        //If its not active, set it to active
        $(this).addClass("active-"+prefClass);

        //Add the div to show the reference, and close link
        $(this).after('<div id="pref-' + prefNum + '-' + postNum + '" class="pref-' +
             prefNum + ' expanded-pref"><div class="close icon-remove-sign ' +
             prefClass + ' hover">Close</div></div>');

        //And finally, load up the post content from the correct PHP function
        $.post('post_db.php', {method:"get", post_id:prefNum}, function(data) {
            $("#pref-" + prefNum + "-" + postNum).prepend(data);
        });
    }   
});

/*
 * Handle the close link in the post reference div
 */
$(".post .post-text .close").each().live("click", function() {
    //Get the correct class, so we can remove the correct instance of this ref.
    var classList = $(this).attr('class').split(/\s+/);

    //Mark the parent span as in-active, so it may be clicked again
    $(this).parent().siblings().removeClass("active-" + classList[2]);

    //Finally, remove the ref. div.
    $(this).parent().remove(); 
});

/*
 * Display post tools when a user clicks on a user avatar in the topic. Remove 
 * them when clicking the same avatar again.
 */
$("#topic_text .username").live('click', function() {
    if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this).siblings(".post-functions").remove();
    }else{
        $(this).addClass('active');
        var classes = $(this).attr('class').split(/\s+/);
        var user = classes[2];
        var prefClass = classes[0];
        prefClass = prefClass.split('#');
        $(this).after('<div class="post-functions">' +
            '<div class="reply-topic hover icon-comment" title="Reply to topic ' + prefClass[1] +'">Reply to topic</div>' +
            '<div class="user-reply hover icon-user">' + user + '</div>' + 
            '<div class="admin-functions"> | </div>');
        //Add in the delete button if the user is an admin
        $.post('post_db.php', {method:"get", get_admin:1, topic_id:prefClass[1]}, function(data) {
            $(".admin-functions").html(data);
        });
    }
    return false;
});

/*
 * Display post tools when a user clicks on a user avatar. Remove them when
 * clicking the same avatar again
 */
$(".post .username").live('click', function() {
    if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this).siblings(".post-functions").remove();
    }else{
        $(this).addClass('active');
        var classes = $(this).attr('class').split(/\s+/);
        var user = classes[1];
        var prefClass = classes[0];
        $(this).after('<div class="post-functions">' +
            '<div class="' + prefClass + ' reply hover icon-comment" title="Reply to post ' + prefClass +'">Reply: ' + prefClass + '</div>' +
            '<div class="user-reply hover icon-user">' + user + '</div>');
    }
});

/*
 * Put a post reference into the post_text textarea upon clicking the reply link
 * in the post tools for a given post. If reply was clicked from the topic, 
 * simply add focus to the post_text textarea.
 */
$(".reply, .reply-topic").live('click', function() {
    var prefClass = $(this).attr('class').split(/\s+/);
    prefClass = prefClass[0];
    if (prefClass == 'reply-topic') {
        $("#post_text").focus();
    }else{
        $("#post_text").val($("#post_text").val() + prefClass + '\n');
        $("#post_text").focus();
    }
});

var $_GET = {};
document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
  function decode(s) {
    return decodeURIComponent(s.split("+").join(" "));
  }
  $_GET[decode(arguments[1])] = decode(arguments[2]);
});

function isINT(input){
  return parseInt(input)==input;
}



//======================================================================== index.php
if (typeof $IS_INDEX_PHP != 'undefined')
{
  var $current_topic = -1;
  
  function scroll($i) {
    $("html:not(:animated),body:not(:animated)").animate({scrollTop : $i}, 0);
  }
  function goHash() {
    var words = window.location.hash.split('/');
    var $to_topic = words[1];
    var $to_reply = (words[2])?words[2]:1;
    if (isINT($to_topic) && isINT($to_reply))
    {
      var $this_topic = $("#topic_title").attr('name');
      var $this_reply = $("#text_container").find(".tcore:eq(0)").text();
      if (!$this_reply) $this_reply = 1;
      if (($to_topic != $this_topic) || ($to_reply != $this_reply)) 
      {
        goTopic($to_topic, $to_reply);
        return true;
      }
    }
    return false;
  }

  var $shall_go_end_of_mid = false;

  function updateCurrTopic(tttt)
  {
    if (tttt == $current_topic) return;
    $(".topic[name=" + $current_topic + "] p").removeClass('current');
    $current_topic = tttt;
    $(".topic[name=" + tttt + "] p").addClass('current');
  }
  function goTopic(tttt, $rep) {
    $('#prepare_post_button').contents().filter(function(){return this.nodeType == 3}).replaceWith('&nbsp;Create');
    var $topic_change = false;
    if ($current_topic != tttt)
    {
      $topic_change = true;
      updateCurrTopic(tttt);
    }
    var $begin = 0;
    if ($rep) { $begin = $rep; }
    $.post('post_db.php', {method:"get", topic:tttt, begin:$begin}, function(msg)
    {
      if ($topic_change)
      {
        $('#text_container').empty();
        if (!$shall_go_end_of_mid)
        {
          scroll(0);
        }
        clearPost();
        $('#post_title').hide();
        $('#text_container').show();
        // change check box (is sticky) value here
//        if (($('#isstickyhiddenfield').val()) == '0') { $('input#sticky').removeAttr('checked');} else { $('#sticky').attr('checked','checked');} 
      }
      updateText(msg);
      
      if ($shall_go_end_of_mid)
      {
        $shall_go_end_of_mid = false;
        to_end_of_mid();
      }
    });
  }

  function refresh($to_topic) {
    $.post('post_db.php', {method:"get"}, function(msg)
    {
      updateNav(msg);
      if ($to_topic > 0)
      {
        scroll(0);
        goTopic($to_topic);
      }
      else if (typeof $to_topic == 'undefined')
      {
        scroll(0);
        if ($(".topic:eq(0)").attr('name') > 0)
          goTopic($(".topic:eq(0)").attr('name'), 0);
        else
          goTopic(0, 0);
      }
    });
  }  

  $(window).resize(function() {
  }).trigger("resize");
  
  function to_end_of_mid() {
    scroll($('#mid_container').height() - $(window).height() + 40);
  }

  function updateText(msg, $partial) {
    if (msg) {
      $('#text_container').html(msg);
      
      $('#mid').show();
      document.title = $('#topic_title').text();
 /*     if (($('#isstickyhiddenfield').val()) == '0') { $('input#ystick').removeAttr('checked');$('#nostick').attr('checked','checked');} else { $('#ystick').attr('checked','checked');$('input#nostick').removeAttr('checked');} 
      if (($('#islockedyhiddenfield').val()) == '0') { $('input#ylock').removeAttr('checked');$('#nolock').attr('checked','checked');} else { $('#ylock').attr('checked','checked');$('input#nolock').removeAttr('checked');} */
      $('input#ystick').removeAttr('checked');$('input#nostick').removeAttr('checked');$('input#ylock').removeAttr('checked');$('input#nolock').removeAttr('checked');

      updateCurrTopic($('#topic_title').attr('name'));
      
      var $numposts = $('#topic_title').attr('topic_replies');
      var $target = $(".topic[name=" + $current_topic + "]").find('.trep');
      $target.text($numposts);
      if ($numposts > 0) $target.show(); else $target.hide();

      makeHash();
      if (typeof MathJax != 'undefined') if (typeof MathJax.isReady != 'undefined') if (MathJax.isReady)
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, document.getElementById("text_container")]);
    }
    $("#text_container .tup").mousedown(function(){replyShift(-1); return false});
    $("#text_container .tup").hover(hover_a, hover_b);
    $("#text_container .tdown").mousedown(function(){replyShift(+1); return false});
    $("#text_container .tdown").hover(hover_a, hover_b);
    var $this_topic = $("#topic_title").attr('name');

    $(".post-functions .admin-functions .delete-"+$this_topic).live("click", function(e){
	var reallydelete = confirm('Are you sure you want to delete that topic? If you do, then you will not be able to recover the topic, and all of the accompanying posts will be deleted too.');
	if (reallydelete) {
                $.post('delete.php', {method:'post', id:$this_topic,postortopic:'topic'}, function(msg){
                    alert(msg);
                    refresh();
                });   
        }
    });

    $(".postdelete").mousedown(function(){
//        alert($(this).attr('title'));
	var reallydelete = confirm('Are you sure you want to delete that post? If you do, then you will not be able to recover the post.');
	var clickedreply = $(this).attr('id');
	if (reallydelete) {
                $.post('delete.php', {method:'post', id:clickedreply, postortopic:'post', parenttopicid:$this_topic}, function(msg){alert(msg);});//, function(msg)
		goTopic($this_topic,(clickedreply-5)); //scrolls the person to the middle of where the post was
		}
	});

  }
  function updateNav(msg) {
    $('#left').show();
    if (!msg) return;
    $('#nav').html(msg);
    if (typeof MathJax != 'undefined') if (typeof MathJax.isReady != 'undefined') if (MathJax.isReady)
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, document.getElementById("nav")]);
    $(".topic[name=" + $current_topic + "] p").addClass('current');
    $("#nav .tup").mousedown(function(){topicShift(-1); return false});
    $("#nav .tup").hover(hover_a, hover_b);
    $("#nav .tdown").mousedown(function(){topicShift(+1); return false});
    $("#nav .tdown").hover(hover_a, hover_b);
    $("#nav .topic p").mousedown(function(e){
      e.preventDefault();
      goTopic($(this).parent().attr('name'));
    });
  }
  function clearPost() {
    $('#post_text').val('');
    $('#post_title').val('');
    $('#post_msg').empty();
  }
  
  function makeHash() {
    var $this_topic = $("#topic_title").attr('name');
    var $this_reply = $("#text_container").find(".tcore:eq(0)").text();
    if ((!$this_reply) || ($this_reply == 1))
    {
      window.location.hash = "!topic/" + $this_topic;
    } else {
      window.location.hash = "!topic/" + $this_topic + "/" + $this_reply;
    }
  }
  
  if (goHash()) refresh(-1); else  refresh();
  window.addEventListener("hashchange", goHash, false);
  
  $('#post_container').keydown(function (e) {
    if (e.ctrlKey && e.keyCode == 13) {
      $('#post_button').mousedown().mouseup();
    }
  });
  
  $('#refresh_button').mousedown(function(e)
  {
    e.preventDefault();
    refresh();
  });

  function replyShift($dir) {
    var $begin = 0;
    if ($dir == -1)
    {
      $begin = parseInt($('#topic_title').attr('begin')) - parseInt($('#topic_title').attr('limit'));
    } 
    else
    {
      $begin = parseInt($('#topic_title').attr('end')) + 1;
    }
    $.post('post_db.php', {method:"get", topic:$current_topic, begin:$begin}, function(msg)
    {
      scroll(0);
      updateText(msg);
    });        
  }
  
  function topicShift($dir) {
    var $begin = 0;
    if ($dir == -1)
    {
      $begin = parseInt($('#left_title').attr('begin')) - parseInt($('#left_title').attr('limit'));
    } 
    else
    {
      $begin = parseInt($('#left_title').attr('end')) + 1;
    }
    $.post('post_db.php', {method:"get", begin:$begin}, function(msg)
    {
      if (msg)
      {
        scroll(0);
        updateNav(msg);
      }
    });        
  }
  
  $('#page_bottom_button').mousedown(function(e)
  {
    e.preventDefault();
    to_end_of_mid();
  });
  $('#page_top_button').mousedown(function(e)
  {
    e.preventDefault();
    scroll(0);
  });
  
  var $current_topic_bak = -1;
  $('#prepare_post_button').mousedown(function(e)
  {
    e.preventDefault();
    clearPost();
    //Show the post area and post button, in case they've been hidden by a locked post 
    $("#post_text").show();
    $("#post_button").show();
    if ($current_topic >= 0)
    {
      $('#prepare_post_button').contents().filter(function(){return this.nodeType == 3}).replaceWith('&nbsp;Cancel');
      $current_topic_bak = $current_topic;
      $(".topic[name=" + $current_topic + "] p").removeClass('current');
      $current_topic = -1;
      $('#text_container').hide();
      $('#post_title').show();
    }
    else 
    {
      $('#prepare_post_button').contents().filter(function(){return this.nodeType == 3}).replaceWith('&nbsp;Create');
      $current_topic = $current_topic_bak;
      $(".topic[name=" + $current_topic + "] p").addClass('current');
      $('#post_title').hide();
      $('#text_container').show();
    }
  });
  
  var post_working = false;
  $('#post_button').mousedown(function(e)
  {
    e.preventDefault();
    if (post_working) return false;
    post_working = true;
    $('#post_msg').html('Posting...');
    $.post('post_db.php', {title:$('#post_title').val(), text:$('#post_text').val(), stick:$('.inputsticky:checked').val(), lock:$('.inputlocked:checked').val(), method:"new", topic:$current_topic}, function(msg) //, sticky:$('#sticky').val()
    {
      if(msg.substr(0, 7) == 'SUCCESS')
      {
        clearPost();
        $('#post_msg').html('Success.');
        if ($current_topic < 0)
        {
          refresh(msg.substr(7));
        }
        else
        {
          $shall_go_end_of_mid = true;
          goTopic($current_topic);
        }
      }
      else
      {
        $('#post_msg').html(msg);
      }
      post_working = false;
    });
  });
  
  (function () {
    var head = document.getElementsByTagName("head")[0], script;
    script = document.createElement("script");
    script.type = "text/x-mathjax-config";
    script[(window.opera ? "innerHTML" : "text")] =
    'MathJax.Hub.Config({\n' +
      'jax: ["input/TeX","output/SVG"],\n' +
    'extensions: ["tex2jax.js","MathMenu.js","MathZoom.js"],\n' +
    'TeX: { extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"] },\n' +
    'tex2jax: { inlineMath: [["$","$"]] }\n' +
    '});';
    head.appendChild(script);
    script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "http://cdn.mathjax.org/mathjax/latest/MathJax.js";
    head.appendChild(script);
  })();
}
//======================================================================== account.php

//hide the email disclaimer until the user focuses on the email input
$("#email-disclaimer").hide();

$("#login_email").focus(function() {
  $("#email-disclaimer").show();
});

$("#login_email").blur(function() {  
  $("#email-disclaimer").hide();
});

if (typeof $IS_ACCOUNT_PHP != 'undefined')
{
  $(document).keypress(function(e) {
    if(e.keyCode == 13) {
      $('#login_button').mousedown().mouseup();
    }
  });
  var working = false;
  $('#login_button').mousedown(function(e)
  {
    e.preventDefault();
    if (working) return false;
    working = true;
    $('#message').empty();
    if ($_GET['a'] == 'login')
    {
      $.post('account_db.php', {method:'login', user:$('#login_user').val(), pass:$('#login_pass').val()}, function(msg)
      {
        if (msg == "Success.")
        {
          window.location.href = "index.php";
        }
        $('#message').html(msg);
        working = false;
      });
    }
    else if ($_GET['a'] == 'register')
    {
      $.post('account_db.php', {method:'register', user:$('#login_user').val(), email:$('#login_email').val(),  pass:$('#login_pass').val()}, function(msg)
      {
        if (msg == "Success.")
        {
          window.location.href = "index.php";
        }
        $('#message').html(msg);
        working = false;
      });
    }
  });
}
});
