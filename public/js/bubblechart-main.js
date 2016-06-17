/**
 * Created by miriamz on 6/17/16.
 */
window.onload = function() {
    var httpRequest = new XMLHttpRequest();
    var url = "https://data.sfgov.org/resource/4f84-bdsf.json";
    var queryStr = "?$query=SELECT%20sector_detail%20AS%20name," +
        "%20calendar_year%20AS%20year," +
        "%20SUM(%20emissions_mtco2e%20)" +
        "%20as%20data" +
        "%20GROUP%20BY%20name,%20year" +
        "%20ORDER%20BY%20name";


    function getData(json){
        data = [];
        var currNode = null;
        for (var i = 0; i < json.length; i++){
            if (currNode != null){
                if (currNode["name"] != json[i]["name"]){
                    data.push(currNode);
                    currNode = {
                        name: json[i]["name"],
                        values: []
                    };

                }
                currNode["values"].push([json[i]["year"], json[i]["data"]]);

            } else {
                currNode = {
                    name: json[i]["name"],
                    values: []
                };
                currNode["values"].push([json[i]["year"], json[i]["data"]]);
            }
        }
        data.push(currNode);
        for (var j = 0; j < data.length; j++){
            console.log(data[j]);
        }
        createChart(data);
    };



    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200)
        {
            json = JSON.parse(httpRequest.responseText);
            getData(json);
        };
    };

    httpRequest.open("GET", url + queryStr, true);
    httpRequest.setRequestHeader("Accept", "application/json");
    httpRequest.setRequestHeader("X-App-Token", "vDxc98iUa7CmFqS6w8D49vGxu");
    httpRequest.send();
};