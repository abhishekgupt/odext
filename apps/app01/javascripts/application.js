// sandbox ourselves to guarantee we don't interfere with OnDemand platform --Abhishek122344111
// JS internals
jQuery(function($) {
    
// bail if we don't have our main lib
if (typeof jQuery === 'undefined') {
    alert('Custom application extension failed: jQuery not available');
    return;
}

function $get(key) {
    return $("[id='" + key + "']");
}

//***************************************************************************
// Plugin Handlers
//***************************************************************************
var copyPreviousObjectiveHandler = function() {
        var ownerId = $get('AccountCallInsert.Owner Id').val();
        var contactPerId = $get('AccountCallInsert.Contact Per Id').val();
        var $objectiveInputElement = $get('AccountCallInsert.VONDMED Call');
        var objectiveValue = $objectiveInputElement.val();
        
        // already has a value so don't overwrite
        if (objectiveValue !== '') { return; }

        var obj = {ownerId: ownerId, contactPerId: contactPerId, objectiveValue: objectiveValue};

        console.dir(obj);
        
        var fields = {
            ActivityId: '',
            PrimaryContactId: " ='" + contactPerId + "' ",
            PrimaryContactLastName: '',
            PrimaryContactFirstName: '',
            Owner: '',
            AccountId: '',
            CallType: '',
            PrimaryContact: '',
            CreatedBy: '',
            Location: '',
            Objective: '',
            OwnerId: " ='" + ownerId + "' ",
            Status: '',
            Type: '',
            ActivitySubType: '',
            CreatedDate: '',
            ModifiedDate: '',
            Date: '',
            StartTime: '',
            EndTime: ''
        };
        
         odlib.activityQuery(fields, function(data) {

             // no previous activities on contact
             if (data.length === 0) {
                 return;
             }
             
             data.sort(function(item1, item2) {
                 return Date.parse(item1.StartTime) - Date.parse(item2.StartTime);
             });
             
             var lastObjectiveValue = data[data.length - 1].Objective;
             $objectiveInputElement.val(lastObjectiveValue);
             console.dir(data);            
    });
    
};

var augmentCallDetailsEntry = function() {
	var row = "<tr width='100%'>";
	row += "<td><p style='color:red'>Product* <input name=CallProdDetailNew.Name size='10' tabindex='3' type=text value='' class=inputControl id=CallProdDetailNew.Name /><script type=text/javascript>function newPopup(url){popupWindow = window.open(url,'popUpWindow','height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes')}</script><a href=JavaScript:newPopup('https://secure-ausomxapa.crmondemand.com/OnDemand/user/AssocProductPopup?mapBC=Pharma+Call+Products+Detailed&OACTRL=Name&ophi=CallProdDetailNew.Product+Id&pfid=CallProdDetailNew&OMTHD=AssocPopup&OMTGT=PopupSearchList&assocInit=Y&opht=4&OAOBJ=Call+ProdDetail&mapField=Name&ophd=CallProdDetailNew.Name&ophpd=1&disableclear=Y&ophr=AssocProductPopup&assocval=&ParentType=Edit');><img src='../1.10.0.1079.0.03/base/themes/oracle/images/iconSearch.gif'></a></td>";
	row += "<td>Priority <input name=CallProdDetailNew.Priority size='10' tabindex='4' type='text' value='' class=inputControl id=CallProdDetailNew.Priority /></td>";
	row += "<td><p style='color:red'>Indication* <select name=CallProdDetailNew.Indication tabindex='5' onchange=onDropDownChange (this); class=inputControl id=CallProdDetailNew.Indication><option /><option value='Allergy'>Allergy</option><option value='Asthma'>Asthma</option><option value='Arrhythmia'>Arrhythmia</option><option value='Heart Failure'>Heart Failure</option><option value='Syncope'>Syncope</option><option value='Other'>Other</option></td>";
	row += "<td>Issues <select name=CallProdDetailNew.Issue tabindex='6' onchange=onDropDownChange (this); class=inputControl id=CallProdDetailNew.Issue><option /><option value='Side Effects'>Side Effects</option><option value='Efficacy'>Efficacy</option><option value='Cost vs. Generics'>Cost vs. Generics</option><option value='Price'>Price</option></td>";
	row += "<td><input type='button' name='Save' value='Save' onclick='jQuery(this).parent().parent().remove()'></input></td>";
	row += "<td><input type='button' name='Save&New' value='Save&New' onclick='jQuery(this).parent().parent().remove()'></input></td>";
        row += "<td><input type='button' name='Cancel' value='Cancel' onclick='jQuery(this).parent().parent().remove()'></input></td>";
        row += "</tr>";

	var html = "<div>";
	html += "<table id='mrk_details'>";
	html += row;
	html += "</table>";
	html += "</div>";

	var e = jQuery("[class='buttonChildTitleBarTD']").filter("[id^='CallsProdDetail']").get(0);
	e.onclick = function() {};
	jQuery("[class='buttonChildTitleBarTD']").filter("[id^='CallsProdDetail']").click(function() {
		if ( jQuery("#mrk_details").size() === 0 ) {
			jQuery("#CallsProdDetailChildListDiv").next().replaceWith(html);
		} else {
			jQuery("#mrk_details").append(row);
		}
	});    
};

//***************************************************************************
// Plugin Manager
//***************************************************************************
function PluginManager(pluginDefinitions) { this.pluginDefinitions = pluginDefinitions; }

PluginManager.prototype.applyPlugins = function() {

    // find out where we're at within the OnDemand application based on the URL
    var pathname = window.location.pathname;
    var index = pathname.lastIndexOf('/');
    var pageName = pathname.substring(index + 1);

    // apply plugins based on the URL pattern match
    $.each(this.pluginDefinitions, function(index, plugin) {   

        console.log('checking plugin match: ' + plugin.name);
        if (pathname.match(plugin.invokeOnPattern)) {
            console.log('invoking plugin: ' + plugin.name);
            if (plugin.requiresLogin) {
                odlib.login(function(xhr, textStatus) {
                    plugin.handler.call(plugin);
                });
            } else {
                plugin.handler.call(plugin);
            }
        }

    });
    
}

//***************************************************************************
// Plugin Definitions
//***************************************************************************
var pluginsDefinitions = [
    {
        name: 'Copy Previous Objective',
        invokeOnPattern: /AccountCallInsert/ig,
        handler: copyPreviousObjectiveHandler,
        requiresLogin: true
    },
    {
        name: 'Augment Call Details Entry',
        invokeOnPattern: /ContactCallDetail/ig,
        handler: augmentCallDetailsEntry,
        requiresLogin: false
    }
];

//***************************************************************************
// Application Logic Entry Point
//***************************************************************************

// find out where we're at in OnDemand
function applyPlugins() {
    var pluginManager = new PluginManager(pluginsDefinitions);
    pluginManager.applyPlugins();
}

window.applyPlugins = applyPlugins;
applyPlugins();
    
});

