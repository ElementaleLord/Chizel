1. mongosh              // turns on mongoshell
2. show dbs             // shows non-empty databases
3. use <dbname>         // switches the current working directory into the specified db, if non-existent, creates and proceeds
4. cls                  // clears the terminal
5. show collections     // shows collections (tables)

====================================================================================================================================

1. JSON can use the following as values: int, string, double, bool, date, null, array[], object (json)
2. To use a date value, type <new Date("2026-11-18")>

====================================================================================================================================

0. x = db.<collection>                              // faster and easier
1. db.createCollection("<name>")                    // creates a new table
2. db.<collection>.drop()                           // deletes the table
3. db.dropDatabase()                                // deletes the currently active database
   
4. x.insertOne(<JSON>)                              // adds a document/dataRow
5. x.insertMany([<JSON>,<JSON>])                    // adds multiple dataRows
6. x.find()                                         // displays the data of said collection
7. x.updateOne({<filter>}, {<update>})
8. x.updateMany({<filter>}, {<update>})
9.  x.deleteOne({<filter>})
10. x.deleteMany({<filter>})
11. x.createIndex({<field>:[1/-1]})                 // creates indexes based on the sorting order of the field as format "<field>_<order>"
12. x.getIndexes()                                  // returns all indexes, including the _id__ index
13. x.dropIndex("<index_name>")                     // deletes the specified index

====================================================================================================================================

1. db.createCollection("<name>", {capped:true})                     // creates a table with a limit, unusable alone
2. db.createCollection("<name>", {size: <bytes>})                   // specifies the size limit of the table in BYTES
3. db.createCollection("<name>", {max: <int>})                      // specifies the amount limit of rows

====================================================================================================================================

1. x.find().sort({<sortingField>:[1/-1]})           // 1 sorts aphabetically, -1 in reverse alphabetical
2. x.find().limit(<int>)                            // limits how many results are returned, comboes with .sort()
3. x.find({<specificField>:<wantedValue>})          // returns results depending on the filter(s)
4. x.find({<query>}, {<field>:[true/false],..})     // limits which fields to return with the results (_id will be given regardless)

====================================================================================================================================

1. for the update parameter:
    - $set: {<field>}                               // changes the value or adds the field
    - $unset: {<field>:""}                          // deletes the field from the object, MUST use ""

2. for the filter parameter:
    - {<field>:{$exists:true}}                      // if the field exists
    - {<field>:{$ne:<value>}}                       // not equal
    - {<field>:{$lt:<value>}}                       // less than
    - {<field>:{$lte:<value>}}                      // less than or equal to
    - {<field>:{$gt:<value>}}                       // greater than
    - {<field>:{$gte:<value>}}                      // greater than or equal to
    - 
    - {<field>:{$in:[<values>]}}                    // value exists in the array of values
    - {<field>:{$nin:[<values>]}}                   // value doesnt exists in the array of values
    - 
    - {$and:[{<filter1>}, {<filter2>},..]}          // logical operator AND
    - {$or:[{<filter1>}, {<filter2>},..]}           // logical operator OR
    - {$nor:[{<filter1>}, {<filter2>},..]}          // logical operator NOR
    - {<field>:{$not:{<filter>}}}                   // logical operator NOT