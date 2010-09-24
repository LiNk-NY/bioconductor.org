var packageInfo = {};
var biocVersion;

var displayPackages = function(packageList, nodeName) {
    log("in displayPackages");
    if (packageList == null) {
        jQuery("#packages").empty();
        return;
    }
    var html = "<h3>Packages</h3>\n";
    
    html += "<p>";
    html += findParents(nodeName).join(" &gt ");
    html += "</p>\n";
    
    
    html += "<ul class='inline_list'>\n";
    
    
    for (var i = 0; i < packageList.length; i++) {
        var title = "unknown";
        var title = packageInfo[packageList[i]]["Description"].replace(/\n/g, " ");
        
        var folder = (biocVersion == releaseVersion) ? "release" : "devel";
        var url = folder + "/" + packageList[i];


        
        html += "\t<li>\n"
        html += "\t\t<a href='" +
          url +
          "' title=\"" +
          title +
          "\">" +
          packageList[i] +
          "</a>\n";
          html += "\t</li>\n";
    }
    html += "</ul>\n"



    jQuery("#packages").html(html);
}


var jumpToAnchor = function() {
    var tmp = ("" + window.location).split("#");
    document.getElementById('treeTop').scrollIntoView(true);
}

var nodeSelected = function(event, data){
    var nodeName = data['args'][0]['text'];
    if (nodeName == undefined) {
        nodeName = getParameterByName("openNode");
    }
    log("in nodeSelected, nodeName = " + nodeName);
    var tmp = nodeName.split(" ");
    nodeName = tmp[0];
    log("you clicked on: " + nodeName);
      var packageListStr = jQuery("#" + nodeName).attr("packageList");
      //log("packageListStr = " + packageListStr);
      if (packageListStr) {
          var packageList = packageListStr.split(",");
          log("first = " + packageList[0]);
          displayPackages(packageList, nodeName);
      } else {
          displayPackages(null, nodeName);
      }
      //jumpToAnchor();
}


var setBiocVersion = function() {
    
    
    biocVersion = getParameterByName("version");
    if (biocVersion == "") {
        biocVersion = releaseVersion;
    } else if (biocVersion.toLowerCase() == "release") {
        biocVersion = releaseVersion;
    } else if (biocVersion.toLowerCase() == "devel") {
        biocVersion = develVersion;
    }
    log("biocVersion = " + biocVersion);
    
    
    
    var releaseText;
    var develText;
    var url;
    
    if (biocVersion == releaseVersion) {
        releaseText = "Release version (" + releaseVersion + ")";
        url = "../bioc-views/?version=devel";
        develText = "<a href='" + url + "'>" + "Development version (" + develVersion + ")</a>";
    } else {
        develText = "Development version (" + develVersion + ")";
        url = "../bioc-views/";
        releaseText = "<a href='" + url + "'>" + "Release version (" + releaseVersion + ")</a>";
    }
    
    jQuery("#release_version").html(releaseText);
    jQuery("#devel_version").html(develText);
}


var findParents = function (nodeId) {
    log("hello from findParents, node id=" + nodeId);
    var parents = jQuery("#" + nodeId).parentsUntil("#tree");
    log("parents length = " + jQuery(parents).length);
    var ret = [];
    ret.push(nodeId);
    jQuery.each(parents, function(index, value){
        var id = jQuery(value).attr("id");
        if (id.length > 0) {
            log("hi, id = " + id);
            ret.push(id);
        }
    });
    ret.reverse();
    return ret;
}

var init = function() {
    log("in init function");
    // todo add ajax failure method (possible?)
    
    var initiallySelected = [];
    var nodeName = "";
    nodeName = getParameterByName("openNode");
    
    if (nodeName != "") {
        initiallySelected.push(nodeName);
    }
    
    jQuery("#tree").jstree({ 
        "ui": {
          "initially_select": initiallySelected
        },
	    "themes": {
	        "theme": "apple",
	        "dots": false,
	        "icons": false
	    },
		"json_data" : {
			"ajax" : {
				"url" : "json/" + biocVersion + "/tree.json",
				"data" : function (n) { 
					return { id : n.attr ? n.attr("id") : 0 }; 
				}
			}
		},
		"plugins" : [ "themes", "json_data", "ui" ]
	});
	
	// explicitly add biocViewsTree class because the widget strips it off
	jQuery("#tree").addClass("biocViewsTree");
	//jQuery("#tree").addClass("PageContent");
	
	
    /*
    jQuery("#tree").bind("close_node.jstree dblclick.jstree delete_node.jstree deselect_node.jstree destroy.jstree drag_start.vakata drag_stop.vakata get_rollback.jstree init.jstree load_node.jstree loaded.jstree mousedown.jstree move_node.jstree open_node.jstree rename_node.jstree reopen.jstree select_node.jstree set_rollback.jstree ", function (event, data) {
        log("event name: " + event.type);
    })
    */
    
    jQuery("#tree").bind("select_node.jstree", function(event, data){
        log("a node was selected");
//        if(data.func === "select_node") {
        	//log("stopping:" + data.args[0].attr("id"));
        	
        	nodeSelected(event, data);
        	//event.stopImmediatePropagation();
        	//return false;
//        } 
    });
    
    jQuery("#tree").bind("loaded.jstree", function(event, data){
        log("i got loaded!");
        var initiallyOpen = [];
        var openNode = getParameterByName("openNode");
        log("openNode = " + openNode);
        if (openNode != "") {
            initiallyOpen = findParents(openNode);
            log("io.length = " + initiallyOpen.length);
            for(var i = 0; i < initiallyOpen.length; i++) {
                log("item: " + initiallyOpen[i]);
                jQuery("#tree").jstree("open_node", "#" + initiallyOpen[i]);
            }
           // jQuery("#tree").jstree("select_node", "#" + openNode);
        }
    });
    
    
}

//document ready function
jQuery(function () {
    setBiocVersion();
    
    var repos = ["bioc", "data/annotation", "data/experiment"];
    var count = 0;
    
    for (var i = 0; i < repos.length; i++) {
        jQuery.getJSON("json/" + biocVersion + "/" + repos[i] +  "/packages.json", function(data){
            jQuery.extend(packageInfo, data);
            if (count == 2) {
                init();
            }
            count++;
        });
    }
    


});
