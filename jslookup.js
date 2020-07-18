var recordtypes = ["a", "mx", "ns"];
var regex = RegExp('[a-zA-Z]');
var jaguarservers;

function importConfig(){
  var url = "config.json"
  $.ajax({
    url: url,
    complete: function(response) {
      jaguarservers = JSON.parse(response.responseText);
    },
    error: function() {
    }
  })
}

function getRecord() {
  //clears output table, verifies input and record type, sends to appropriate function
  $('#output').html(`<div class="pure-u-1-4"> <strong>Record type</strong> </div>
	<div class="pure-u-1-4"> <strong>Value</strong> </div>
	<div class="pure-u-1-4"> <strong>Service type</strong> </div>
	<div class="pure-u-1-4"> <strong>Jaguar Server</strong> </div>`);
  var type = $("input[name='type']:checked").val();
  var hostname = $('#input').val();

  if (!hostname || hostname === "" || hostname.length === 0 || !(hostname.includes("."))) {
    $('#output').html("Please input a valid domain");
  } else {
    if (type == "all") {
      getAllRecords(hostname);
    } else {
      getSingleRecord(hostname, type);
    }
  }
}

function formatOutput(result) {
  //formats output with the information provided
  var output = `<div class="pure-u-1-4"> ${result["type"]} </div>
<div class="pure-u-1-4" id="${result["type"]}"> ${result["record"]} </div>
<div class="pure-u-1-4"> ${result["service"]} </div>
<div class="pure-u-1-4"> ${result["jaguar"]} </div>
  `
  $('#output').append(output);
  reloadCss();
}

function getSingleRecord(hostname, type) {
  //creates dictionary with record information and sends to the output formatter

  var url = "https://dns.google.com/resolve?name=".concat(hostname, "&type=", type)
  $.ajax({
    url: url,
    complete: function(response) {
      var answer = JSON.parse(response.responseText)["Answer"];

      if (answer) {
        for (i = 0; i < answer.length; i++) {
          var jaguar = false;
          var result = answer[i]["data"];
		  var service = ""
		  
		  switch(type){
			case "a":
				service = "Web hosting";
				if (hostname.includes('mail.')) {
					service = "Email hosting";
				}
				break;
			case "mx":
				service = "Email host";
				//mx records contain priority. For this purpose, I don't care
				result = result.split(" ")[1];
				if (result in jaguarservers[type]){
					service = "Spam filter";
					getMailServer(hostname);
				}
				break;
			case "ns":
				service = "Nameserver";
				break;
		  }
			
          if (result in jaguarservers[type]) {
            jaguar = jaguarservers[type][result];
          }
          record = { 
            "type": type,
            "record": result,
			"service": service,
            "jaguar": jaguar
          }
          formatOutput(record);
        }
      }
    },
    error: function() {
      record = {
        "type": "Error",
        "record": "Error",
        "jaguar": false
      };
      formatOutput(record);
    }
  })
}

function getAllRecords(hostname) {
  //loops through record types and gets each record
  for (i = 0; i < recordtypes.length; i++) {
    getSingleRecord(hostname, recordtypes[i]);
  }
}

function getMailServer(hostname) {
	var type = "a";
	var url = "https://dns.google.com/resolve?name=mail.".concat(hostname, "&type=", type)
	$.ajax({
		url: url,
		complete: function(response) {
			var answer = JSON.parse(response.responseText)["Answer"];

			if (answer) {
			  for (i = 0; i < answer.length; i++) {
				var result = answer[i]["data"];
				var service = "Email server";
				var jaguar = jaguarservers["a"][result];

				if(!regex.test(result) && !$('#mail').length){
					record = {
						"type": "mail",
						"record": result,
						"service": service,
						"jaguar": jaguar
					}
					formatOutput(record);
			  }
			}
		}},
		error: function() {
		}
	  })
}


function reloadCss()
{
    var links = document.getElementsByTagName("link");
    for (var cl in links)
    {
        var link = links[cl];
        if (link.rel === "stylesheet")
            link.href += "";
    }
}