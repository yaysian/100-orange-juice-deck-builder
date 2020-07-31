$(document).ready(function() {
    //INITIALIZATION
    //GET CARD DATA FROM GOOGLE SHEETS

    var cards = [];
    var deck = [];

    getCardData().done(function() {
        console.log(cards)
        console.log("Loading UI elements.")
        initPage();
        $("#mainBody").fadeIn();
    });

    function getCardData(){
        var dfrd = $.Deferred();
        var url = "https://docs.google.com/spreadsheet/pub?key=1x2rE0yK_Bn9bVOshuDrUPtcXjP7rLgMF-48pCHkwcJw&output=html";
        var googleSpreadsheet = new GoogleSpreadsheet();
        googleSpreadsheet.url(url);
        googleSpreadsheet.load(function(result) {
        for (var i = 0; i < result.items.length; i++){
            var current_object = result.items[i];
            var obj = {
                id: parseInt(current_object.id),
                name: current_object.name,
                type: current_object.type,
                level: parseInt(current_object.level),
                cost: parseInt(current_object.cost),
                limit: parseInt(current_object.limit),
                rarity: parseInt(current_object.rarity),
                desc: decodeURIComponent(current_object.desc),
                flavor: decodeURIComponent(current_object.flavor),
                thumb: current_object.thumb,
                image: current_object.image,
                set: current_object.set,
            }
            cards.push(obj);
        }
        dfrd.resolve();
        });
        return $.when(dfrd).done(function (){
            console.log('Cards are done loading.');
        }).promise();
        }
        function initPage(){
        new ClipboardJS('.btn');

        if(window.location.href.indexOf("?deck=") > -1) {
            var url_query = getUrlVars()['deck'];
            url_query = atob(url_query);
            var hashes = url_query.split('&');
            var url_deck_name = decodeURIComponent(hashes[0].split('=')[1]);
            var url_deck = decodeURIComponent(hashes[1].split('=')[1]);
            deck = JSON.parse(url_deck);
            updateDeckCount();
            updateDeckName(url_deck_name);
            updateMetadata(url_deck_name);
        }
        else {
            deck = [null, null, null, null, null, null, null, null, null, null]
        }

        var deck_div = $("#deck")
        for (var i = 0; i < 10; i++) {
            if (deck[i] == null){
                var deck_str = "<div class=\"ojdeck\" id=\"deck"+i+"\">"+"<img class=\"center\" src=\"images/card_mini.png\"></div>"
            }
            else {
                var deck_str = "<div class=\"ojdeck\" id=\"deck"+i+"\">"+"<img class=\"center\" src=\""+cards[deck[i]].thumb+"\"></div>"
            }
            deck_div.append(deck_str);
            var decknum_str = "#deck"+i
            var current_deck = $(decknum_str)
            current_deck.data("pos", i)
            if (deck[i] != null) {
                current_deck.data("id", cards[deck[i]].id)
            }
        }

        var cards_div = $("#cards");
        for (var i = 0; i < cards.length; i++)
            {
                var div_str = "<div class=\"ojcard\" id=\"card"+i+"\">"+"<img class=\"center\" src=\""+cards[i].thumb+"\"></div>"
                cards_div.append(div_str);
                var card_str = "#card"+i
                var current_card = $(card_str)
                current_card.data("id", cards[i].id)
            }
    //FUNCTIONS
    function updateMetadata(deck_name) {
        $('title').text(deck_name+' - 100%OJDeckBuilder')
        $('meta[property="og:title"]').attr('content', deck_name)
    }
    function updateDeckName(deck_name) {
        var deck_name_div = $("#deck-name")
        console.log(deck_name_div)
        var text = $("<h1 class=\"display-4\" id=\"deck-name\">"+deck_name+"</h1>");
        deck_name_div.replaceWith(text)
    }
    function getUrlVars()
    {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
    };
    function findFirstNullInDeck(){
        var result = null;
        for(var i = 0; i < 10; i++) {
            if (deck[i] == null) {
                result = i;
                break;
            }
        }
        return result;
    };
    function checkForLimit(limit,card_id){
        var result = false;
        var count = 0;
        for(var i = 0; i < 10; i++) {
            if (deck[i] == card_id) {
                count++;
            }
        }
        if (count == limit){
            result = true;
        }
        return result;
    };
    function updateDeckCount() {
        count = 0;
        for(var i = 0; i < 10; i++) {
            if (deck[i] != null) {
                count++;
            }
        }
        console.log(deck)
        count_div = $("#deck-count");
        count_div.text("Deck ("+count+"/10)")
    }
    //LISTENERS
    $(document).on('click', "#edit", function() {
        var deck_name = $("#deck-name").text();
        var text_area = $("<input type=\"text\" class=\"form-control\" id=\"deck-name-input\" value=\""+deck_name+"\">");
        var new_btn = $("<button type=\"button\" id=\"confirm\" class=\"btn btn-oj\">Confirm</button>")
        $("#deck-name").replaceWith(text_area)
        $("#edit").replaceWith(new_btn)
    });
    $(document).on('click', "#confirm", function() {
        var deck_name = $("#deck-name-input").val();
        var text = $("<h1 class=\"display-4\" id=\"deck-name\">"+deck_name+"</h1>");
        var new_btn = $("<button type=\"button\" id=\"edit\" class=\"btn btn-oj\">Edit</button>");
        $("#deck-name-input").replaceWith(text);
        $("#confirm").replaceWith(new_btn);
    });
    $(document).on('mouseenter', ".ojcard, .ojdeck", function(){
        if ($(this).data("id") != null) {
            var stats_div = $('#stats');
            stats_div.empty();
            var card_data = cards[$(this).data("id")];
            var name = card_data.name;
            var type = card_data.type;
            var desc = card_data.desc;
            var image = card_data.image;
            var type_badge = ""
            switch(type){
                case "Boost":
                    type_badge="success"
                    break;
                case "Battle":
                    type_badge="battle"
                    break;
                case "Trap":
                    type_badge="trap"
                    break;
                case "Event":
                    type_badge="primary"
                    break;
                case "Gift":
                    type_badge="gift"
                    break;
            }
            var stats_html = "<h3>"+name+" <span class=\"badge badge-"+type_badge+"\">"+type+"</span></h3><p>"+desc.replace("%20"," ")+"</p><div style=\"text-align:center\"><img class=\"center\" src=\""+image+"\"></div>";
            stats_div.append(stats_html);
        }
    });
    $(document).on('click',".ojcard", function (){
        var card_array = cards;
        var card_id = $(this).data("id")
        var card_data = card_array[card_id]
        var first_num = findFirstNullInDeck();
        var first_available_card = $("#deck"+first_num);
        var deck_str = $("<img class=\"center\" src=\""+card_data.thumb+"\">");

        if (!checkForLimit(card_data.limit, card_data.id)) {
        first_available_card.empty();
        first_available_card.append(deck_str);
        first_available_card.data("id", $(this).data("id"));
        deck[first_num] = $(this).data("id");;
        updateDeckCount();
        }
    });
    $(document).on('click',".ojdeck", function (){
        if ($(this).data("id") != null) {
            var picked_deck = $(this);
            var deck_str = $("<img class=\"center\" src=\"images/card_mini.png\">");
            var deck_pos = $(this).data("pos")

            picked_deck.empty();
            picked_deck.append(deck_str);
            picked_deck.data("id",null)
            deck[deck_pos] = null;
            updateDeckCount();
        }
    });
    $(document).on('click', "#export", function () {
        var url = window.location.href;
        if (url.indexOf("?")) {
            url = url.split('?')[0];
        }
        console.log(url)
        console.log(decodeURIComponent(JSON.stringify(deck)))
        var query_object = {
            name: ($("#deck-name").text() != null) ? $("#deck-name").text() : $("deck-name-input").val(),
            deck: JSON.stringify(deck)
        }
        var query_string = decodeURIComponent($.param(query_object));
        query_string = btoa(query_string);
        var complete_url = url+'?deck='+query_string;
        $("#exportUrlInput").val(complete_url)
    });
    $(function () {
        $('[data-toggle="popover"]').popover()
    });
    $('.popover-dismiss').popover({
        trigger: 'focus'
    });
}
});
