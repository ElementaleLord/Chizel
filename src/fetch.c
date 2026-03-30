#include "../include/chizel.c"
#include <dirent.h>
#include <bson/bson.h>
#include <mongoc/mongoc.h>

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#endif

//~ fetch a repository from the database
mongoc_cursor_t* fetchFromDB(char* link)
{
    mongoc_cursor_t *cur;
    mongoc_client_t *client;
    mongoc_collection_t *collection;
    bson_t *query, *opts;
    const bson_t *doc;
    bson_error_t error;
    mongoc_init();
    //keep for testing, restart link + add as backend feature
    client = mongoc_client_new("mongodb+srv://chizeldb:qpGAJlAbOt6zgEu5@chizel.0dqvas4.mongodb.net/?appName=Chizel");
    if (client == NULL)
    {
        printf(FETCH_ERROR_MSG_START"Failed To Create MangoDB Client"MSG_END);
        whatIsTheError();
        mongoc_cleanup();
        return NULL;
    }
    
    //# Test Connection
    if (!mongoc_client_command_simple(client, "admin", BCON_NEW("ping", BCON_INT32(1)), NULL, NULL, &error))
    {
        fprintf(stderr, "Error: %s\n", error.message);
        mongoc_client_destroy(client);
        mongoc_cleanup();
        return NULL;
    }

    collection = mongoc_client_get_collection(client, "test", "repositories");   //# get table
    query = BCON_NEW("url", BCON_UTF8(link));
    opts = BCON_NEW("limit", BCON_INT64(1));

    cur = mongoc_collection_find_with_opts(collection, query, opts, NULL);   //# db.repositories.find({url: link}).limit(1)
    
    /*
    if(mongoc_cursor_next(cur, &doc)){              // iterate through results
        char *json = bson_as_json(doc, NULL);       // turn BSON into JSON
        printf("%s\n", json);
        bson_free(json);                            // cleaning lingering data
    }
    */
    
    // cleanup
    mongoc_collection_destroy(collection);          
    bson_destroy(query);
    bson_destroy(opts);
    mongoc_client_destroy(client);
    mongoc_cleanup();
    return cur;
}

//~ checks for the repository's origin before fetching
bool checkOrigin(char* link)
{
    DIR* p_dir = opendir(CHZ_PATH);
    if(!checkChz()){
        printf(FETCH_ERROR_MSG_START"Not in a .chz directory"MSG_END);
        whatIsTheError();
        return false;
    }
    FILE *file = fopen(ORIGIN_FILE,"r");
    if(file == NULL)
    {
        printf(FETCH_ERROR_MSG_START"Repository Origin Not Found"MSG_END);
        whatIsTheError();
        return false;
    }

    if(link == NULL)
    {
        // check if origin exists
        char line[256];
        rewind(file);
        fgets(line,sizeof(line),file);
        if(line[0] == '\0')
        {
            // NO ORIGIN
            printf(FETCH_ERROR_MSG_START"Repository Doesn't Have An Origin"MSG_END);
            whatIsTheError();
            return false;
        }
        // ORIGIN EXISTS so returns true
        return true;
    }else{
        // compare file content with the argument
        char line[256];
        rewind(file);
        fgets(line,sizeof(line),file);
        line[strcspn(line, "\n")] = '\0';
        if(strcmp(line,link) == 0){
            return true;
        }else{
            return false;
        }
    }
    fclose(file);
}

//~ checks if the repository has an origin before fetching
bool checkOriginURL(char* originCheck)
{
    if(checkChz())
    {
        //check if origin = link
        if(checkOrigin(originCheck)){
            return true;
        }else{
            printf(FETCH_ERROR_MSG_START"Can't perform action in a .chz directory"MSG_END);
            whatIsTheError();
            return false;
        }
    }
    FILE *file;
    char origin[256];

    if (originCheck == NULL || originCheck[0] == '\0') 
    {
        printf(FETCH_ERROR_MSG_START"Invalid Origin"MSG_END);
        whatIsTheError();
        return false;
    }

    file = fopen(ORIGIN_FILE, "rw");
    if (file == NULL) 
    {
        printf(FETCH_ERROR_MSG_START"Can Not Open Repository Origin"MSG_END);
        whatIsTheError();
        return false;    
    }

    if (fgets(origin, sizeof(origin), file) == NULL) 
    {
        clearerr(file);
        origin[0] = '\0';
    }
    else 
    {
        origin[strcspn(origin, "\r\n")] = '\0';
    }

    if(origin[0] == '\0')
    {
        rewind(file);
        if (fprintf(file, "%s\n", originCheck) < 0) 
        {
            fclose(file);
            return false;
        }
        fflush(file);
        fclose(file);
        return true;
    }

    if(strcmp(origin, originCheck) == 0)
    {
        fclose(file);
        return true;
    }

    printf(FETCH_REPORT_MSG_START"Repository Origin %s Already Exists"MSG_END, origin);
    printf(FETCH_ERROR_MSG_START"Can Not Overwrite Default Origin"MSG_END);
    whatIsTheError();
    fclose(file);
    return false;
}

//~ fetchs data from the database
mongoc_cursor_t* fetchFunction(char* link)
{
    if (link == NULL || link[0] == '\0') 
    {
        printf(FETCH_ERROR_MSG_START"Invalid Link, Origin Is Empty"MSG_END);
        whatIsTheError();
        return NULL;
    }

    char* p = strstr(link,"chizel.com/");
    mongoc_cursor_t* status;
    if(p == link)
    {
        status = fetchFromDB(link);
        if(status != NULL)
        {
            printf(FETCH_REPORT_MSG_START"Successfully Fetched From Remote"MSG_END);
            return status;
        }
        else
        {
            printf(FETCH_ERROR_MSG_START"Can Not Fetch From Remote"MSG_END);
            whatIsTheError();
            return NULL;
        }
    }
    else
    {
        printf(FETCH_ERROR_MSG_START"Invalid link, make sure repository is from Chizel"MSG_END);
        whatIsTheError();
        return NULL;
    }
}

//~ main runner function used to determine case and call appropriate function
mongoc_cursor_t* fetch(int argc, char* argv[])
{
    
    switch(argc)
    {
        //@ chz fetch
        case(ARG_BASE + 2):    
            //% chz fetch
            if(checkOrigin(NULL))
            {
                FILE *file = fopen(ORIGIN_FILE,"r");
                if(file == NULL)
                {
                    printf(FETCH_ERROR_MSG_START"ERROR OPENING ORIGIN FILE"MSG_END);
                    whatIsTheError();
                    return NULL;
                    break;
                }
                char origin[256];
                rewind(file);
                fgets(origin, sizeof(origin), file);
                fclose(file);
                return fetchFunction(origin);
            }
            else
            {
                printf(FETCH_ERROR_MSG_START"This Repository Does Not Have An Origin"MSG_END);
                whatIsTheError();
                printf(FETCH_REPORT_MSG_START"Please Insert An Origin Via Remote Repository HTTPS"MSG_END);
                return NULL;
            }
            break;
        //@ chz fetch <arg>
        case(ARG_BASE + 3):    
            //% chz fetch <link>
            if(checkOriginURL(argv[ARG_BASE + 2]))
            {
                return fetchFunction(argv[ARG_BASE + 2]);
            }
            break;
        default:
            printf(CHZ_ERROR_MSG_START"Invalid Command"MSG_END);
            return NULL;
            break;
    }
}

int main(int argc, char* argv[])
{
    fetch(argc, argv);
    return 0;
}