var crypto = require('crypto');

(function () {
    var customers;

    function openDb() {
        console.log("openingDb ...");
        customers = new IDBStore({
            dbVersion: 4,
            storeName: 'customer',
            keyPath: 'id',
            autoIncrement: true,
            onStoreReady: function(){
                console.log('Store ready!');
            },
            indexes: [
                { name: 'customId' }
            ]
        });
    }

    function clearOutput(){
        var pub_msg = $('#pub-msg');
        pub_msg.empty();
        var pub_list = $('#pub-list');
        pub_list.empty();
    }

    function clearAllSources() {
        var onSuccess = function(){
            console.log('Cleared all sources');
        }
        var onError = function(error){
            console.log('Error clearing all sources');
        }

        console.log("Trying to clear all sources");
        customers.clear(onSuccess, onError);
    }

    function displayAllSources() {
        clearOutput();
        var pub_msg = $('#pub-msg');
        var pub_list = $('#pub-list');

        /*var onCountSuccess = function(count){
         console.log(count)
         }

         customers.count(onCountSuccess);*/

        var count = 0;
        var onItem = function(item){
            count++;
            /*if(item){
             var list_item = $('<li>' +
             '[id: ' + item.id + '] '+
             '(customId: ' + item.customId + ') '+
             '</li>');
             if (item.data != null)
             list_item.append(' - ' + item.data);

             pub_list.append(list_item);
             }*/
        }
        var onError = function(error){
            console.log('Something went wrong!', error);
        }
        var onEnd = function(){
            console.log("end");
            var date = new Date();
            var endTime = date.getTime();
            pub_msg.append('<p>Iterating over all ' + count + ' entries took ' + (endTime - startTime) + ' ms</p>');
        }

        var date = new Date();
        var startTime = date.getTime();
        customers.iterate(onItem, {
            onEnd: onEnd,
            onError: onError
        });
    }

    function randomValueBase64 (len) {
        return crypto.randomBytes(Math.ceil(len * 3 / 4))
            .toString('base64')   // convert to base64 format
            .slice(0, len)        // return required number of characters
            .replace(/\+/g, '0')  // replace '+' with '0'
            .replace(/\//g, '0'); // replace '/' with '0'
    }

    function insertMultipleSources(with10k) {
        clearOutput();
        var pub_msg = $('#pub-msg');

        var qtyVal = $('#nb-insertions').val();
        var qty = parseInt(qtyVal);

        if(with10k){
            //13654 characters will contain 10k of data (33% overhead)
            var data = randomValueBase64(13645);
        }
        else{
            var data = {"name":"Briarcliff Manor- Caney Brook tributary",
                        "type":"Surface","code":"52203","user":"tbrown@riverkeeper.org","_id":"d2c3c6d1857444898ebdc4922831faba",
                        "geo":{"type":"Point","coordinates":[-73.83677918,41.13323049]},
                        "photos":[{"id":"7e1e11cfd55e45ad88da4e5643f8a934"},{"id":"9e81cb6fe3b0465d9e067f58b9e3c3e6"},{"id":"7682075651ca4d2ab192747836f9d534"},{"id":"798af096e0414783a21e0985647ce4ad"},
                            {"id":"90d33333e69145999e47bb30d363cdc8"},{"id":"580c617161a4413fa776facd0b7870b3"},{"id":"6ad740c360554b908b0594becdd6fa4a"}],
                        "modified":{"on":"2014-01-10T18:17:49.687Z","by":"tbrown@riverkeeper.org"},"_rev":12,"desc":"PR-CB-0.77","org":"RiverkeeperNY"};
        }

        var i = 0;
        var entries = [];
        while(i < qty){
            entries.push({ customId:"id" + i, data: data})
            i++;
        }

        var onSuccess = function (){
            var date = new Date();
            var endTime = date.getTime();
            pub_msg.append('<p>Inserted ' + qty + ' elements in: ' + (endTime - startTime) + ' ms</p>');
        }

        var onError = function (error){
            console.log('Something went wrong!', error);
        }

        var date = new Date();
        var startTime = date.getTime();
        customers.putBatch(entries, onSuccess, onError);
    }

    function displayQueriedSource(keyRange) {
        var pub_msg = $('#pub-msg');
        pub_msg.empty();
        var pub_list = $('#pub-list');
        pub_list.empty();

        var onItem = function(item) {
            if(item){
                var list_item = $('<li>' +
                    '[id: ' + item.id + '] '+
                    '(customId: ' + item.customId + ') '+
                    '</li>');
                if (item.data != null)
                    list_item.append(' - ' + item.data );

                pub_list.append(list_item);
            }
            else{
                var date = new Date();
                var endTime = date.getTime();
                pub_msg.append('<p>The query took ' + (endTime - startTime) + ' ms</p>');
            }
        }

        var date = new Date();
        var startTime = date.getTime();
        customers.iterate(onItem, {
            index: 'customId',
            keyRange: keyRange,
            //order: 'ASC',
            filterDuplicates: false,
            writeAccess: false
        });
    }

    function displaySpecificSource() {
        var customId = $('#specific-id').val();
        console.log("displaySpecificSource: " + customId);

        var myKeyRange = customers.makeKeyRange({
            only: customId
        });

        displayQueriedSource(myKeyRange);
    }

    function displayRangeSources() {
        var startingId = $('#starting-id').val();
        var stoppingId = $('#ending-id').val();

        console.log("displayRangeSource: " + startingId + " to " + stoppingId);

        var myKeyRange = customers.makeKeyRange({
            lower: startingId,
            excludeLower: false,
            upper: stoppingId,
            excludeUpper: true
        });

        displayQueriedSource(myKeyRange);
    }

    function addSource(customId, data){
        var obj = { customId: customId, data: data };

        var onSuccess = function(id){
            console.log('InsertId is: ' + id);
        }
        var onError = function(error){
            console.log('Something went wrong!', error);
        }

        customers.put(obj, onSuccess, onError);
    }

    function displayActionSuccess(msg) {
        msg = typeof msg != 'undefined' ? "Success: " + msg : "Success";
        $('#msg').html('<span class="action-success">' + msg + '</span>');
    }

    function displayActionFailure(msg) {
        msg = typeof msg != 'undefined' ? "Failure: " + msg : "Failure";
        $('#msg').html('<span class="action-failure">' + msg + '</span>');
    }

    function resetActionStatus() {
        console.log("resetActionStatus ...");
        $('#msg').empty();
        console.log("resetActionStatus DONE");
    }

    function addEventListeners() {
        console.log("addEventListeners");

        $('#add-button').click(function(evt) {
            console.log("add ...");

            var id = $('#source-id').val();
            var data = $('#source-data').val();
            if (!id || !data) {
                displayActionFailure("Required field(s) missing");
                return;
            }

            addSource(id, data);
        });

        var searchListButton = $('#search-list-button');
        searchListButton.click(function(evt) {
            displayAllSources();
        });

        var searchButton = $('#search-specific-button');
        searchButton.click(function(evt) {
            displaySpecificSource();
        });

        var searchRangeButton = $('#search-range-button');
        searchRangeButton.click(function(evt) {
            displayRangeSources();
        });

        var clearAllButton = $('#clear-all-button');
        clearAllButton.click(function(evt) {
            clearAllSources();
        });

        var multipleInsertsButton = $('#multiple-inserts-button');
        multipleInsertsButton.click(function(evt) {
            insertMultipleSources(false);
        });

        var multipleInsertsButton2 = $('#multiple-inserts-button2');
        multipleInsertsButton2.click(function(evt) {
            insertMultipleSources(true);
        });
    }

    openDb();
    addEventListeners();

})();