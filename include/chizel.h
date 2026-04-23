//~ indicates the explanation of a near (usually below) function
//! <:> indicates some MAJOR ERROR or some MISSING portion that need be done
//@ indicates important distinctions
//# a comment used to explain the existence of some variables (mainly for P:)
//$ <:> indicates a todo task of some sort (less urgent version of //!), careful while removing
//% indicates more minor distinctions
//? <:> indicates questions
//^ <:> indicates responses (usually placed under a //?)
//& NOTE-# <:> indicates important NOTES
//* <:> indicates changes or REALLY IMPORTANT SHIT
/// indicates redacted but still needed comment

/*
also try to respect the "formatting" of each one
if one above has <:> in it use the below keys to id who saying that 
P: is ElementaleLord
O: is Voltro
B: is Cloak
F: is Faust
//& NOTE-1 P: if more that one <:> then only count the first one to the comment
//& NOTE-1 P: others just indicate comment maker taklking to or about someone else
*/

#include <time.h>                   //# header
#include <stddef.h>                 //# header
#include <string.h>                 //# all files 
#include <stdbool.h>                //# all files
#include <stdio.h>                  //# all files
#include <stdlib.h>                 //# all files

#ifndef CHIZEL_H
#define CHIZEL_H

    //& LCS Algorithm
    typedef struct
    {
        char** content;
        size_t capacity;
        size_t size;
    } Lines;

    int lcs(Lines s1, Lines s2);



    //& General

    //~ Paths
    #define CHZ_PATH ".chz"
    #define BRANCHES_PATH ".chz/refs/heads/"
    #define REFS_PATH ".chz/refs"
    #define REFS_HEADS_PATH ".chz/refs/heads"
    #define REFS_TAGS_PATH ".chz/refs/tags"
    #define OBJECTS_PATH ".chz/objects"
    #define HEAD_PATH ".chz/HEAD"
    #define INDEX_PATH ".chz/index"
    #define CONFIG_PATH ".chz/config"
    #define DESC_PATH ".chz/description"
    #define STAGING_AREA_PATH ".chz/index"
    #define LOGS_PATH ".chz/logs/"
    #define DATA_PATH ".chz/data"
    #define PACK_PUSH_PATH ".chz/objects/compressed"
    #define PACK_PULL_PATH ".chz/objects/restored"
    #define ORIGIN_FILE  ".chz/origin"
    #define IGNORE_FILE "../.gitignore"

    #define dynamic_append(d_arr, val)\
        do{\
            if(d_arr.size >= d_arr.capacity)\
            {\
                if(d_arr.size == 0) d_arr.capacity = 256;\
                else d_arr.capacity *= 2;\
                void *temp = realloc(d_arr.content, d_arr.capacity * sizeof(*d_arr.content));\
                if(!temp)\
                {\
                    perror("realloc failed");\
                    exit(1);\
                }\
                d_arr.content = temp;\
            }\
            d_arr.content[d_arr.size++] = val;\
        }while(0)

    //~ Offsets
    #define ARG_BASE -1

    //~ Permissions
    #define DEF_PERM 0700
    #define ALL_PERM 0755
    
    //~ Autism
    #define  CHZ_ERROR_MSG_START "CHZ ERROR: "
    #define  ADD_ERROR_MSG_START "ADD ERROR: "
    #define  BRANCH_ERROR_MSG_START "BRANCH ERROR: "
    #define  CHECKOUT_ERROR_MSG_START "CHECKOUT ERROR: "
    #define  CLONE_ERROR_MSG_START "CLONE ERROR: "
    #define  COMMIT_ERROR_MSG_START "COMMIT ERROR: "
    #define  DESCRIBE_ERROR_MSG_START "DESCRIBE ERROR: "
    #define  FETCH_ERROR_MSG_START "FETCH ERROR: "
    #define  GREP_ERROR_MSG_START "GREP ERROR: "
    #define  INIT_ERROR_MSG_START "INIT ERROR: "
    #define  LOG_ERROR_MSG_START "LOG ERROR: "
    #define  MERGE_ERROR_MSG_START "MERGE ERROR: "
    #define  PULL_ERROR_MSG_START "PULL ERROR: "
    #define  PUSH_ERROR_MSG_START "PUSH ERROR: "
    #define  STATUS_ERROR_MSG_START "STATUS ERROR: "
    #define  TAG_ERROR_MSG_START "TAG ERROR: "
    
    #define  CHZ_REPORT_MSG_START "CHZ REPORT: "
    #define  ADD_REPORT_MSG_START "ADD REPORT: "
    #define  BRANCH_REPORT_MSG_START "BRANCH REPORT: "
    #define  CHECKOUT_REPORT_MSG_START "CHECKOUT REPORT: "
    #define  CLONE_REPORT_MSG_START "CLONE REPORT: "
    #define  COMMIT_REPORT_MSG_START "COMMIT REPORT: "
    #define  DESCRIBE_REPORT_MSG_START "DESCRIBE REPORT: "
    #define  FETCH_REPORT_MSG_START "FETCH REPORT: "
    #define  GREP_REPORT_MSG_START "GREP REPORT: "
    #define  INIT_REPORT_MSG_START "INIT REPORT: "
    #define  LOG_REPORT_MSG_START "LOG REPORT: "
    #define  MERGE_REPORT_MSG_START "MERGE REPORT: "
    #define  PULL_REPORT_MSG_START "PULL REPORT: "
    #define  PUSH_REPORT_MSG_START "PUSH REPORT: "
    #define  STATUS_REPORT_MSG_START "STATUS REPORT: "
    #define  TAG_REPORT_MSG_START "TAG REPORT: "

    #define MSG_END ".\n"


    //~ Functions
    bool checkForFile(char *file);
    int checkChz();
    char* getHead();
    int checkStagingArea();
    FILE* getStagingArea();
    Lines readStagingArea();
    bool clearStagingArea();
    void whatIsTheError();
    bool checkIgnore(char* file, const char* relative_path);
    const char* makeRelativePath(const char* fullpath, const char* root_path);
    Lines read_file(FILE* f);
    void reverseString(char* s);
    int addLogEntry();
    char* newlineFake(char* msg);
    char* newlineRestoreShort(char* message);
    char* newlineRestore(char* message);



    //& DType Template
    struct AccountChz;
    struct RepositoryChz;
    struct PullRequest;

    typedef enum PullRequestCategory PullRequestCategory;
    typedef enum PullRequestStatus PullRequestStatus;

    typedef struct AccountChz AccountChz;
    typedef struct RepositoryChz RepositoryChz;
    typedef struct PullRequest PullRequest;

    
    enum PullRequestCategory
    {
        OPEN, 
        CLOSED
    };

    enum PullRequestStatus
    {
        ACCEPTED, 
        REJECTED, 
        APPLIED, 
        NUL
    };

    //~ Account settings data type
    struct AccountChz
    {
        char* email;
        long password;
        char* username;
        char* phone;
    };

    //~ General data type for a Repository
    struct RepositoryChz
    {
        char repoName[64];
        char repoURL[512];
        unsigned char* data;
        size_t dataLen;
    };

    //~ General data type for a PullRequest
    struct PullRequest
    {
        char* pullRequestName;
        char* pullRequestMsg;
        time_t createDate;
        time_t submitDate;
        time_t resolveDate;
        PullRequestCategory pullReqCat;
        PullRequestStatus pullReqStatus;
    };



    //& Init Template
    //~ File and content pair
    typedef struct
    {
        const char* path;
        const char* data;
    }TemplateValue;

    //~ .chz dir template
    static const TemplateValue REPO_TEMPLATE[] =
    {
        {CHZ_PATH,                NULL},
        {REFS_PATH,               NULL},
        {REFS_HEADS_PATH,         NULL},
        {REFS_TAGS_PATH,          NULL},
        {OBJECTS_PATH,            NULL},
        {PACK_PUSH_PATH,          NULL},
        {PACK_PULL_PATH,          NULL},
        {LOGS_PATH,               NULL},
        {DATA_PATH,               NULL},
        {HEAD_PATH,               "refs/heads/main\n"},
        {INDEX_PATH,              ""},
        {CONFIG_PATH,             "[core]\n\trepositoryformatversion = 0\n"},
        {DESC_PATH,               "Unnamed repository\n"},
        {".chz/refs/heads/main",  "0000000000000000000000000000000000000000\n"},
        {".chz/logs/main.log",    ""},
        {".chz/data/main",        NULL}
    };

    static const size_t REPO_TEMPLATE_SIZE = sizeof(REPO_TEMPLATE) / sizeof(REPO_TEMPLATE[0]);



    //& Commit Methods
    //Struct to read the content of a commit
    typedef struct
    {
        char tree_hash[65];
        char parent_hash[65];
        void* data;
        char* author;       // username & email
        char* message;
        time_t commit_date;
    }CommitObject;

    int get_object_path(char* out_path);
    int load_commit_object(FILE* obj_ptr, CommitObject* out_commit);
    void walk_history(const char* start_hash);



    //& Packed Files
    #define CHZ_PUSH 0
    #define STORE_DATA 1

    typedef struct{
        unsigned int pathLen;
        unsigned long long blobLen;
        unsigned int isDir;
    }Blob;

    int zipDirectory(int mode);
    int restorePack(const char* pack_path, const char* output_path);
    int removeDir(const char* dirPath);
    
#endif