/*
var fields = {
    ActivityId: '',
    PrimaryContactId: " ='" + contactPerId + "' ",
    PrimaryContactLastName: '',
    PrimaryContactFirstName: '',
    Owner: '',
    AccountId: '',
    CallType: '',
    PrimaryContact: '',
    CreatedBy: '',
    Location: '',
    Objective: '',
    OwnerId: " ='" + ownerId + "' ",
    Status: '',
    Type: '',
    ActivitySubType: '',
    CreatedDate: '',
    ModifiedDate: '',
    Date: '',
    StartTime: '',
    EndTime: ''
};

if (pageName === 'ContactCallDetail') {
    var valueLabel = $( $("td:contains('Objective')")[1] ).next();
    // TODO: implement objective exists logic
    var currentCallObjectiveExists = $.trim( valueLabel.text() ) !== '';
    if (!currentCallObjectiveExists) {
        // autopopulate Objective with previous call objective
        valueLabel.mouseover();
        valueLabel.click();
        var inlineEditor = jQuery('.iled');
        inlineEditor.val((new Date()).toString() + ': last objective' );
        var okButton = inlineEditor.parent().next().children().get(0);
        okButton.click();
        valueLabel.mouseout();
    }
}

 odlib.activityQuery(fields, function(data) {
     alert( JSON.stringify(data) );
     console.dir(data);
});

     var userFields = {AccountName:''};
     var entities = [
        {
            name: 'Account',
            fields: {AccountName: ''}
        },
        {
            name: 'Contact',
            fields: {ContactFullName: '', ContactId: ''}
        },
        {
            name: 'User',
            fields: {UserLoginId: '', UserId: ''}
        }
     ];


     jQuery.each(entities, function(index, entity) {
         odlib.entityQuery(entity.name, entity.fields, function(data) {
             console.log(entity.name + ' count = ' + data.length);
         });                 
     });

     
     odlib.entityQuery('Contact', {ContactFullName: '', ContactId: ''}, function(data) {
         console.dir(data);
      });

      odlib.user_login(userName, password, function() {
           var userFields = ['FirstName', 'LastName'];
           console.log('begin user_login');
           odlib.query_user(userFields, function(data) {
               console.dir(data);
           });
           console.log('end user_login');        
       });


*/

