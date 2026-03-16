#include <stdlib.h>
#include <stdio.h>
#include <dirent.h>
#include <errno.h>
#include <stdbool.h>
#include <string.h>
#include <sys/stat.h>
#include <bson/bson.h>
#include <mongoc/mongoc.h>

// two dots to go up a dir
#include "../include/init_template.h"

#ifdef _WIN32
#include <direct.h>
#define mkdir(dir) _mkdir(dir)
#else
#include <sys/types.h>
#endif

#define ARG_BASE -1
#define ORIGIN_FILE ".chz/origin.txt"

bool fetchFromDB(char* link){
    printf("Entered fetchFromDB\n");
    mongoc_cursor_t *cur;
    mongoc_client_t *client;
    mongoc_collection_t *collection;
    bson_t *query, *opts;
    const bson_t *doc;
    bson_error_t error;

    mongoc_init();
    client = mongoc_client_new("mongodb+srv://chizeldb:qpGAJlAbOt6zgEu5@chizel.0dqvas4.mongodb.net/?appName=Chizel");
    if (client == NULL) {
        fprintf(stderr, "Error: failed to create MongoDB client\n");
        mongoc_cleanup();
        return false;
    }
    
    // Test Connection
    if (!mongoc_client_command_simple(client, "admin", BCON_NEW("ping", BCON_INT32(1)), NULL, NULL, &error)) {
        fprintf(stderr, "Error: %s\n", error.message);
        mongoc_client_destroy(client);
        mongoc_cleanup();
        return false;
    } else {
        printf("Successfully connected to MongoDB!\n");
    }

    collection = mongoc_client_get_collection(client, "test", "repositories");   // get table
    query = BCON_NEW("url", BCON_UTF8(link));
    opts = BCON_NEW("limit", BCON_INT64(1));

    cur = mongoc_collection_find_with_opts(collection, query, opts, NULL);   // db.repositories.find({url: link}).limit(1)
    
    if(mongoc_cursor_next(cur, &doc)){              // iterate through results
        char *json = bson_as_json(doc, NULL);       // turn BSON into JSON
        printf("%s\n", json);
        bson_free(json);                            // cleaning lingering data
    }


    
    // cleanup
    mongoc_collection_destroy(collection);          
    bson_destroy(query);
    bson_destroy(opts);
    mongoc_client_destroy(client);
    mongoc_cleanup();
    return true;
}

bool checkOrigin(DIR* p){
    printf("Entered checkOrigin\n");
    FILE *file = fopen(ORIGIN_FILE,"r");
    if(file == NULL){
        printf("Repository doesn't have an origin.\n");
        return false;
    }
    fclose(file);
    return true;  
}

bool checkOrigin2(DIR* p,char* originCheck){
    printf("Entered checkOrigin2\n");
    FILE *file;
    char origin[256];

    printf("originCheck: %s\n", originCheck);

    if (originCheck == NULL || originCheck[0] == '\0') {
        printf("Invalid origin.\n");
        return false;
    }

    file = fopen(ORIGIN_FILE, "r+");
    if (file == NULL) {
        file = fopen(ORIGIN_FILE, "w+");
    }
    if (file == NULL) {
        printf("ERROR OPENING ORIGIN FILE\n");
        return false;
    }

    if (fgets(origin, sizeof(origin), file) == NULL) {
        clearerr(file);
        origin[0] = '\0';
    } else {
        origin[strcspn(origin, "\r\n")] = '\0';
    }

    if(origin[0] == '\0'){
        rewind(file);
        if (fprintf(file, "%s\n", originCheck) < 0) {
            fclose(file);
            return false;
        }
        fflush(file);
        fclose(file);
        return true;
    }

    if(strcmp(origin, originCheck) == 0){
        fclose(file);
        return true;
    }

    printf("Repository already has the origin: %s", origin);
    printf("\nCannot overwrite default origin.");
    fclose(file);
    return false;
}

void fetchFunction(char* link){
    printf("Entered fetchFunction\n");
    if (link == NULL || link[0] == '\0') {
        printf("Invalid link, origin is empty.\n");
        return;
    }

    char* p = strstr(link,"chizel.com/");
    bool status;
    if(p == link){
        status = fetchFromDB(link);
        if(status){
            printf("Successfully fetched from remote repository.\n");
        }else{
            printf("ERROR while fetching from remote repository.\n");
        }
    }else{
        printf("Invalid link, make sure repository is from Chizel.\n");
    }
}

void fetch(int argc, char* argv[]){
    printf("Entered fetch\n");
    const char* dir = ".chz";
    const short perm = 0700;

    DIR* p_dir = opendir(dir);
    switch(argc){
        case(ARG_BASE + 2):    // chz fetch
            if(checkOrigin(p_dir)){
                FILE *file = fopen(ORIGIN_FILE,"r");
                if(file == NULL){
                    printf("ERROR OPENING ORIGIN FILE\n");
                    break;
                }
                char origin[256];
                if (fscanf(file, "%s", origin) != 1) {
                    printf("Origin file is empty.\n");
                    fclose(file);
                    break;
                }
                fetchFunction(origin);
                fclose(file);
            }else{
                printf("This repository doesn't have an origin, please insert an origin via remote repository HTTPS\n");
            }
            break;
        case(ARG_BASE + 3):    // chz fetch <xxx>
            if(checkOrigin2(p_dir, argv[ARG_BASE + 2])){
                fetchFunction(argv[ARG_BASE + 2]);
            }
    }
}

int main(int argc, char* argv[]){
    printf("argc: %i\n", argc);
    int i=0;
    while(argv[i] != NULL){
        printf("argv[%i]: %s\n",i, argv[i]);
        i++;
    }
    fetch(argc, argv);
    return 0;
}