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
            pub_msg.append('<p>Happily iterating over all ' + count + ' entries took ' + (endTime - startTime) + ' ms</p>');
        }

        var date = new Date();
        var startTime = date.getTime();
        customers.iterate(onItem, {
            onEnd: onEnd,
            onError: onError
        });
    }

    function insertMultipleSources() {
        clearOutput();
        var pub_msg = $('#pub-msg');

        var qtyVal = $('#nb-insertions').val();
        var qty = parseInt(qtyVal);

        var i = 0;
        var data = [];
        while(i < qty){
            var randomData = new Buffer('iVBORw0KGgoAAAANSUhEUgAAA', 'base64')
            data.push({ customId:"id" + i, data: randomData})
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
        customers.putBatch(data, onSuccess, onError);
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
                    list_item.append(' - ' + item.data);

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
            insertMultipleSources();
        });


    }

    openDb();
    addEventListeners();

})();